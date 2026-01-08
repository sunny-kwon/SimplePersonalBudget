import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { section } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const resolvedParams = await params;
        const sectionId = resolvedParams.id;
        const body = await request.json();
        const { name, order, color } = body;

        const updateData: { name?: string; order?: string; color?: string } = {};
        if (name !== undefined) updateData.name = name.trim();
        if (order !== undefined) updateData.order = order.toString();
        if (color !== undefined) updateData.color = color;

        const [updated] = await db
            .update(section)
            .set(updateData)
            .where(and(eq(section.id, sectionId), eq(section.userId, user.id)))
            .returning();

        if (!updated) {
            return new NextResponse('Section not found', { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating section:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const resolvedParams = await params;
        const sectionId = resolvedParams.id;

        const [deleted] = await db
            .delete(section)
            .where(and(eq(section.id, sectionId), eq(section.userId, user.id)))
            .returning();

        if (!deleted) {
            return new NextResponse('Section not found', { status: 404 });
        }

        return NextResponse.json(deleted);
    } catch (error) {
        console.error('Error deleting section:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
