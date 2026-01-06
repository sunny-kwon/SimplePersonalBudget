import { db } from '@/lib/db';
import { transaction } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// Define the transaction type with its relations as returned by Drizzle query
export type TransactionWithCategory = typeof transaction.$inferSelect & {
    category: {
        name: string;
        color: string | null;
        icon: string | null;
        type: "income" | "expense" | "both";
        id: string;
        userId: string;
        archived: boolean;
    } | null;
}

export interface DashboardStats {
    totalIncome: number;
    totalExpense: number;
    net: number;
    spendingByCategory: {
        categoryId: string;
        categoryName: string;
        color: string | null;
        amount: number;
    }[];
    dailyTrend: {
        date: string;
        income: number;
        expense: number;
    }[];
    transactions: TransactionWithCategory[];
}

const FALLBACK_COLORS = [
    '#6366f1', // Indigo
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#14b8a6', // Teal
];

export async function getDashboardStats(userId: string, monthDate: Date = new Date()): Promise<DashboardStats> {
    // 1. Determine date range for the month
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const startStr = startOfMonth.toISOString().split('T')[0];
    const endStr = endOfMonth.toISOString().split('T')[0];

    // 2. Fetch all transactions for this month
    const txs = await db.query.transaction.findMany({
        where: and(
            eq(transaction.userId, userId),
            gte(transaction.occurredOn, startStr),
            lte(transaction.occurredOn, endStr)
        ),
        with: {
            category: true
        },
        orderBy: [desc(transaction.occurredOn), desc(transaction.createdAt)]
    });

    // 3. Aggregate
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = new Map<string, { name: string; color: string | null; amount: number }>();
    const dailyMap = new Map<string, { income: number; expense: number }>();

    // Initialize daily map with all days in month
    const daysInMonth = endOfMonth.getDate();
    for (let d = 1; d <= daysInMonth; d++) {
        // Construct YYYY-MM-DD manually to avoid timezone issues:
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        dailyMap.set(dateStr, { income: 0, expense: 0 });
    }

    // Process transactions
    for (const t of txs) {
        const amt = parseFloat(t.amount);
        const dayStats = dailyMap.get(t.occurredOn) || { income: 0, expense: 0 };

        if (t.kind === 'income') {
            totalIncome += amt;
            dayStats.income += amt;
        } else {
            totalExpense += amt;
            dayStats.expense += amt;

            // Aggregate expenses by category
            const catId = t.categoryId || 'uncategorized';
            const catName = t.category?.name || 'Uncategorized';
            // Use existing color OR fallback based on simple hash of ID
            let catColor = t.category?.color || null;

            if (!categoryMap.has(catId)) {
                if (!catColor) {
                    // Assign fallback color deterministically
                    let hash = 0;
                    for (let i = 0; i < catId.length; i++) {
                        hash = catId.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const index = Math.abs(hash) % FALLBACK_COLORS.length;
                    catColor = FALLBACK_COLORS[index];
                }
                categoryMap.set(catId, { name: catName, color: catColor, amount: 0 });
            }

            const current = categoryMap.get(catId)!;
            current.amount += amt;
        }

        // Update daily map (only if key exists, which it should from initialization)
        if (dailyMap.has(t.occurredOn)) {
            dailyMap.set(t.occurredOn, dayStats);
        }
    }

    // Convert map to array and sort by amount desc
    const spendingByCategory = Array.from(categoryMap.entries())
        .map(([id, data]) => ({
            categoryId: id,
            categoryName: data.name,
            color: data.color,
            amount: data.amount
        }))
        .sort((a, b) => b.amount - a.amount);

    const dailyTrend = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
        spendingByCategory,
        dailyTrend,
        transactions: txs
    };
}
