import { pgTable, uuid, text, timestamp, char, numeric, date, boolean, unique, index, check, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

// Users table (mirrors auth.users)
export const userProfile = pgTable('user_profile', {
    userId: uuid('user_id').primaryKey().notNull(), // References auth.users(id) - FK managed by Supabase/Postgres
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    displayName: text('display_name'),
    currency: char('currency', { length: 3 }).default('USD').notNull(),
    dateFormat: text('date_format').default('MM/DD/YYYY').notNull(),
});

// Sections table
export const section = pgTable('section', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => userProfile.userId, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color').default('#6366f1').notNull(),
    order: numeric('order').default('0').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
    userIdIdx: index('section_user_id_idx').on(t.userId),
}));

export const sectionRelations = relations(section, ({ many }) => ({
    categories: many(category),
}));

// Categories table
export const category = pgTable('category', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => userProfile.userId, { onDelete: 'cascade' }),
    sectionId: uuid('section_id').references(() => section.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    type: text('type', { enum: ['expense', 'income', 'both'] }).notNull(),
    icon: text('icon'),
    archived: boolean('archived').default(false).notNull(),
}, (t) => ({
    unq: unique().on(t.userId, t.name), // Note: name is case sensitive here unless we use a custom SQL type or functional index, Drizzle simplified
    userIdIdx: index('category_user_id_idx').on(t.userId),
    sectionIdIdx: index('category_section_id_idx').on(t.sectionId),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
    section: one(section, {
        fields: [category.sectionId],
        references: [section.id],
    }),
    transactions: many(transaction),
}));

// Transactions table
export const transaction = pgTable('transaction', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => userProfile.userId, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => category.id, { onDelete: 'set null' }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    kind: text('kind', { enum: ['expense', 'income'] }).notNull(),
    occurredOn: date('occurred_on').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
}, (t) => ({
    userDateIdx: index('trx_user_date_idx').on(t.userId, t.occurredOn),
    userKindIdx: index('trx_user_kind_idx').on(t.userId, t.kind),
    userCategoryIdx: index('trx_user_category_idx').on(t.userId, t.categoryId),
    positiveAmountCheck: check('amount_check', sql`${t.amount} >= 0`),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
    category: one(category, {
        fields: [transaction.categoryId],
        references: [category.id],
    }),
}));

// Tags table
export const tag = pgTable('tag', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => userProfile.userId, { onDelete: 'cascade' }),
    name: text('name').notNull(),
}, (t) => ({
    unq: unique().on(t.userId, t.name),
}));

// Transaction Tags join table
export const transactionTag = pgTable('transaction_tag', {
    transactionId: uuid('transaction_id').references(() => transaction.id, { onDelete: 'cascade' }).notNull(),
    tagId: uuid('tag_id').references(() => tag.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.transactionId, t.tagId] }),
}));

// Budget Configuration table
export const budgetConfig = pgTable('budget_config', {
    userId: uuid('user_id').primaryKey().notNull().references(() => userProfile.userId, { onDelete: 'cascade' }),
    period: text('period', { enum: ['weekly', 'bi-weekly', 'monthly'] }).default('monthly').notNull(),
    totalTarget: numeric('total_target', { precision: 12, scale: 2 }).default('0').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Budget Allocation table
export const budgetAllocation = pgTable('budget_allocation', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => userProfile.userId, { onDelete: 'cascade' }),
    sectionId: uuid('section_id').notNull().references(() => section.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => category.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 12, scale: 2 }).default('0').notNull(),
    percentage: numeric('percentage', { precision: 5, scale: 2 }).default('0').notNull(),
    allocationType: text('allocation_type', { enum: ['amount', 'percentage'] }).default('amount').notNull(),
}, (t) => ({
    userIdIdx: index('budget_alloc_user_id_idx').on(t.userId),
    sectionIdIdx: index('budget_alloc_section_id_idx').on(t.sectionId),
    unqSection: uniqueIndex('unq_section_budget').on(t.userId, t.sectionId).where(sql`category_id IS NULL`),
    unqCategory: uniqueIndex('unq_category_budget').on(t.userId, t.categoryId).where(sql`category_id IS NOT NULL`),
}));

export const budgetConfigRelations = relations(budgetConfig, ({ one }) => ({
    user: one(userProfile, {
        fields: [budgetConfig.userId],
        references: [userProfile.userId],
    }),
}));

export const budgetAllocationRelations = relations(budgetAllocation, ({ one }) => ({
    section: one(section, {
        fields: [budgetAllocation.sectionId],
        references: [section.id],
    }),
    category: one(category, {
        fields: [budgetAllocation.categoryId],
        references: [category.id],
    }),
}));
