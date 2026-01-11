import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { userProfile } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { BudgetContent } from '@/components/budget-content';

export default async function BudgetPage() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const profile = await db.query.userProfile.findFirst({
        where: eq(userProfile.userId, user.id)
    });

    return <BudgetContent onboardingCompleted={!!profile?.onboardingCompleted} />;
}
