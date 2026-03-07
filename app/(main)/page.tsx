import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { TransactionForm } from '@/components/transaction-form';
import { RecentTransactions } from '@/components/recent-transactions';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { BudgetProgress } from '@/components/dashboard/budget-progress';
import { ArrowRight, Wallet, Target, Sparkles, Calendar } from 'lucide-react';
import { getDashboardStats } from '@/lib/analytics';
import { LandingHero } from '@/components/landing-hero';
import { PeriodNavigator } from '@/components/dashboard/period-navigator';
import { db } from '@/lib/db';
import { userProfile } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { DashboardTourHandler } from '@/components/dashboard/tour-handler';

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const dateParam = typeof params.date === 'string' ? params.date : undefined;
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <LandingHero />;
    }

    // Dashboard for authenticated users
    let stats: import('@/lib/analytics').DashboardStats | null = null;
    let error: string | null = null;

    try {
        stats = await getDashboardStats(user.id, targetDate);
    } catch (e) {
        console.error("Dashboard stats error:", e);
        error = "Internal connection error. Please refresh.";
    }

    if (error) {
        return (
            <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 max-w-2xl mx-auto my-20 font-sans">
                <h3 className="text-red-800 text-xl font-black mb-2">Sync Error</h3>
                <p className="text-red-600 font-bold mb-6">{error}</p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100"
                >
                    Retry Connection
                </Link>
            </div>
        );
    }

    if (!stats) return null;

    const profile = await db.query.userProfile.findFirst({
        where: eq(userProfile.userId, user.id)
    });

    return (
        <div className="space-y-12 pb-20 font-sans">
            <DashboardTourHandler onboardingCompleted={!!profile?.onboardingCompleted} />
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs font-black text-indigo-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        Live Financial Pulse
                    </p>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">Your Dashboard</h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <PeriodNavigator startDate={stats.startDate} endDate={stats.endDate} />
                    <Link
                        href="/categories"
                        className="hidden sm:inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 shadow-sm text-sm font-black rounded-2xl text-gray-700 hover:shadow-md transition-all active:scale-95"
                    >
                        Management <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            <KPICards
                totalIncome={stats.totalIncome}
                totalExpense={stats.totalExpense}
                net={stats.net}
                budgetLimit={stats.budget?.totalTarget || 0}
            />

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
                <div className="space-y-12">
                    <TransactionForm />
                    <RecentTransactions transactions={stats.transactions.slice(0, 5)} />
                </div>

                <div className="space-y-12">
                    {stats.budget && (
                        <BudgetProgress budget={stats.budget} sections={stats.sections} />
                    )}
                    <SpendingChart data={stats.spendingBySection} />
                    {/* <TrendChart data={stats.dailyTrend} sections={stats.sections} /> */}
                </div>
            </div>
        </div>
    );
}
