'use client';

import { Target, AlertCircle } from 'lucide-react';

interface BudgetProgressProps {
    budget: {
        totalTarget: number;
        planned: number;
        realized: number;
        sections: {
            sectionId: string;
            planned: number;
            actual: number;
        }[];
    };
    sections: {
        id: string;
        name: string;
        color: string;
    }[];
}

export function BudgetProgress({ budget, sections }: BudgetProgressProps) {
    const actualSpend = budget.sections.reduce((sum, s) => sum + s.actual, 0);
    const spendProgress = budget.planned > 0 ? (actualSpend / budget.planned) * 100 : 0;
    const incomeProgress = budget.totalTarget > 0 ? (budget.realized / budget.totalTarget) * 100 : 0;

    return (
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                        <Target className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 leading-tight">Budget Progress</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plan vs Reality</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-gray-900">${actualSpend.toFixed(0)}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase">spent of ${budget.planned.toFixed(0)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                {/* Income vs Budget Target */}
                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span className="text-gray-400">Income Coverage</span>
                        <span className={incomeProgress >= 100 ? "text-green-600" : "text-orange-500"}>
                            {incomeProgress.toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${incomeProgress >= 100 ? 'bg-green-500' : 'bg-orange-400'}`}
                            style={{ width: `${Math.min(100, incomeProgress)}%` }}
                        />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 italic">
                        ${budget.realized.toFixed(0)} earned of ${budget.totalTarget.toFixed(0)} planned
                    </p>
                </div>

                {/* Spend vs Planned */}
                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span className="text-gray-400">Budget Spent</span>
                        <span className={spendProgress > 100 ? "text-red-500" : "text-indigo-600"}>
                            {spendProgress.toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${spendProgress > 100 ? 'bg-red-500' : 'bg-indigo-600'}`}
                            style={{ width: `${Math.min(100, spendProgress)}%` }}
                        />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 italic">
                        ${actualSpend.toFixed(0)} spent of ${budget.planned.toFixed(0)} allocated
                    </p>
                </div>
            </div>

            {/* Section Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-4">
                {budget.sections.map((bs) => {
                    const section = sections.find(s => s.id === bs.sectionId);
                    if (!section) return null;

                    const progress = bs.planned > 0 ? (bs.actual / bs.planned) * 100 : 0;
                    const isOver = progress > 100;

                    return (
                        <div key={bs.sectionId} className="group flex flex-col gap-3">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
                                        style={{ backgroundColor: section.color }}
                                    />
                                    <span className="text-sm font-bold text-gray-800 transition-colors group-hover:text-indigo-600">
                                        {section.name}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-black ${isOver ? 'text-red-500' : 'text-gray-900'}`}>
                                        ${bs.actual.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                                        / ${bs.planned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-2.5 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${Math.min(100, progress)}%`,
                                        backgroundColor: isOver ? '#ef4444' : section.color
                                    }}
                                />
                                {isOver && (
                                    <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
                                )}
                            </div>
                            {isOver ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-tight">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <span>{((bs.actual / bs.planned - 1) * 100).toFixed(0)}% Over Budget</span>
                                </div>
                            ) : (
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                    {progress.toFixed(0)}% Utilized
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {budget.sections.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm font-bold text-gray-400">No budget planned yet.</p>
                </div>
            )}
        </div>
    );
}
