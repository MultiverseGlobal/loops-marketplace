# LoopBot Setup Guide 🤖

Follow these steps to connect your campus AI assistant to WhatsApp.

## 1. OpenAI API Keys (Intelligence) 🧠
1. Go to [OpenAI Platform](https://platform.openai.com/).
2. Create an API key.
3. Add it to your `.env.local` as `OPENAI_API_KEY`.

## 2. Meta WhatsApp Setup (Connectivity) 📱
1. Go to the [Meta for Developers](https://developers.facebook.com/) portal.
2. Create a "Business" app.
3. Add "WhatsApp" from the list of products.
4. **Phone Number**: In the Dashboard, you'll see a temporary phone number. Copy the **Phone Number ID**.
5. **Access Token**: Copy the temporary access token (Note: for production, you need a System User Access Token).
6. Add these to `.env.local`:
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_ACCESS_TOKEN`

## 3. Webhook Configuration 🔗
1. In Meta WhatsApp settings, go to **Configuration**.
2. **Callback URL**: `https://your-domain.com/api/whatsapp/webhook`
3. **Verify Token**: Create a random string (e.g., `loops_bot_2024`).
4. Add it to `.env.local` as `WHATSAPP_VERIFY_TOKEN`.
5. **Webhook Fields**: Click "Manage" and subscribe to **messages**.

## 4. Linking Your Account 🔗
To list items via WhatsApp, your profile must have your number:
1. Go to **Profile Settings** on the website.
2. Enter your WhatsApp number in international format (e.g., `2348123456789`).
3. Save changes.

## 5. Testing 🧪
Send a message to your WhatsApp number:
> *"Hi LoopBot! I want to sell a MacBook Air M1 for 600k in the Electronics category."*

LoopBot should reply and create the listing automatically!
