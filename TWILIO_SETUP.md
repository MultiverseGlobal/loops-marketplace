# Twilio SMS Setup Guide 📱🔧

This guide will show you exactly where to find your credentials to enable Phone Login for Loops.

## 1. Finding your Credentials 🔑
1. Log in to your [Twilio Console](https://console.twilio.com/).
2. On the **Account Dashboard** (the first page you see), look for the **"Account Info"** section (usually in the middle of the screen).
3. You will see:
    - **Account SID**: A long string starting with `AC...`
    - **Auth Token**: Click "show" to reveal this secret string.
4. **Copy both of these.**

## 2. Getting a Twilio Phone Number 📞
1. If you don't have a number yet, click the **"Get a trial phone number"** button on the dashboard.
2. If you already have one, find it under **Develop > Messaging > Try it out > Send an SMS**.
3. Copy the number exactly (including the `+` sign).

## 3. Creating a Messaging Service SID (Required) 🛠️
Supabase now requires a **Messaging Service SID** (starts with `MG...`) instead of just a phone number.
1. In the Twilio Console, go to **Develop > Messaging > Services**.
2. Click **Create Messaging Service**.
3. Name it `Loops Auth`.
4. In the "Add Senders" step, click **Add Senders** and select your **Twilio Phone Number**.
4. **Integration Settings (Step 3 in your screenshot)**:
    - **Incoming Messages**: Select **"Defer to sender's webhook"** (Keep this as default).
    - **Callback URL**: Leave this **EMPTY**. Supabase doesn't need it.
    - **Validity Period**: Leave as default.
5. Click **Step 4: Add compliance info**. (You can usually skip most of the compliance for a trial/test account, just click 'Complete Setup').
6. Copy the **Messaging Service SID** (starts with `MG...`).

## 4. Connecting to Supabase 🔄
1. Go to your **Supabase Dashboard > Authentication > Providers > Phone**.
2. **TOGGLE ON**: "Enable Phone provider" (It's off in your screenshot!).
3. Select **Twilio** from the dropdown.
4. Paste the **Account SID** and **Auth Token**.
5. Paste the **Messaging Service SID** (`MG...`) into the **Twilio Message Service SID** box.
6. Click **Save**.

Now you can test the login on your site! 🚀🏙️🎓✨
