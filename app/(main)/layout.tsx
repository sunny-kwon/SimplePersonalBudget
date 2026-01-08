import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { ensureUserExists, seedCategories } from '@/lib/actions/seed';
import { SignOutButton } from '@/components/sign-out-button';
import { NavLinks } from '@/components/nav-links';
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

            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between items-center">
                        <div className="flex items-center gap-12">
                            <Link href="/" className="flex flex-shrink-0 items-center group">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-lg shadow-indigo-200">
                                    <span className="text-white font-black text-xl italic">B</span>
                                </div>
                                <span className="ml-3 text-xl font-black tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">BUDGET.</span>
                            </Link>
                            {user && (
                                <div className="hidden md:flex">
                                    <NavLinks />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-6">
                            {user ? (
                                <>
                                    <div className="hidden lg:flex flex-col items-end">
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Authenticated as</span>
                                        <span className="text-xs font-bold text-gray-500 italic">{user.email}</span>
                                    </div>
                                    <SignOutButton />
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95"
                                >
                                    Log In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
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
