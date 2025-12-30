import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Stripe SDK not available in Node 14, so we verify manually
import crypto from 'crypto'

interface StripeWebhookBody {
  id: string
  type: string
  data: {
    object: {
      id: string
      customer_email: string
      customer_details: {
        email: string
        name: string
        phone?: string
      }
      metadata: {
        tier?: string
      }
      amount_total: number
    }
  }
}

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body for signature verification
  },
}

// Read raw body for signature verification
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

// Verify Stripe signature
function verifyStripeSignature(payload: Buffer, signature: string, secret: string): boolean {
  const sigParts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const timestamp = sigParts['t']
  const expectedSig = sigParts['v1']

  const signedPayload = `${timestamp}.${payload.toString()}`
  const computedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  return computedSig === expectedSig
}

// Generate random password
function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const rawBody = await getRawBody(req)
    const signature = req.headers['stripe-signature'] as string

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' })
    }

    // Verify signature
    const isValid = verifyStripeSignature(rawBody, signature, webhookSecret)
    if (!isValid) {
      console.error('Invalid Stripe signature')
      return res.status(400).json({ error: 'Invalid signature' })
    }

    const event: StripeWebhookBody = JSON.parse(rawBody.toString())

    // Only handle checkout.session.completed
    if (event.type !== 'checkout.session.completed') {
      return res.status(200).json({ received: true })
    }

    const session = event.data.object
    const email = session.customer_details?.email || session.customer_email
    const name = session.customer_details?.name || 'Contractor'
    const phone = session.customer_details?.phone || ''
    
    // Detect tier from payment amount (amount_total is in cents)
    const amountInDollars = (session.amount_total || 0) / 100
    let tier = 'feed'
    let monthlyFee = 750
    
    if (amountInDollars >= 4500) {
      tier = 'executive'
      monthlyFee = 5000
    } else if (amountInDollars >= 2000) {
      tier = 'priority'
      monthlyFee = 2500
    } else {
      tier = 'feed'
      monthlyFee = 750
    }


    console.log(`Processing new subscription: ${email}, tier: ${tier}`)

    // 1. Create Supabase Auth user
    const tempPassword = generatePassword()
    const { data: authData, error: authError } = await supabaseAdmin.auth.api.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      // User might already exist - try to get them
      if (authError.message.includes('already registered')) {
        console.log('User already exists, skipping auth creation')
      } else {
        throw authError
      }
    }

    const authUserId = authData?.id

    // 2. Check if contractor already exists
    const { data: existingContractor } = await supabaseAdmin
      .from('contractors')
      .select('id')
      .eq('email', email)
      .single()

    if (existingContractor) {
      // Update existing contractor
      await supabaseAdmin
        .from('contractors')
        .update({
          tier,
          monthly_fee: monthlyFee,
          status: 'active',
          auth_user_id: authUserId || existingContractor.id,
        })
        .eq('id', existingContractor.id)

      console.log(`Updated existing contractor: ${email}`)
    } else {
      // 3. Create new contractor record
      const { error: contractorError } = await supabaseAdmin
        .from('contractors')
        .insert([{
          company_name: name,
          contact_name: name,
          email,
          phone,
          tier,
          monthly_fee: monthlyFee,
          status: 'active',
          auth_user_id: authUserId,
        }])

      if (contractorError) {
        console.error('Error creating contractor:', contractorError)
        throw contractorError
      }

      console.log(`Created new contractor: ${email}`)
    }

    // 4. Log activity
    await supabaseAdmin
      .from('activities')
      .insert([{
        action: 'New Subscription',
        details: `${name} subscribed to ${tier === 'feed' ? 'The Feed' : tier === 'priority' ? 'Priority Intel' : 'Executive Partner'} ($${monthlyFee}/mo)`,
      }])

    // 5. TODO: Send welcome email with tempPassword
    // This would use a service like SendGrid, Resend, or Supabase's built-in email
    console.log(`Welcome email would be sent to ${email} with temp password: ${tempPassword}`)

    return res.status(200).json({ 
      success: true, 
      message: `Contractor ${email} onboarded successfully` 
    })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}
