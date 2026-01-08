'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

interface DailyData {
    date: string;
    income: number;
    expense: number;
    [key: string]: any;
}

interface TrendChartProps {
    data: DailyData[];
    sections: { name: string; color: string }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const date = new Date(label + 'T00:00:00');
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return (
            <div className="bg-white p-4 shadow-2xl rounded-2xl border border-gray-100 backdrop-blur-md bg-opacity-90 max-h-[300px] overflow-y-auto">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">{formattedDate}</p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex justify-between items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-sm font-bold text-gray-600">{entry.name}</span>
                            </div>
                            <span className="text-sm font-black text-gray-900">${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function TrendChart({ data, sections }: TrendChartProps) {
    // Simplify labels to just day numbers for cleaner X access
    const chartData = data.map(d => ({
        ...d,
        day: d.date.split('-')[2],
    }));

    // If no sections, we still want to show something or handle it
    const activeSections = sections.filter(s => data.some(d => d[s.name] > 0));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="bg-white shadow-sm rounded-3xl p-8 border border-gray-100"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Financial Pulse</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Sectional Spending Patterns</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 max-w-[300px] justify-end">
                    {activeSections.slice(0, 4).map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.name}</span>
                        </div>
                    ))}
                    {activeSections.length > 4 && (
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">+{activeSections.length - 4} more</span>
                    )}
                </div>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            {activeSections.map((s, i) => (
                                <linearGradient key={i} id={`color-${s.name.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            tickFormatter={(val) => val.split('-')[2]}
                            interval={4}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {activeSections.map((s, i) => (
                            <Area
                                key={i}
                                type="monotone"
                                dataKey={s.name}
                                stroke={s.color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#color-${s.name.replace(/\s+/g, '-')})`}
                                stackId="1"
                                animationDuration={1500 + (i * 200)}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
