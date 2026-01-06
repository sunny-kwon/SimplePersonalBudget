import { config } from 'dotenv';
import { Resend } from 'resend';

// Load .env.local file specifically
config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.error('❌ RESEND_API_KEY not found in .env.local');
            console.log('Make sure you have added it to your .env.local file');
            process.exit(1);
        }

        console.log('✅ API key loaded successfully');
        console.log('📧 Sending test email to sunnykwondev@gmail.com...\n');

        const { data, error } = await resend.emails.send({
            from: 'Budget Report <onboarding@resend.dev>',
            to: ['sunnykwondev@gmail.com'], // Changed to your verified email
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
                        .stat { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #4f46e5; }
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
                            
                            <div class="stat">
                                <strong>✅ Status:</strong> Email delivery operational
                            </div>
                            
                            <p><strong>What this confirms:</strong></p>
                            <ul>
                                <li>✅ Your Resend API key is configured correctly</li>
                                <li>✅ Email sending is operational</li>
                                <li>✅ Monthly reports will work when triggered</li>
                                <li>✅ HTML templates render properly</li>
                            </ul>
                            
                            <p><strong>📝 Note:</strong> With the free Resend tier, you can only send to <code>sunnykwondev@gmail.com</code> (your verified email). To send to other addresses like <code>ksj122605@gmail.com</code>, you'll need to verify a custom domain.</p>
                            
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
        console.log('\n✉️  Check your inbox at sunnykwondev@gmail.com');
        console.log('📂 (Check spam folder if you don\'t see it)');
        console.log('\n💡 Tip: To send to other emails, verify a domain at resend.com/domains');

    } catch (error) {
        console.error('❌ Failed to send email:', error);
        process.exit(1);
    }
}

testEmail();
