import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDashboardStats } from '@/lib/analytics';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { month } = await request.json();
        const targetDate = month ? new Date(month) : new Date();

        const stats = await getDashboardStats(user.id, targetDate);

        const monthName = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Simple HTML email template
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
                    .summary { background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; }
                    .stat { margin: 10px 0; }
                    .stat-label { font-weight: bold; }
                    .income { color: #10b981; }
                    .expense { color: #ef4444; }
                    .category { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Monthly Budget Report</h1>
                        <p>${monthName}</p>
                    </div>
                    
                    <div class="summary">
                        <h2>Summary</h2>
                        <div class="stat">
                            <span class="stat-label">Total Income:</span>
                            <span class="income">$${stats.totalIncome.toFixed(2)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Total Expenses:</span>
                            <span class="expense">$${stats.totalExpense.toFixed(2)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Net Balance:</span>
                            <span style="color: ${stats.net >= 0 ? '#10b981' : '#ef4444'}">
                                $${stats.net.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    ${stats.spendingBySection.length > 0 ? `
                        <h3>Top Spending Sections</h3>
                        ${stats.spendingBySection.slice(0, 5).map(sec => `
                            <div class="category">
                                <strong>${sec.sectionName}:</strong> $${sec.amount.toFixed(2)}
                            </div>
                        `).join('')}
                    ` : ''}

                    <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                        This is an automated report from Simple Personal Budget.
                    </p>
                </div>
            </body>
            </html>
        `;

        await resend.emails.send({
            from: 'Budget Report <onboarding@resend.dev>', // Change this to your verified domain
            to: [user.email],
            subject: `Budget Report - ${monthName}`,
            html,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
