import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transaction } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const transactions = await db.query.transaction.findMany({
            where: eq(transaction.userId, user.id),
            with: { category: true },
            orderBy: [desc(transaction.occurredOn)],
        });

        // Generate CSV
        const headers = ['Date', 'Category', 'Type', 'Amount', 'Note'];
        const rows = transactions.map(t => [
            t.occurredOn,
            t.category?.name || 'Uncategorized',
            t.kind,
            t.amount,
            t.note || ''
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
