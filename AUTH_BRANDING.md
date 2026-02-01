# Loops Auth Branding (Supabase Template)

Copy and paste the following HTML into your Supabase Dashboard -> Authentication -> Email Templates -> Confirm Signup.

### Subject
Confirm your Loops Account 🕸️

### Body (HTML)
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .container {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px;
            background-color: #f8fafc;
            border-radius: 24px;
        }
        .header {
            color: #6366f1;
            font-size: 32px;
            font-weight: 800;
            font-style: italic;
            letter-spacing: -1px;
            margin-bottom: 24px;
        }
        .body-text {
            color: #1e293b;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        .btn {
            display: inline-block;
            background-color: #6366f1;
            color: white !important;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none !important;
            font-weight: 700;
            box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
        }
        .footer {
            margin-top: 40px;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">LOOPS.</div>
        <p class="body-text">
            Welcome to the Campus Pulse. Your nodes are almost active. <br><br>
            Please confirm your student email to unlock the marketplace and start listing.
        </p>
        <a href="{{ .ConfirmationURL }}" class="btn">Confirm Node Access</a>
        <div class="footer">Loops Marketplace | Campus OS</div>
    </div>
</body>
</html>
```

## Setup Instructions
1. Go to **Supabase Dashboard**.
2. Navigate to **Authentication** -> **Email Templates**.
3. Paste the code above into the **Confirm Signup** editor.
4. **IMPORTANT**: Also go to **URL Configuration** and ensure your **Site URL** is set to your actual dev address (e.g. `http://localhost:3000` or your Vercel URL).
