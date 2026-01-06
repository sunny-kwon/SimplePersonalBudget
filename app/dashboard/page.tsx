import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { TransactionForm } from '@/components/transaction-form';
import { RecentTransactions } from '@/components/recent-transactions';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { ArrowRight } from 'lucide-react';
import { getDashboardStats } from '@/lib/analytics';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch stats for current month
    // Note: In a real app we might parse ?month= query param
    let stats: import('@/lib/analytics').DashboardStats | null = null;
    let error: string | null = null;

    try {
        if (user) {
            stats = await getDashboardStats(user.id);
        }
    } catch (e) {
        console.error("Failed to fetch dashboard stats:", e);
        error = "Database connection failed. Please check your internet or try again later.";
    }

    if (error) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        {/* Heroicon name: solid/x-circle */}
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-5">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Dashboard</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Overview for <span className="font-semibold">{user?.email}</span>
                    </p>
                </div>
                <Link
                    href="/dashboard/categories"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Manage Categories <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </div>

            {/* KPI Cards */}
            <KPICards
                totalIncome={stats.totalIncome}
                totalExpense={stats.totalExpense}
                net={stats.net}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left Column: Quick Entry & Recent */}
                <div className="space-y-6">
                    <TransactionForm />
                    <RecentTransactions transactions={stats.transactions.slice(0, 5)} />
                </div>

                {/* Right Column: Charts */}
                <div className="space-y-6">
                    <SpendingChart data={stats.spendingByCategory} />
                    <TrendChart data={stats.dailyTrend} />
                </div>
            </div>
        </div>
    );
}
