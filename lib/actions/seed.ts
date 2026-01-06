'use server';

import { db } from '@/lib/db';
import { category, userProfile } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import { User } from '@supabase/supabase-js';

const DEFAULT_CATEGORIES = [
    { name: 'Salary', type: 'income' },
    { name: 'Other Income', type: 'income' },
    { name: 'Rent', type: 'expense' },
    { name: 'Groceries', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Eating Out', type: 'expense' },
    { name: 'Utilities', type: 'expense' },
    { name: 'Tithing', type: 'expense' },
    { name: 'Advance Campaign', type: 'expense' },
    { name: 'Other Expense', type: 'expense' },
] as const;

export async function ensureUserExists(user: User) {
    try {
        // Check first to avoid "Failed query" errors if onConflictDoNothing has issues with current driver/permissions
        const existing = await db.query.userProfile.findFirst({
            where: eq(userProfile.userId, user.id)
        });

        if (existing) return;

        await db.insert(userProfile).values({
            userId: user.id,
            displayName: user?.email?.split('@')[0] || 'User',
        }).onConflictDoNothing({ target: userProfile.userId });
    } catch (error) {
        // Log but don't crash - this is non-critical for main app flow
        console.error('Error ensuring user profile:', error instanceof Error ? error.message : error);
    }
}

export async function seedCategories(userId: string) {
    try {
        // Check if user has any categories
        const [existing] = await db.select({ count: count() }).from(category).where(eq(category.userId, userId));

        if (existing && existing.count > 0) {
            return; // Already seeded
        }

        console.log(`Seeding categories for user ${userId}`);

        // Insert defaults
        await db.insert(category).values(
            DEFAULT_CATEGORIES.map(cat => ({
                userId,
                name: cat.name,
                type: cat.type,
            }))
        );
    } catch (error) {
        // Log error but do not throw. If DB is down, we want to render the error page in Dashboard, not crash here.
        console.error('Error seeding categories (DB likely down):', error instanceof Error ? error.message : error);
    }
}
