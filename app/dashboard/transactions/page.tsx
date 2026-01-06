import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transaction, category } from '@/lib/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { TransactionTable } from '@/components/transaction-table';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: { startDate?: string; endDate?: string; categoryId?: string };
}) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Build filters
    const filters = [eq(transaction.userId, user.id)];

    const params = await searchParams;

    if (params.startDate) {
        filters.push(gte(transaction.occurredOn, params.startDate));
    }
    if (params.endDate) {
        filters.push(lte(transaction.occurredOn, params.endDate));
    }
    if (params.categoryId) {
        filters.push(eq(transaction.categoryId, params.categoryId));
    }

    // Fetch transactions
    const transactions = await db.query.transaction.findMany({
        where: and(...filters),
        with: {
            category: true,
        },
        orderBy: [desc(transaction.occurredOn), desc(transaction.createdAt)],
        limit: 100, // Pagination can be added later
    });

    // Fetch all categories for filter dropdown
    const categories = await db.query.category.findMany({
        where: eq(category.userId, user.id),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing {transactions.length} transaction(s)
                    </p>
                </div>
            </div>

            {/* Future: Add filters here */}

            <TransactionTable transactions={transactions} categories={categories} />
        </div>
    );
}
