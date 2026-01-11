import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CategoryManager } from '@/components/category-manager';
import { Settings2 } from 'lucide-react';
import { db } from '@/lib/db';
import { userProfile } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function CategoriesPage() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const profile = await db.query.userProfile.findFirst({
        where: eq(userProfile.userId, user.id)
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Settings2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Management</h1>
                    <p className="text-gray-500 text-sm font-medium">Configure your budgeting sections and categories</p>
                </div>
            </div>

            <CategoryManager onboardingCompleted={!!profile?.onboardingCompleted} />
        </div>
    );
}
