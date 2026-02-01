# Supabase Auth Setup Guide 🔑

To enable Google and Phone (SMS) authentication for Loops, follow these steps in your [Supabase Dashboard](https://supabase.com/dashboard).

## 1. Google OAuth Setup 🌐
1. Go to **Authentication > Providers > Google**.
2. Toggle on "Enable Google".
3. You will need a **Client ID** and **Client Secret** from the [Google Cloud Console](https://console.cloud.io/).
    - Create a new project.
    - Go to **APIs & Services > OAuth consent screen** (Configure as "External").
    - Go to **Credentials > Create Credentials > OAuth client ID**.
    - Select **Web application**.
    - Add `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback` to **Authorized redirect URIs** (Copy this from the Supabase Google Provider settings).
4. Paste the **Client ID** and **Secret** back into Supabase and click **Save**.

## 2. Phone (SMS) Setup 📱
1. Go to **Authentication > Providers > Phone**.
2. Toggle on "Enable Phone".
3. Select an SMS Provider (e.g., **Twilio** or **MessageBird**).
    - You will need an account and API keys from your chosen provider.
    - **Twilio** is the most common. You'll need your `Account SID`, `Auth Token`, and a `Twilio Phone Number`.
4. Toggle on "Enable Phone Confirmation" if you want to verify numbers via OTP.
5. Click **Save**.

## 3. Redirect URLs 🔄
1. Go to **Authentication > URL Configuration**.
2. Ensure your **Site URL** is: `https://loops-stores.vercel.app`
3. Add to **Redirect URIs**: `https://loops-stores.vercel.app/auth/callback`

> [!TIP]
> For testing locally, you should also add `http://localhost:3000` and `http://localhost:3000/auth/callback`.
