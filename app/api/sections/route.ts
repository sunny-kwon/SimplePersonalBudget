import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { section } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const data = await db.query.section.findMany({
            where: eq(section.userId, user.id),
            orderBy: (section, { asc }) => [asc(section.order)],
            with: {
                categories: true
            }
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { name, order, color } = body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return new NextResponse('Name is required', { status: 400 });
        }

        const [newSection] = await db.insert(section).values({
            userId: user.id,
            name: name.trim(),
            order: order?.toString() || '0',
            color: color || '#6366f1',
        }).returning();

        return NextResponse.json(newSection);
    } catch (error) {
        console.error('Error creating section:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
