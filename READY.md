# Production Launch Playbook

Follow this guide to deploy Loops to a new university campus.

## 1. Environment Setup
- [ ] **Supabase**: Initialize a new project or create a new `campus_id` in the existing database.
- [ ] **Vercel**: Deploy the frontend and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 2. Branding (Node Configuration)
- [ ] **Admin Dashboard**: Create the new university node.
- [ ] **Branding**: Set the primary/secondary colors and the `.edu` domain patterns.
- [ ] **Terms**: Verify campus-specific terminology (e.g., "Loop" vs "Marketplace").

## 3. L-Bot Activation
- [ ] **Meta Developer Console**: Set up a new WhatsApp Business Phone ID.
- [ ] **Webhook**: Configure the webhook URL to `https://your-domain.com/api/whatsapp/webhook`.
- [ ] **Verify Token**: Ensure `WHATSAPP_VERIFY_TOKEN` matches in both Meta and Vercel.

## 4. Verification Flow
- [ ] **Email Testing**: Verify that only students with the approved domain can sign up.
- [ ] **Onboarding**: Test the student onboarding flow to ensure `primary_role` and `whatsapp_number` are saved correctly.

## 5. Security Check
- [ ] **RLS Policies**: Run `supabase/schema.sql` to ensure student data is isolated to their campus.
- [ ] **Secret Management**: Ensure all API keys (OpenAI, Meta) are in the Production environment variables.
