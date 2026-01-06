import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { category } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params are async in Next.js 15+
) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    const categoryId = resolvedParams.id;

    try {
        const body = await request.json();
        const { name, color } = body;

        // Validate input
        if (name !== undefined && typeof name !== 'string') {
            return new NextResponse('Invalid name', { status: 400 });
        }
        if (color !== undefined && typeof color !== 'string') {
            return new NextResponse('Invalid color', { status: 400 });
        }

        const updateData: { name?: string; color?: string } = {};
        if (name !== undefined) updateData.name = name.trim();
        if (color !== undefined) updateData.color = color;

        const [updated] = await db
            .update(category)
            .set(updateData)
            .where(and(eq(category.id, categoryId), eq(category.userId, user.id)))
            .returning();

        if (!updated) {
            return new NextResponse('Category not found', { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating category:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    const categoryId = resolvedParams.id;

    try {
        const [deleted] = await db
            .delete(category)
            .where(and(eq(category.id, categoryId), eq(category.userId, user.id)))
            .returning();

        if (!deleted) {
            return new NextResponse('Category not found', { status: 404 });
        }

        return NextResponse.json(deleted);
    } catch (error) {
        console.error('Error deleting category:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
