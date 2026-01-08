import { db } from '@/lib/db';
import { transaction, section, category } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

// Define the transaction type with its relations as returned by Drizzle query
export type TransactionWithCategory = typeof transaction.$inferSelect & {
    category: {
        name: string;
        icon: string | null;
        type: "income" | "expense" | "both";
        id: string;
        userId: string;
        archived: boolean;
        section: {
            id: string;
            name: string;
            color: string;
        } | null;
    } | null;
}

export interface DashboardStats {
    totalIncome: number;
    totalExpense: number;
    net: number;
    spendingBySection: {
        sectionId: string;
        sectionName: string;
        color: string;
        amount: number;
        percentage: number;
    }[];
    dailyTrend: {
        date: string;
        income: number;
        expense: number;
        [key: string]: string | number;
    }[];
    sections: {
        id: string;
        name: string;
        color: string;
    }[];
    transactions: TransactionWithCategory[];
}

const FALLBACK_COLOR = '#6366f1';

/**
 * Optimized dashboard stats fetcher.
 * Uses unstable_cache to make repeats extremely fast across requests.
 * 
 * IMPORTANT: This must only be called from Server Components because it directly accesses the database.
 */
export async function getDashboardStats(userId: string, monthDate: Date = new Date()): Promise<DashboardStats> {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    // We cache based on userId, year, and month.
    // Tags allow us to revalidate when a transaction is added.
    return unstable_cache(
        async () => {
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);

            const startStr = startOfMonth.toISOString().split('T')[0];
            const endStr = endOfMonth.toISOString().split('T')[0];

            // 1. Fetch all transactions for this month with nested relations
            const txs = await db.query.transaction.findMany({
                where: and(
                    eq(transaction.userId, userId),
                    gte(transaction.occurredOn, startStr),
                    lte(transaction.occurredOn, endStr)
                ),
                with: {
                    category: {
                        with: {
                            section: true
                        }
                    }
                },
                orderBy: [desc(transaction.occurredOn), desc(transaction.createdAt)]
            }) as TransactionWithCategory[];

            // 2. Aggregates
            let totalIncome = 0;
            let totalExpense = 0;
            const sectionMap = new Map<string, { name: string; color: string; amount: number }>();
            const dailyMap = new Map<string, { income: number; expense: number }>();

            // Pre-fill daily map for the entire month to ensure no gaps in trend chart
            const daysInMonth = endOfMonth.getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                dailyMap.set(dateStr, { income: 0, expense: 0 });
            }

            for (const t of txs) {
                const amt = parseFloat(t.amount);

                // Track daily trend
                const dayStats = dailyMap.get(t.occurredOn) || { income: 0, expense: 0 };
                if (t.kind === 'income') {
                    totalIncome += amt;
                    dayStats.income += amt;
                } else {
                    totalExpense += amt;
                    dayStats.expense += amt;

                    // Group expenses by Section
                    const s = t.category?.section;
                    const secId = s?.id || 'unassigned';
                    const secName = s?.name || 'Uncategorized';
                    const secColor = s?.color || FALLBACK_COLOR;

                    if (!sectionMap.has(secId)) {
                        sectionMap.set(secId, { name: secName, color: secColor, amount: 0 });
                    }
                    const current = sectionMap.get(secId)!;
                    current.amount += amt;
                }

                if (dailyMap.has(t.occurredOn)) {
                    dailyMap.set(t.occurredOn, dayStats);
                }
            }

            // 3. Finalize data structures
            const spendingBySection = Array.from(sectionMap.entries())
                .map(([id, data]) => ({
                    sectionId: id,
                    sectionName: data.name,
                    color: data.color,
                    amount: data.amount,
                    percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0
                }))
                .sort((a, b) => b.amount - a.amount);

            // Get all sections involved to ensure trend lines are consistent
            const allSections = spendingBySection.map(s => ({
                id: s.sectionId,
                name: s.sectionName,
                color: s.color
            }));

            // Finalize dailyTrend with flattened sections
            // We need to make sure every day has every section key, even if 0
            const dailyTrend = Array.from(dailyMap.entries())
                .map(([date, data]) => {
                    const row: any = { date, income: data.income, expense: data.expense };
                    // Initialize all sections to 0
                    allSections.forEach(s => {
                        row[s.name] = 0;
                    });

                    // Fill with actual data if we tracked it per day
                    // Wait, I need to track per-section per-day in Step 2 loop
                    return row;
                });

            // Re-doing Step 2 loop slightly to track section amounts per day
            const dailySectionMap = new Map<string, Map<string, number>>(); // date -> (sectionName -> amount)

            for (const t of txs) {
                if (t.kind === 'expense') {
                    const date = t.occurredOn;
                    const secName = t.category?.section?.name || 'Uncategorized';
                    const amt = parseFloat(t.amount);

                    if (!dailySectionMap.has(date)) {
                        dailySectionMap.set(date, new Map());
                    }
                    const daySecs = dailySectionMap.get(date)!;
                    daySecs.set(secName, (daySecs.get(secName) || 0) + amt);
                }
            }

            // Apply the daily section values to dailyTrend
            dailyTrend.forEach(row => {
                const daySecs = dailySectionMap.get(row.date);
                if (daySecs) {
                    daySecs.forEach((amt, name) => {
                        row[name] = amt;
                    });
                }
            });

            dailyTrend.sort((a, b) => a.date.localeCompare(b.date));

            return {
                totalIncome,
                totalExpense,
                net: totalIncome - totalExpense,
                spendingBySection,
                dailyTrend,
                sections: allSections,
                transactions: txs
            };
        },
        [`dashboard-stats-${userId}-${year}-${month}`],
        {
            revalidate: 3600, // Cache for 1 hour by default
            tags: [`transactions-${userId}`] // Tag allows manual revalidation on mutation
        }
    )();
}
