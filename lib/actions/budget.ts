'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { budgetConfig, budgetAllocation, section, category } from '@/lib/db/schema';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getBudgetData() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const [config] = await db.select().from(budgetConfig).where(eq(budgetConfig.userId, user.id));
    const allocations = await db.select().from(budgetAllocation).where(eq(budgetAllocation.userId, user.id));

    // Fetch sections and categories to build the UI structure
    const allSections = await db.query.section.findMany({
        where: eq(section.userId, user.id),
        orderBy: (section, { asc }) => [asc(section.order)],
        with: {
            categories: true
        }
    });

    // Filter to only expense sections (at least one category is not income)
    const expenseSections = allSections.filter(s =>
        s.categories.length === 0 ||
        s.categories.some(c => c.type === 'expense' || c.type === 'both')
    );

    const expenseSectionIds = new Set(expenseSections.map(s => s.id));
    const allValidCategoryIds = new Set(expenseSections.flatMap(s => s.categories.map(c => c.id)));

    const filteredAllocations = allocations.filter(a => {
        const isSectionAlloc = a.categoryId === null;
        if (isSectionAlloc) return expenseSectionIds.has(a.sectionId);
        return allValidCategoryIds.has(a.categoryId!);
    });

    return {
        config: config || { userId: user.id, period: 'monthly', totalTarget: '0' },
        allocations: filteredAllocations,
        sections: expenseSections
    };
}

export async function updateBudgetConfig(data: { period: 'weekly' | 'bi-weekly' | 'monthly', totalTarget: string }) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    await db.insert(budgetConfig)
        .values({
            userId: user.id,
            period: data.period,
            totalTarget: data.totalTarget,
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: budgetConfig.userId,
            set: {
                period: data.period,
                totalTarget: data.totalTarget,
                updatedAt: new Date(),
            }
        });

    revalidatePath('/budget');
    revalidatePath('/');
}

// Improved updateAllocation that uses simpler logic to avoid Drizzle's onConflict limitations with partial indexes.
export async function saveAllocation(data: {
    sectionId: string;
    categoryId: string | null;
    amount: string;
    percentage: string;
    allocationType: 'amount' | 'percentage';
}) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Ensure categoryId is strictly a string or null (never empty string)
    const catId = data.categoryId && data.categoryId.trim() !== '' ? data.categoryId : null;

    // Fix empty string inputs for numeric types
    const amount = !data.amount || data.amount.trim() === '' ? '0' : data.amount;
    const percentage = !data.percentage || data.percentage.trim() === '' ? '0' : data.percentage;

    const existing = await db.query.budgetAllocation.findFirst({
        where: and(
            eq(budgetAllocation.userId, user.id),
            catId
                ? eq(budgetAllocation.categoryId, catId) // Category is global, ignore sectionId for lookup
                : and(eq(budgetAllocation.sectionId, data.sectionId), isNull(budgetAllocation.categoryId))
        )
    });

    if (existing) {
        await db.update(budgetAllocation)
            .set({
                sectionId: data.sectionId, // Update sectionId in case category moved
                amount: amount,
                percentage: percentage,
                allocationType: data.allocationType,
            })
            .where(eq(budgetAllocation.id, existing.id));
    } else {
        await db.insert(budgetAllocation)
            .values({
                userId: user.id,
                sectionId: data.sectionId,
                categoryId: catId,
                amount: amount,
                percentage: percentage,
                allocationType: data.allocationType,
            });
    }

    revalidatePath('/budget');
    revalidatePath('/');
}
export async function deleteAllocation(sectionId: string, categoryId: string | null) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    await db.delete(budgetAllocation)
        .where(
            and(
                eq(budgetAllocation.userId, user.id),
                eq(budgetAllocation.sectionId, sectionId),
                categoryId ? eq(budgetAllocation.categoryId, categoryId) : isNull(budgetAllocation.categoryId)
            )
        );

    revalidatePath('/budget');
    revalidatePath('/');
}
