import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { transaction } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const { searchParams } = new URL(request.url);

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    // Simple pagination logic could be improved with cursors, but limit is fine for MVP Lists

    try {
        const transactions = await db.query.transaction.findMany({
            where: eq(transaction.userId, user.id),
            orderBy: [desc(transaction.occurredOn), desc(transaction.createdAt)],
            limit: limit,
            with: {
                category: true // Include category details
            }
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const { amount, kind, occurredOn, categoryId, note } = body;

        // Validate required fields
        if (!amount || typeof amount === 'undefined') {
            return new NextResponse('Amount is required', { status: 400 });
        }
        if (!kind || !['income', 'expense'].includes(kind)) {
            return new NextResponse('Invalid kind', { status: 400 });
        }
        if (!occurredOn || typeof occurredOn !== 'string') {
            return new NextResponse('Date is required', { status: 400 });
        }

        // Validate amount is positive number
        const amountNum = parseFloat(amount.toString());
        if (isNaN(amountNum) || amountNum < 0) {
            return new NextResponse('Invalid amount', { status: 400 });
        }

        const [newTransaction] = await db.insert(transaction).values({
            userId: user.id,
            amount: amount.toString(),
            kind,
            occurredOn,
            categoryId: categoryId || null,
            note: note || null,
        }).returning();

        revalidatePath('/');
        revalidateTag(`transactions-${user.id}`, 'page');

        return NextResponse.json(newTransaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
