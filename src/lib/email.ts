import { Resend } from 'resend';

const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        // Provide a dummy key for build time if missing
        return new Resend("re_placeholder_for_build");
    }
    return new Resend(key);
};

export async function sendWelcomeEmail(
    name: string,
    email: string,
    userId: string
) {
    try {
        const resend = getResend();
        const { data, error } = await resend.emails.send({
            from: 'Loops <onboarding@resend.dev>', // Change to your verified domain later
            to: [email],
            subject: '🎉 You\'re now a Verified Plug on Loops!',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        .step {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 16px;
            margin: 16px 0;
            border-radius: 8px;
        }
        .step-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>♾️ Welcome to Loops</h1>
        </div>
        
        <div class="content">
            <p class="greeting">Hey ${name}! 👋</p>
            
            <p>Congratulations! You've been approved as a <strong>Verified Plug</strong> on Loops, the campus marketplace for Veritas University.</p>
            
            <p>You're now part of the <strong>Founding 50</strong> — the first sellers to launch on Loops. Here's how to get started:</p>
            
            <div class="step">
                <div class="step-title">✅ Step 1: Create your first listing</div>
                List your products or services to start selling on campus.
            </div>
            
            <div class="step">
                <div class="step-title">✅ Step 2: Complete your profile</div>
                Add a bio, profile picture, and WhatsApp number so buyers can reach you easily.
            </div>
            
            <div class="step">
                <div class="step-title">✅ Step 3: Share your store</div>
                Tell your friends! The more people know about Loops, the more sales you'll make.
            </div>
            
            <a href="https://loops-stores.vercel.app/profile" class="button">Go to Your Dashboard →</a>
            
            <p style="margin-top: 30px; color: #666;">
                Need help? Just reply to this email and we'll assist you.
            </p>
            
            <p style="font-weight: bold; color: #667eea; margin-top: 30px;">
                Welcome to the movement! 🔌♾️
            </p>
            
            <p style="color: #666;">
                Best,<br>
                The Loops Team
            </p>
        </div>
        
        <div class="footer">
            You're receiving this because you applied to be a seller on Loops.
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error };
        }

        console.log('Welcome email sent:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error };
    }
}
export async function sendFoundingPlugApprovalEmail(
    name: string,
    email: string
) {
    try {
        const resend = getResend();
        const { data, error } = await resend.emails.send({
            from: 'Loops <onboarding@resend.dev>', // Change to your verified domain later
            to: [email],
            subject: '👑 Congratulations Founding Plug! The Loop Awaits.',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: #000; padding: 60px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; font-style: italic; }
        .content { padding: 50px 40px; }
        .greeting { font-size: 24px; font-weight: 800; margin-bottom: 24px; color: #000; letter-spacing: -0.5px; }
        .empire-box { background: #f1f5f9; border-radius: 20px; padding: 30px; margin: 30px 0; border: 1px dashed #cbd5e1; }
        .step-title { font-weight: 900; color: #6366f1; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; margin-bottom: 8px; }
        .empire-text { font-size: 15px; color: #475569; line-height: 1.6; }
        .btn-container { text-align: center; margin-top: 40px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 20px 40px; border-radius: 16px; text-decoration: none; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 13px; }
        .footer { text-align: center; padding: 30px; color: #94a3b8; font-size: 12px; font-weight: 600; }
        .branding { color: #6366f1; font-weight: 900; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>♾️ LOOPS COMMAND</h1>
        </div>
        
        <div class="content">
            <p class="greeting">CHAMPION STATUS: ${name.toUpperCase()}</p>
            
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">
                The Council has spoken. Your application to become a <span class="branding">Founding Plug</span> on Loops has been **OFFICIALLY APPROVED**.
            </p>
            
            <div class="empire-box">
                <div class="step-title">Phase 1: Sit Back</div>
                <p class="empire-text">We are finalizing the campus-wide infrastructure. You don't need to do anything right now. Just relax and keep an eye on your WhatsApp for the "Launch Sequence" notification.</p>
            </div>
            
            <div class="empire-box">
                <div class="step-title">Phase 2: Build the Empire</div>
                <p class="empire-text">Loops is only as strong as its network. As an approved Founding Plug, we encourage you to <strong>refer other elite vendors</strong>. More variety means more traffic for your storefront.</p>
            </div>
            
            <div class="btn-container">
                <a href="https://loops-stores.vercel.app/profile" class="button">Visit Your Command Deck</a>
            </div>
            
            <p style="margin-top: 50px; color: #475569; font-size: 14px; text-align: center;">
                Welcome to the movement. Veritas University commerce belongs to the students now.
            </p>
            
            <p style="font-weight: 900; color: #000; margin-top: 30px; text-align: center; font-style: italic;">
                ♾️ THE SYSTEM IS LIVE.
            </p>
        </div>
        
        <div class="footer">
            &copy; 2026 LOOPS PLATFORMS. ALL RIGHTS RESERVED.
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Approval email send error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error };
    }
}
