# Supabase Auth Setup Guide 🔑

To enable Google and Phone (SMS) authentication for Loops, follow these steps in your [Supabase Dashboard](https://supabase.com/dashboard).

## 1. Google OAuth Setup 🌐
1. Go to **Authentication > Providers > Google**.
2. Toggle on "Enable Google".
3. You will need a **Client ID** and **Client Secret** from the [Google Cloud Console](https://console.cloud.io/).
    - Create a new project.
    - Go to **APIs & Services > OAuth consent screen** (Configure as "External").
    - Go to **Credentials > Create Credentials > OAuth client ID**.
    - Add `https://loops-stores.vercel.app` and `http://localhost:3000` to **Authorized JavaScript origins**.
    - Add `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback` to **Authorized redirect URIs** (Copy this from the Supabase Google Provider settings).
4. Paste the **Client ID** and **Secret** back into Supabase and click **Save**.

## 2. Phone (SMS) via Twilio 📱
1. Create a [Twilio Account](https://www.twilio.com/).
2. In your Twilio Console, find your **Project Info**:
    - **Account SID**: Copy this.
    - **Auth Token**: Copy this.
3. **Get a Phone Number**: Click "Get a Trial Number" or buy a number with SMS capabilities.
4. **Link to Supabase**:
    - Go to **Supabase > Authentication > Providers > Phone**.
    - Enabled: **ON**.
    - Phone Provider: **Twilio**.
    - Twilio Account SID: Paste your SID.
    - Twilio Auth Token: Paste your Token.
    - Twilio Message Service SID (Optional) or **Twilio Phone Number**: Paste your Twilio number.
5. Click **Save**.

> [!TIP]
> **Nigerian Numbers**: If you are testing in Nigeria, ensure your Twilio number has "International SMS" enabled in the Twilio Programmable Messaging settings.

## 3. Redirect URLs 🔄
1. Go to **Authentication > URL Configuration**.
2. Ensure your **Site URL** is: `https://loops-stores.vercel.app`
3. Add to **Redirect URIs**: `https://loops-stores.vercel.app/auth/callback`

> [!TIP]
> For testing locally, you should also add `http://localhost:3000` and `http://localhost:3000/auth/callback`.
