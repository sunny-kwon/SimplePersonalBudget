import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { ensureUserExists, seedCategories } from '@/lib/actions/seed';
import { SignOutButton } from '@/components/sign-out-button';
import { NavLinks } from '@/components/nav-links';
import { Header } from '@/components/header';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        await ensureUserExists(user);
        await seedCategories(user.id);
    }

    return (
        <div className="min-h-screen bg-[#fcfcfd] relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-50 rounded-full blur-[100px] opacity-40" />
            </div>

            <Header userEmail={user?.email || undefined} />
            <div className="py-12 relative z-10">
                <main>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>

            <footer className="py-12 relative z-10 border-t border-gray-100 mt-20">
                <div className="mx-auto max-w-7xl px-4 text-center space-y-4">
                    <p className="text-sm font-medium text-gray-500 max-w-md mx-auto leading-relaxed">
                        If you have any suggestions on improving this app or find a bug, please let me know or email him at <a href="mailto:sunnykwondev@gmail.com" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors underline decoration-indigo-200 underline-offset-4">sunnykwondev@gmail.com</a>
                    </p>
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">© 2026 Simple Personal Budgeting</p>
                </div>
            </footer>
        </div>
    );
}
