import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { category } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const categories = await db.query.category.findMany({
        where: eq(category.userId, user.id),
        orderBy: [asc(category.type), asc(category.name)],
    });

    return NextResponse.json(categories);
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
        const { name, type, color, icon } = body;

        if (!name || !type) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const [newCategory] = await db.insert(category).values({
            userId: user.id,
            name,
            type,
            color,
            icon,
        }).returning();

        return NextResponse.json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
