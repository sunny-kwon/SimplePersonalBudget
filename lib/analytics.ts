import { db } from '@/lib/db';
import { transaction, section, category, budgetConfig, budgetAllocation } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql, isNull } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { DateTime } from 'luxon';

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
    startDate: string;
    endDate: string;
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
    budget: {
        totalTarget: number;
        planned: number;
        realized: number; // Total income in period
        sections: {
            sectionId: string;
            planned: number;
            actual: number;
            categories: {
                categoryId: string;
                name: string;
                actual: number;
                planned: number;
            }[];
        }[];
    } | null;
    transactions: TransactionWithCategory[];
}

const FALLBACK_COLOR = '#6366f1';

function getPeriodBoundaries(anchorDate: string, period: 'weekly' | 'bi-weekly' | 'monthly', targetDate: Date) {
    const target = DateTime.fromJSDate(targetDate).startOf('day');
    const start = DateTime.fromISO(anchorDate).startOf('day');

    if (period === 'monthly') {
        // Month is always calendar month for now, but centered around the same day as anchor?
        // Actually user said they want it to refresh based on income.
        // If monthly, many people still use calendar month. 
        // Let's use calendar month boundaries of the target date for 'monthly'.
        return {
            start: target.startOf('month'),
            end: target.endOf('month')
        };
    }

    const days = period === 'weekly' ? 7 : 14;

    // Find how many full periods have passed since anchor to target
    const diffDays = target.diff(start, 'days').days;
    const periodsPassed = Math.floor(diffDays / days);

    const periodStart = start.plus({ days: periodsPassed * days });
    const periodEnd = periodStart.plus({ days: days - 1 }).endOf('day');

    return {
        start: periodStart,
        end: periodEnd
    };
}

/**
 * Optimized dashboard stats fetcher.
 * Uses unstable_cache to make repeats extremely fast across requests.
 */
export async function getDashboardStats(userId: string, targetDate: Date = new Date()): Promise<DashboardStats> {
    const dateKey = DateTime.fromJSDate(targetDate).toISODate();

    return unstable_cache(
        async () => {
            // 1. Fetch budget config to determine period boundaries
            const [bConfig] = await db.select().from(budgetConfig).where(eq(budgetConfig.userId, userId));

            const anchorDate = bConfig?.cycleStartDate || DateTime.now().startOf('month').toISODate();
            const periodType = bConfig?.period || 'monthly';

            const { start, end } = getPeriodBoundaries(anchorDate, periodType, targetDate);
            const startStr = start.toISODate()!;
            const endStr = end.toISODate()!;

            // 2. Fetch all transactions for this period
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

            // 3. Fetch all budget allocations (both section and category levels)
            const bAllocationsRaw = await db.select().from(budgetAllocation).where(eq(budgetAllocation.userId, userId));

            const allSectionsData = await db.query.section.findMany({
                where: eq(section.userId, userId),
                with: {
                    categories: true
                }
            });

            const expenseSectionIds = new Set(
                allSectionsData
                    .filter(s => s.categories.length === 0 || s.categories.some(c => c.type === 'expense' || c.type === 'both'))
                    .map(s => s.id)
            );

            // Filter raw allocations to only those belonging to expense sections
            const bAllocations = bAllocationsRaw.filter(a => expenseSectionIds.has(a.sectionId));

            // Aggregates
            let totalIncome = 0;
            let totalExpense = 0;
            const sectionMap = new Map<string, { name: string; color: string; amount: number }>();
            const categoryMap = new Map<string, { name: string; amount: number; sectionId: string }>();
            const dailyMap = new Map<string, { income: number; expense: number }>();

            // Pre-fill daily map for the period
            let curr = start;
            while (curr <= end) {
                dailyMap.set(curr.toISODate()!, { income: 0, expense: 0 });
                curr = curr.plus({ days: 1 });
            }

            for (const t of txs) {
                const amt = parseFloat(t.amount);
                const dayStats = dailyMap.get(t.occurredOn) || { income: 0, expense: 0 };

                if (t.kind === 'income') {
                    totalIncome += amt;
                    dayStats.income += amt;
                } else {
                    totalExpense += amt;
                    dayStats.expense += amt;

                    const s = t.category?.section;
                    const c = t.category;
                    const secId = s?.id || 'unassigned';

                    if (!sectionMap.has(secId)) {
                        sectionMap.set(secId, {
                            name: s?.name || 'Uncategorized',
                            color: s?.color || FALLBACK_COLOR,
                            amount: 0
                        });
                    }
                    sectionMap.get(secId)!.amount += amt;

                    if (c) {
                        const catId = c.id;
                        if (!categoryMap.has(catId)) {
                            categoryMap.set(catId, {
                                name: c.name,
                                amount: 0,
                                sectionId: secId
                            });
                        }
                        categoryMap.get(catId)!.amount += amt;
                    }
                }

                if (dailyMap.has(t.occurredOn)) {
                    dailyMap.set(t.occurredOn, dayStats);
                }
            }

            // Spending by Section
            const spendingBySection = Array.from(sectionMap.entries())
                .map(([id, data]) => ({
                    sectionId: id,
                    sectionName: data.name,
                    color: data.color,
                    amount: data.amount,
                    percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0
                }))
                .sort((a, b) => b.amount - a.amount);

            // Expense Sections for display
            const allSections = allSectionsData
                .filter(s => s.categories.length === 0 || s.categories.some(c => c.type === 'expense' || c.type === 'both'))
                .map(s => ({ id: s.id, name: s.name, color: s.color }));

            // Daily Trend with per-section breakdown
            const dailySectionMap = new Map<string, Map<string, number>>();
            for (const t of txs) {
                if (t.kind === 'expense') {
                    const secName = t.category?.section?.name || 'Uncategorized';
                    const amt = parseFloat(t.amount);
                    if (!dailySectionMap.has(t.occurredOn)) dailySectionMap.set(t.occurredOn, new Map());
                    const ds = dailySectionMap.get(t.occurredOn)!;
                    ds.set(secName, (ds.get(secName) || 0) + amt);
                }
            }

            const dailyTrend = Array.from(dailyMap.entries()).map(([date, data]) => {
                const row: { date: string; income: number; expense: number } & Record<string, string | number> = {
                    date,
                    income: data.income,
                    expense: data.expense
                };
                allSections.forEach(s => row[s.name] = 0);
                const daySecs = dailySectionMap.get(date);
                if (daySecs) daySecs.forEach((amt: number, name: string) => row[name] = amt);
                return row;
            }).sort((a, b) => (a.date as string).localeCompare(b.date as string));

            // Helper to calculate planned amount from allocation
            const calculatePlanned = (a: { allocationType: string; percentage: string; amount: string }, totalTarget: number) => {
                return a.allocationType === 'percentage'
                    ? (totalTarget * parseFloat(a.percentage) / 100)
                    : parseFloat(a.amount);
            };

            const totalTarget = bConfig ? parseFloat(bConfig.totalTarget) : 0;

            return {
                totalIncome,
                totalExpense,
                net: totalIncome - totalExpense,
                startDate: startStr,
                endDate: endStr,
                spendingBySection,
                dailyTrend,
                sections: allSections,
                transactions: txs,
                budget: bConfig ? {
                    totalTarget: totalTarget,
                    realized: totalIncome,
                    planned: bAllocations
                        .filter(a => a.categoryId === null) // Section totals are based on section-level allocations
                        .reduce((sum, a) => sum + calculatePlanned(a, totalTarget), 0),
                    sections: bAllocations
                        .filter(a => a.categoryId === null)
                        .map(a => {
                            // Find all categories for this section that have either a budget or spending
                            const sectionCategories = new Map<string, { name: string; actual: number; planned: number }>();

                            // 1. Add categories with budget allocations
                            bAllocations
                                .filter(ba => ba.sectionId === a.sectionId && ba.categoryId !== null)
                                .forEach(ba => {
                                    const catId = ba.categoryId!;
                                    const catName = allSectionsData.find(s => s.id === a.sectionId)?.categories.find(c => c.id === catId)?.name || 'Unknown';
                                    sectionCategories.set(catId, {
                                        name: catName,
                                        actual: 0,
                                        planned: calculatePlanned(ba, totalTarget)
                                    });
                                });

                            // 2. Aggregate actual spending (updating existing or adding new)
                            for (const [catId, data] of categoryMap.entries()) {
                                if (data.sectionId === a.sectionId) {
                                    const existing = sectionCategories.get(catId) || { name: data.name, actual: 0, planned: 0 };
                                    existing.actual = data.amount;
                                    sectionCategories.set(catId, existing);
                                }
                            }

                            return {
                                sectionId: a.sectionId,
                                planned: calculatePlanned(a, totalTarget),
                                actual: sectionMap.get(a.sectionId)?.amount || 0,
                                categories: Array.from(sectionCategories.entries())
                                    .map(([id, data]) => ({
                                        categoryId: id,
                                        name: data.name,
                                        actual: data.actual,
                                        planned: data.planned
                                    }))
                                    .sort((a, b) => b.actual - a.actual)
                            };
                        })
                } : null
            };
        },
        [`dashboard-stats-${userId}-${dateKey}`],
        {
            revalidate: 3600,
            tags: [`transactions-${userId}`, `budget-${userId}`]
        }
    )();
}
