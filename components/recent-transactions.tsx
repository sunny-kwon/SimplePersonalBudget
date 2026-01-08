'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Transaction = {
    id: string;
    amount: string;
    kind: 'income' | 'expense';
    occurredOn: string;
    note: string | null;
    category: {
        name: string;
        section: {
            color: string;
        } | null;
    } | null;
};

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-sm rounded-[32px] p-8 border border-gray-100"
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Latest Records</p>
                </div>
                <Link
                    href="/transactions"
                    className="group inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-all"
                >
                    View History <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="flow-root">
                <ul className="space-y-4">
                    {transactions.map((t, i) => (
                        <motion.li
                            key={t.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-gray-50/50 p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm shrink-0"
                                            style={{ backgroundColor: t.category?.section?.color || '#e5e7eb' }}
                                        />
                                        <p className="text-sm font-black text-gray-900 truncate">
                                            {t.category?.name || 'Uncategorized'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 px-6">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {new Date(t.occurredOn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                        {t.note && (
                                            <>
                                                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                <p className="text-xs font-bold text-gray-400 italic truncate italic">{t.note}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className={`text-lg font-black shrink-0 ${t.kind === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                    {t.kind === 'income' ? '+' : '-'}${parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </motion.li>
                    ))}
                    {transactions.length === 0 && (
                        <li className="py-12 flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                <HistoryIcon className="h-8 w-8 text-gray-200" />
                            </div>
                            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No activity found</p>
                        </li>
                    )}
                </ul>
            </div>
        </motion.div>
    );
}

function HistoryIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
