'use server';

import { db } from '@/lib/db';
import { category, userProfile, section } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import { User } from '@supabase/supabase-js';

const DEFAULT_SECTIONS = [
    { name: 'Income', order: '0', color: '#22c55e' },
    { name: 'Giving', order: '1', color: '#ec4899' },
    { name: 'Needs', order: '2', color: '#ef4444' },
    { name: 'Food', order: '3', color: '#f59e0b' },
    { name: 'Wants', order: '4', color: '#8b5cf6' },
    { name: 'Savings', order: '5', color: '#3b82f6' },
] as const;

const DEFAULT_CATEGORIES = [
    // Income
    { name: 'Salary', type: 'income' as const, sectionName: 'Income' },

    // Giving
    { name: 'Tithe', type: 'expense' as const, sectionName: 'Giving' },
    { name: 'Gifts', type: 'expense' as const, sectionName: 'Giving' },

    // Needs
    { name: 'Rent', type: 'expense' as const, sectionName: 'Needs' },
    { name: 'Transport', type: 'expense' as const, sectionName: 'Needs' },
    { name: 'Utilities', type: 'expense' as const, sectionName: 'Needs' },
    { name: 'Car Payment', type: 'expense' as const, sectionName: 'Needs' },

    // Food
    { name: 'Groceries', type: 'expense' as const, sectionName: 'Food' },
    { name: 'Dining Out', type: 'expense' as const, sectionName: 'Food' },

    // Wants
    { name: 'Netflix', type: 'expense' as const, sectionName: 'Wants' },
    { name: 'Spotify', type: 'expense' as const, sectionName: 'Wants' },
    { name: 'Miscellaneous', type: 'expense' as const, sectionName: 'Wants' },

    // Savings
    { name: 'Emergency Fund', type: 'expense' as const, sectionName: 'Savings' },
    { name: 'Travel Fund', type: 'expense' as const, sectionName: 'Savings' },
    { name: 'Roth IRA', type: 'expense' as const, sectionName: 'Savings' },
] as const;

export async function ensureUserExists(user: User) {
    try {
        const existing = await db.query.userProfile.findFirst({
            where: eq(userProfile.userId, user.id)
        });

        if (existing) return;

        await db.insert(userProfile).values({
            userId: user.id,
            displayName: user?.email?.split('@')[0] || 'User',
        }).onConflictDoNothing({ target: userProfile.userId });
    } catch (error) {
        console.error('Error ensuring user profile:', error instanceof Error ? error.message : error);
    }
}

export async function seedCategories(userId: string) {
    try {
        // 1. Ensure sections exist
        const userSections = await db.query.section.findMany({
            where: eq(section.userId, userId)
        });

        let sectionsMap = new Map<string, string>();

        if (userSections.length === 0) {
            console.log(`Seeding sections for user ${userId}`);
            const insertedSections = await db.insert(section).values(
                DEFAULT_SECTIONS.map(s => ({
                    userId,
                    name: s.name,
                    order: s.order,
                    color: s.color,
                }))
            ).returning();

            insertedSections.forEach(s => sectionsMap.set(s.name, s.id));
        } else {
            userSections.forEach(s => sectionsMap.set(s.name, s.id));
        }

        // 2. Fetch current categories
        const userCategories = await db.query.category.findMany({
            where: eq(category.userId, userId)
        });

        if (userCategories.length === 0) {
            console.log(`Seeding categories for user ${userId}`);
            await db.insert(category).values(
                DEFAULT_CATEGORIES.map(cat => ({
                    userId,
                    name: cat.name,
                    type: cat.type,
                    sectionId: sectionsMap.get(cat.sectionName) || null,
                }))
            );
        } else {
            // 3. Robust migration logic
            for (const cat of userCategories) {
                if (!cat.sectionId) {
                    const defaultCat = DEFAULT_CATEGORIES.find(d => d.name === cat.name);
                    const sectionId = defaultCat ? sectionsMap.get(defaultCat.sectionName) : (cat.type === 'income' ? sectionsMap.get('Income') : sectionsMap.get('Wants'));

                    await db.update(category)
                        .set({ sectionId })
                        .where(eq(category.id, cat.id));
                }
            }
        }
    } catch (error) {
        console.error('Error seeding categories/sections:', error instanceof Error ? error.message : error);
    }
}
