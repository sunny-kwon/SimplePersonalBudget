import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ensureUserExists, seedCategories } from '@/lib/actions/seed';
import { SignOutButton } from '@/components/sign-out-button';
import Link from 'next/link';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Ensure user profile and categories exist
    await ensureUserExists(user);
    await seedCategories(user.id);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <span className="text-xl font-bold text-indigo-600">Budget</span>
                            </div>
                            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/transactions"
                                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                >
                                    Transactions
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">{user.email}</span>
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </nav>
            <div className="py-10">
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 bg-white shadow rounded-lg p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
