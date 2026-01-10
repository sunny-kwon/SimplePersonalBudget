'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronLeft, LogOut } from 'lucide-react';
import { NavLinks, links } from './nav-links';
import { SignOutButton } from './sign-out-button';
import { motion, AnimatePresence } from 'framer-motion';

export function Header({ userEmail }: { userEmail?: string }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const isDashboard = pathname === '/';

    return (
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 justify-between items-center">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex flex-shrink-0 items-center group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-lg shadow-indigo-200">
                                <span className="text-white font-black text-xl italic">B</span>
                            </div>
                            <span className="ml-3 text-xl font-black tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">BUDGET.</span>
                        </Link>

                        {userEmail && (
                            <div className="hidden md:flex">
                                <NavLinks />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {userEmail ? (
                            <>
                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Authenticated as</span>
                                    <span className="text-xs font-bold text-gray-500 italic">{userEmail}</span>
                                </div>
                                <div className="hidden md:block">
                                    <SignOutButton />
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="md:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </button>
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

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isMenuOpen && userEmail && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.name}
                                    </Link>
                                );
                            })}

                            <div className="pt-4 border-t border-gray-100">
                                <SignOutButton />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile "Return to Dashboard" Nav */}
            {!isDashboard && userEmail && (
                <div className="md:hidden bg-gray-50/50 border-t border-gray-100">
                    <div className="mx-auto max-w-7xl px-4 py-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                        >
                            <ChevronLeft className="h-3 w-3" />
                            Dashboard
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
