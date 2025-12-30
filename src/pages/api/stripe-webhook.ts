import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import https from 'https'

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

// Send welcome email via Resend
async function sendWelcomeEmail(email: string, name: string, tempPassword: string, tier: string): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured - skipping email')
    return
  }

  const tierNames: Record<string, string> = {
    feed: 'The Feed',
    priority: 'Priority Intel',
    executive: 'Executive Partner'
  }

  const tierName = tierNames[tier] || 'The Feed'

  const emailHtml = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #fff; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">Welcome to SignalCore!</h1>
        <p style="color: #94a3b8; margin-top: 10px;">Your ${tierName} subscription is now active</p>
      </div>
      
      <div style="background: #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h2 style="color: #fff; margin: 0 0 16px 0; font-size: 18px;">Your Login Credentials</h2>
        <p style="margin: 8px 0; color: #cbd5e1;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 8px 0; color: #cbd5e1;"><strong>Temporary Password:</strong> <code style="background: #334155; padding: 4px 8px; border-radius: 4px; color: #10b981;">${tempPassword}</code></p>
      </div>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="https://portal.signalcoredata.com/login" style="display: inline-block; background: #10b981; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Access Your Portal →</a>
      </div>
      
      <p style="color: #64748b; font-size: 14px; text-align: center;">
        We recommend changing your password after your first login.<br>
        Questions? Reply to this email or contact leads@signalcoredata.com
      </p>
      
      <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
      
      <p style="color: #64748b; font-size: 12px; text-align: center;">
        SignalCore Data | Predictive Commercial HVAC Intelligence<br>
        Spokane, WA
      </p>
    </div>
  `

  const postData = JSON.stringify({
    from: 'SignalCore <noreply@signalcoredata.com>',
    to: [email],
    subject: `Welcome to SignalCore ${tierName}! Your login credentials`,
    html: emailHtml
  })

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`Welcome email sent to ${email}`)
          resolve()
        } else {
          console.error(`Email send failed: ${res.statusCode} - ${data}`)
          resolve() // Don't fail the webhook if email fails
        }
      })
    })
    req.on('error', (e) => {
      console.error(`Email send error: ${e.message}`)
      resolve() // Don't fail the webhook if email fails
    })
    req.write(postData)
    req.end()
  })
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

    // 5. Send welcome email with credentials
    await sendWelcomeEmail(email, name, tempPassword, tier)

    return res.status(200).json({ 
      success: true, 
      message: `Contractor ${email} onboarded successfully` 
    })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}
