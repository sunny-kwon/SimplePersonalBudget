import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transaction, category } from '@/lib/db/schema';
import { eq, desc, and, gte, lte, or, ilike, sql } from 'drizzle-orm';
import { TransactionTable } from '@/components/transaction-table';
import { TransactionFilters } from '@/components/transaction-filters';
import Link from 'next/link';
import { Download, History } from 'lucide-react';

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: Promise<{ startDate?: string; endDate?: string; categoryId?: string; search?: string }>;
}) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const params = await searchParams;
    const filters = [eq(transaction.userId, user.id)];

    if (params.startDate) filters.push(gte(transaction.occurredOn, params.startDate));
    if (params.endDate) filters.push(lte(transaction.occurredOn, params.endDate));
    if (params.categoryId) filters.push(eq(transaction.categoryId, params.categoryId));
    if (params.search) {
        filters.push(
            or(
                ilike(transaction.note, `%${params.search}%`),
                sql`CAST(${transaction.amount} AS TEXT) LIKE ${`%${params.search}%`}`
            )!
        );
    }

    const transactions = await db.query.transaction.findMany({
        where: and(...filters),
        with: {
            category: {
                with: {
                    section: true
                }
            }
        },
        orderBy: [desc(transaction.occurredOn), desc(transaction.createdAt)],
        limit: 100,
    });

    const categories = await db.query.category.findMany({
        where: eq(category.userId, user.id),
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <History className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Transactions</h1>
                        <p className="text-gray-500 text-sm font-medium">History and detailed review</p>
                    </div>
                </div>
                <Link
                    href="/api/reports/export"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </Link>
            </div>

            <div className="space-y-6">
                <TransactionFilters categories={categories} />
                <TransactionTable transactions={transactions} categories={categories} />
            </div>
        </div>
    );
}
