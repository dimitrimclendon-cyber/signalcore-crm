import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";
import crypto from "crypto";

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StripeWebhookBody {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      customer?: string;
      customer_email?: string;
      customer_details?: {
        email: string;
        name: string;
        phone?: string;
      };
      metadata?: {
        tier?: string;
      };
      amount_total?: number;
      billing_reason?: string;
    };
  };
}

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body for signature verification
  },
};

// Read raw body for signature verification
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Verify Stripe signature
function verifyStripeSignature(
  payload: Buffer,
  signature: string,
  secret: string
): boolean {
  const sigParts = signature.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = sigParts["t"];
  const expectedSig = sigParts["v1"];

  const signedPayload = `${timestamp}.${payload.toString()}`;
  const computedSig = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return computedSig === expectedSig;
}

// Generate random password
function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Send welcome email via Resend SDK
async function sendWelcomeEmail(
  email: string,
  name: string,
  tempPassword: string,
  tier: string
): Promise<void> {
  const tierNames: Record<string, string> = {
    feed: "The Feed",
    priority: "Priority Intel",
    executive: "Executive Partner",
  };

  const tierName = tierNames[tier] || "The Feed";

  const emailHtml = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #fff; padding: 40px; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Welcome to SignalCore</h1>
        <p style="color: #94a3b8; margin-top: 10px; font-weight: 500;">Your ${tierName} subscription is now active</p>
      </div>
      
      <div style="background: #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #334155;">
        <h2 style="color: #fff; margin: 0 0 16px 0; font-size: 18px; text-transform: uppercase;">Your Login Credentials</h2>
        <p style="margin: 8px 0; color: #cbd5e1; font-size: 14px;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 8px 0; color: #cbd5e1; font-size: 14px;"><strong>Temporary Password:</strong> <code style="background: #10b98120; padding: 4px 8px; border-radius: 4px; color: #10b981; font-weight: bold;">${tempPassword}</code></p>
      </div>
      
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="https://portal.signalcoredata.com/login" style="display: inline-block; background: #10b981; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Access Your Portal</a>
      </div>
      
      <p style="color: #64748b; font-size: 13px; text-align: center; line-height: 1.6;">
        We recommend changing your password after your first login.<br>
        Questions? Reply to this email or contact <a href="mailto:support@signalcoredata.com" style="color: #10b981; text-decoration: none;">support@signalcoredata.com</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
      
      <p style="color: #475569; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
        SignalCore IntelliLead | Predictive Market Intelligence<br>
        Spokane, WA
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: "SignalCore IntelliLead <welcome@signalcoredata.com>",
      to: [email],
      subject: `Welcome to SignalCore ${tierName}! Your login credentials`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error in welcome email:", error);
    } else {
      console.log(`Welcome email sent to ${email}`);
    }
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    // Verify signature
    const isValid = verifyStripeSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error("Invalid Stripe signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event: StripeWebhookBody = JSON.parse(rawBody.toString());
    const session = event.data.object;

    // 1. Handle SUCCESSFUL payments (Checkout or recurring)
    if (
      event.type === "checkout.session.completed" ||
      event.type === "invoice.payment_succeeded"
    ) {
      const email = session.customer_details?.email || session.customer_email;

      if (!email) {
        console.warn(`No email found for event ${event.id}`);
        return res.status(200).json({ received: true });
      }

      const name = session.customer_details?.name || "Contractor";
      const phone = session.customer_details?.phone || "";

      // Detect tier from payment amount (amount_total is in cents)
      const amountInDollars = (session.amount_total || 0) / 100;
      let tier = "feed";
      let monthlyFee = 750;

      if (amountInDollars >= 4500) {
        tier = "executive";
        monthlyFee = 5000;
      } else if (amountInDollars >= 2000) {
        tier = "priority";
        monthlyFee = 2500;
      }

      console.log(`Processing subscription: ${email}, tier: ${tier}`);

      let authUserId: string | undefined;
      let tempPassword = generatePassword();

      if (event.type === "checkout.session.completed") {
        // 1. Create Supabase Auth user for new subscribers
        const { data: authData, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
          });

        if (authError) {
          if (authError.message.includes("already registered")) {
            console.log("User already exists, skipping auth creation");
          } else {
            console.error("Auth user creation error:", authError);
          }
        }
        authUserId = authData?.user?.id;
      }

      // 2. Update or Create Contractor record
      const { data: existingContractor } = await supabaseAdmin
        .from("contractors")
        .select("id, auth_user_id")
        .eq("email", email)
        .single();

      if (existingContractor) {
        await supabaseAdmin
          .from("contractors")
          .update({
            tier,
            monthly_fee: monthlyFee,
            status: "active",
            auth_user_id: authUserId || existingContractor.auth_user_id,
          })
          .eq("id", existingContractor.id);

        console.log(`Updated contractor: ${email}`);
      } else {
        await supabaseAdmin.from("contractors").insert([
          {
            company_name: name,
            contact_name: name,
            email,
            phone,
            tier,
            monthly_fee: monthlyFee,
            status: "active",
            auth_user_id: authUserId,
          },
        ]);

        console.log(`Created new contractor: ${email}`);
      }

      // 3. Send welcome email for new checkouts
      if (event.type === "checkout.session.completed") {
        await sendWelcomeEmail(email, name, tempPassword, tier);
      }

      // 4. Log success activity
      await supabaseAdmin.from("activities").insert([
        {
          action: "Payment Processed",
          details: `Subscription for ${email} (${tier}) updated via Stripe`,
        },
      ]);
    }

    // 2. Handle CANCELLATIONS and FAILURES
    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "invoice.payment_failed"
    ) {
      const email = session.customer_email || session.customer_details?.email;

      if (email) {
        await supabaseAdmin
          .from("contractors")
          .update({ status: "churned" })
          .eq("email", email);

        console.log(`Contractor ${email} deactivated due to ${event.type}`);

        await supabaseAdmin.from("activities").insert([
          {
            action: "Subscription Ended",
            details: `Contractor ${email} status set to churned due to ${event.type}`,
          },
        ]);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: error.message });
  }
}
