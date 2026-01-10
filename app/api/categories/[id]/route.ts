import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { category } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

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
        const { name, sectionId } = body;

        // Validate input
        if (name !== undefined && typeof name !== 'string') {
            return new NextResponse('Invalid name', { status: 400 });
        }
        if (sectionId !== undefined && sectionId !== null && typeof sectionId !== 'string') {
            return new NextResponse('Invalid sectionId', { status: 400 });
        }

        const updateData: { name?: string; sectionId?: string | null } = {};
        if (name !== undefined) updateData.name = name.trim();
        if (sectionId !== undefined) updateData.sectionId = sectionId;

        const [updated] = await db
            .update(category)
            .set(updateData)
            .where(and(eq(category.id, categoryId), eq(category.userId, user.id)))
            .returning();

        if (updated) {
            revalidatePath('/');
            revalidateTag(`transactions-${user.id}`);
        }

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

        if (deleted) {
            revalidatePath('/');
            revalidateTag(`transactions-${user.id}`);
        }

        if (!deleted) {
            return new NextResponse('Category not found', { status: 404 });
        }

        return NextResponse.json(deleted);
    } catch (error) {
        console.error('Error deleting category:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
