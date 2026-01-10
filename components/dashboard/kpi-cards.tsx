'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface KPICardsProps {
    totalIncome: number;
    totalExpense: number;
    net: number;
    budgetLimit: number;
}

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

export function KPICards({ totalIncome, totalExpense, net, budgetLimit }: KPICardsProps) {
    const format = (n: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    const remaining = budgetLimit - totalExpense;
    const isOverBudget = remaining < 0;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
            {/* Income */}
            <motion.div variants={item} className="bg-white overflow-hidden shadow-sm rounded-3xl border border-gray-100 p-6 group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <dt className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Income</dt>
                        <dd className="text-2xl font-black text-gray-900 mt-0.5">{format(totalIncome)}</dd>
                    </div>
                </div>
            </motion.div>

            {/* Expenses */}
            <motion.div variants={item} className="bg-white overflow-hidden shadow-sm rounded-3xl border border-gray-100 p-6 group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingDown className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <dt className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Expenses</dt>
                        <dd className="text-2xl font-black text-gray-900 mt-0.5">{format(totalExpense)}</dd>
                    </div>
                </div>
            </motion.div>

            {/* Remaining Budget */}
            <motion.div variants={item} className="bg-white overflow-hidden shadow-sm rounded-3xl border border-gray-100 p-6 group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${!isOverBudget ? 'bg-indigo-50' : 'bg-orange-50'}`}>
                        <Wallet className={`h-6 w-6 ${!isOverBudget ? 'text-indigo-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                        <dt className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Remaining Budget</dt>
                        <dd className={`text-2xl font-black mt-0.5 ${!isOverBudget ? 'text-gray-900' : 'text-orange-600'}`}>
                            {format(remaining)}
                        </dd>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
