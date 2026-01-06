import { Resend } from 'resend';

// INSTRUCTIONS:
// 1. Replace 'YOUR_RESEND_API_KEY_HERE' below with your actual Resend API key
// 2. Run: npx tsx scripts/test-email-manual.ts

const RESEND_API_KEY = 'YOUR_RESEND_API_KEY_HERE'; // ← Paste your key here

const resend = new Resend(RESEND_API_KEY);

async function testEmail() {
    try {
        if (RESEND_API_KEY === 'YOUR_RESEND_API_KEY_HERE') {
            console.error('❌ Please edit this file and add your Resend API key');
            console.log('Replace "YOUR_RESEND_API_KEY_HERE" with your actual key');
            process.exit(1);
        }

        console.log('Sending test email to ksj122605@gmail.com...');

        const { data, error } = await resend.emails.send({
            from: 'Budget Report <onboarding@resend.dev>',
            to: ['ksj122605@gmail.com'],
            subject: 'Test Email - Simple Personal Budget',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Email Test Successful!</h1>
                        </div>
                        
                        <div class="content">
                            <h2>Hello from Simple Personal Budget!</h2>
                            
                            <p>This is a test email to verify your Resend integration is working correctly.</p>
                            
                            <p><strong>What this means:</strong></p>
                            <ul>
                                <li>✅ Your Resend API key is configured correctly</li>
                                <li>✅ Email sending is operational</li>
                                <li>✅ Monthly reports will work when triggered</li>
                            </ul>
                            
                            <p>You can now receive automated monthly budget reports directly to your inbox!</p>
                            
                            <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
                        </div>
                        
                        <div class="footer">
                            <p>This is a test email from Simple Personal Budget</p>
                            <p>Sent at: ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('❌ Error sending email:', error);
            process.exit(1);
        }

        console.log('✅ Email sent successfully!');
        console.log('📧 Email ID:', data?.id);
        console.log('\n✉️  Check your inbox at ksj122605@gmail.com');
        console.log('📂 (Check spam folder if you don\'t see it)');
        console.log('\n🔒 Remember to add RESEND_API_KEY to .env.local for production use');

    } catch (error) {
        console.error('❌ Failed to send email:', error);
        process.exit(1);
    }
}

testEmail();
