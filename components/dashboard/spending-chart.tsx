'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface SpendingBySection {
    sectionId: string;
    sectionName: string;
    color: string;
    amount: number;
    percentage: number;
    [key: string]: string | number;
}

interface SpendingChartProps {
    data: SpendingBySection[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 shadow-xl rounded-xl border border-gray-100 backdrop-blur-md bg-opacity-90">
                <p className="text-sm font-bold text-gray-900">{payload[0].name}</p>
                <p className="text-sm font-medium text-indigo-600">
                    ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs font-medium text-gray-400">
                    {payload[0].payload.percentage.toFixed(1)}% of total
                </p>
            </div>
        );
    }
    return null;
};

export function SpendingChart({ data }: SpendingChartProps) {
    if (data.length === 0 || data.every(d => d.amount === 0)) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-sm rounded-3xl p-8 flex flex-col items-center justify-center h-[400px] text-gray-400 border border-gray-100"
            >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="font-bold text-gray-300 uppercase tracking-widest text-xs">No expense data yet</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white shadow-sm rounded-3xl p-8 border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Expenses by Section</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Monthly Distribution</p>
                </div>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="amount"
                            nameKey="sectionName"
                            animationBegin={200}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="transparent"
                                    className="outline-none focus:outline-none"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => {
                                const item = data.find(d => d.sectionName === value);
                                const percentage = item ? item.percentage.toFixed(0) : 0;
                                return (
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                        {value} <span className="text-indigo-400 ml-1">{percentage}%</span>
                                    </span>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                {data.slice(0, 2).map(item => (
                    <div key={item.sectionId} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.sectionName}</p>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">{item.percentage.toFixed(0)}%</span>
                        </div>
                        <p className="text-lg font-black text-gray-900">${item.amount.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
