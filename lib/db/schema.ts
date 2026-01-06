import { pgTable, uuid, text, timestamp, char, numeric, date, boolean, unique, index, check, primaryKey } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

// Users table (mirrors auth.users)
export const userProfile = pgTable('user_profile', {
    userId: uuid('user_id').primaryKey().notNull(), // References auth.users(id) - FK managed by Supabase/Postgres
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    displayName: text('display_name'),
    currency: char('currency', { length: 3 }).default('USD').notNull(),
    dateFormat: text('date_format').default('MM/DD/YYYY').notNull(),
});

// Categories table
export const category = pgTable('category', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(), // References auth.users(id)
    name: text('name').notNull(),
    type: text('type', { enum: ['expense', 'income', 'both'] }).notNull(),
    color: text('color'),
    icon: text('icon'),
    archived: boolean('archived').default(false).notNull(),
}, (t) => ({
    unq: unique().on(t.userId, t.name), // Note: name is case sensitive here unless we use a custom SQL type or functional index, Drizzle simplified
    userIdIdx: index('category_user_id_idx').on(t.userId),
}));

export const categoryRelations = relations(category, ({ many }) => ({
    transactions: many(transaction),
}));

// Transactions table
export const transaction = pgTable('transaction', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(), // References auth.users(id)
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
    userId: uuid('user_id').notNull(), // References auth.users(id)
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

