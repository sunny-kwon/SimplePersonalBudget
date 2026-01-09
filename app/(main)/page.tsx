import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { TransactionForm } from '@/components/transaction-form';
import { RecentTransactions } from '@/components/recent-transactions';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { BudgetProgress } from '@/components/dashboard/budget-progress';
import { ArrowRight, Wallet, Target, Sparkles } from 'lucide-react';
import { getDashboardStats } from '@/lib/analytics';
import { LandingHero } from '@/components/landing-hero';

export default async function HomePage() {
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
        stats = await getDashboardStats(user.id);
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

    return (
        <div className="space-y-12 pb-20 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-3">
                        Daily Financial Overview
                    </p>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Your Dashboard</h1>
                </div>
                <Link
                    href="/categories"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 shadow-sm text-sm font-black rounded-2xl text-gray-700 hover:shadow-md transition-all active:scale-95"
                >
                    Manage Categories <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <KPICards
                totalIncome={stats.totalIncome}
                totalExpense={stats.totalExpense}
                net={stats.net}
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
                    <TrendChart data={stats.dailyTrend} sections={stats.sections} />
                </div>
            </div>
        </div>
    );
}
