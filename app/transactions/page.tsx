import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transaction, category } from '@/lib/db/schema';
import { eq, desc, and, gte, lte, or, ilike, sql } from 'drizzle-orm';
import { TransactionTable } from '@/components/transaction-table';
import { TransactionFilters } from '@/components/transaction-filters';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: { startDate?: string; endDate?: string; categoryId?: string; search?: string };
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
        with: { category: true },
        orderBy: [desc(transaction.occurredOn), desc(transaction.createdAt)],
        limit: 100,
    });

    const categories = await db.query.category.findMany({
        where: eq(category.userId, user.id),
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-3">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                            <p className="mt-2 text-sm text-gray-600">Manage and review your transaction history</p>
                        </div>
                        <Link
                            href="/api/reports/export"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <TransactionFilters categories={categories} />
                <TransactionTable transactions={transactions} categories={categories} />
            </div>
        </div>
    );
}
