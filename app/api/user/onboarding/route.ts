import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userProfile } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { completed } = body;

        if (typeof completed !== 'boolean') {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }

        const updated = await db.update(userProfile)
            .set({ onboardingCompleted: completed })
            .where(eq(userProfile.userId, user.id))
            .returning();

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Error updating onboarding status:', error);
        return NextResponse.json(
            { error: 'Failed to update onboarding status' },
            { status: 500 }
        );
    }
}
