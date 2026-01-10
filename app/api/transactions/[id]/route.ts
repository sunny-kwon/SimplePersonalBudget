import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { transaction } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { amount, categoryId, occurredOn, note, kind } = body;

        // Validate input
        if (amount !== undefined && (typeof amount !== 'string' || isNaN(parseFloat(amount)) || parseFloat(amount) < 0)) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }
        if (categoryId !== undefined && categoryId !== null && typeof categoryId !== 'string') {
            return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 });
        }
        if (occurredOn !== undefined && typeof occurredOn !== 'string') {
            return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
        }
        if (kind !== undefined && !['income', 'expense'].includes(kind)) {
            return NextResponse.json({ error: 'Invalid kind' }, { status: 400 });
        }

        // Validate that transaction belongs to user
        const existing = await db.query.transaction.findFirst({
            where: eq(transaction.id, id)
        });

        if (!existing || existing.userId !== user.id) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Build update object with only provided fields
        const updateData: {
            amount?: string;
            categoryId?: string | null;
            occurredOn?: string;
            note?: string | null;
            kind?: 'income' | 'expense';
            updatedAt: Date;
        } = { updatedAt: new Date() };

        if (amount !== undefined) updateData.amount = amount;
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (occurredOn !== undefined) updateData.occurredOn = occurredOn;
        if (note !== undefined) updateData.note = note;
        if (kind !== undefined) updateData.kind = kind;

        // Update transaction
        const updated = await db.update(transaction)
            .set(updateData)
            .where(eq(transaction.id, id))
            .returning();

        revalidatePath('/');
        revalidateTag(`transactions-${user.id}`, 'page');

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json(
            { error: 'Failed to update transaction' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Validate that transaction belongs to user
        const existing = await db.query.transaction.findFirst({
            where: eq(transaction.id, id)
        });

        if (!existing || existing.userId !== user.id) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Delete transaction
        await db.delete(transaction).where(eq(transaction.id, id));

        revalidatePath('/');
        revalidateTag(`transactions-${user.id}`, 'page');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json(
            { error: 'Failed to delete transaction' },
            { status: 500 }
        );
    }
}
