'use client';

import Link from 'next/link';
import { ArrowRight, Wallet, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingHero() {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="flex flex-col items-center justify-center py-12 font-sans"
            >
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 border border-indigo-100/50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-10 shadow-sm"
                    >
                        <Sparkles className="h-3 w-3" />
                        Smart Budgeting Reimagined
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 mb-8 leading-[0.9] drop-shadow-sm px-4">
                        Take absolute control of your <span className="text-indigo-600 relative inline-block">wealth.<div className="absolute -bottom-2 left-0 w-full h-3 bg-indigo-100/40 -z-10 rounded-full" /></span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 mb-14 leading-relaxed font-semibold max-w-2xl mx-auto px-4">
                        A beautifully simple, privacy-first financial dashboard built for high-performance tracking. No bank logins. No complexity.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white text-xl font-black rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 group"
                        >
                            Get Started Free <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-12 py-5 bg-white text-gray-900 text-xl font-black rounded-3xl border-2 border-gray-100 hover:border-indigo-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 px-4 max-w-7xl mx-auto">
                    {[
                        { icon: Wallet, color: 'indigo', title: 'Privacy First', desc: 'Your data stays yours. Manual tracking means no sensitive bank links.' },
                        { icon: Target, color: 'green', title: 'Goal Driven', desc: 'Custom sections and categories tailored to your unique lifestyle.' },
                        { icon: Sparkles, color: 'purple', title: 'Elite Insights', desc: 'Visualize your spending trends with high-fidelity charts and KPIs.' }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i + 0.5 }}
                            className="p-10 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <feature.icon className={`h-8 w-8 text-gray-600`} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-500 font-bold leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
