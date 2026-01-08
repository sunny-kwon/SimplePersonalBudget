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
        const { name, type, icon, sectionId } = body;

        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return new NextResponse('Name is required', { status: 400 });
        }
        if (!type || !['income', 'expense', 'both'].includes(type)) {
            return new NextResponse('Invalid type', { status: 400 });
        }

        const [newCategory] = await db.insert(category).values({
            userId: user.id,
            name: name.trim(),
            type,
            icon: icon || null,
            sectionId: sectionId || null,
        }).returning();

        return NextResponse.json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
