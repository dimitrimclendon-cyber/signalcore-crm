# Stripe Auto-Onboarding Setup

## Step 1: Get Your Stripe API Keys

### Secret Key (for webhook handler)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Under **Standard keys**, copy your **Secret key** (starts with `sk_live_` or `sk_test_`)

### Webhook Signing Secret

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://your-crm-domain.vercel.app/api/stripe-webhook`
4. Select event: `checkout.session.completed`
5. Click **Add endpoint**
6. After creation, click on the webhook and reveal the **Signing secret** (starts with `whsec_`)

## Step 2: Create Stripe Checkout Links

For each pricing tier, create a Payment Link:

1. Go to [Stripe Payment Links](https://dashboard.stripe.com/payment_links)
2. Click **New** → **Payment Link**
3. Create product for each tier:

| Tier              | Product Name                   | Price     | Billing   |
| ----------------- | ------------------------------ | --------- | --------- |
| The Feed          | SignalCore - The Feed          | $750/mo   | Recurring |
| Priority Intel    | SignalCore - Priority Intel    | $2,500/mo | Recurring |
| Executive Partner | SignalCore - Executive Partner | $5,000/mo | Recurring |

4. For each, add metadata field:

   - Key: `tier`
   - Value: `feed`, `priority`, or `executive`

5. Copy each Payment Link URL for your website

## Step 3: Add Keys to Environment

Add these to `crm-web/.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Supabase Admin (for creating users)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 4: Deploy & Test

1. Deploy admin CRM to Vercel
2. Update Stripe webhook URL to production domain
3. Test with Stripe test mode first!

---

## Flow Summary

```
Customer pays via Stripe Checkout
          ↓
Stripe sends webhook to /api/stripe-webhook
          ↓
Webhook handler:
  1. Verifies signature
  2. Creates Supabase Auth user (random password)
  3. Creates contractor record
  4. Links auth_user_id
  5. (Optional) Sends welcome email
          ↓
Customer can log in at Customer Portal!
```
