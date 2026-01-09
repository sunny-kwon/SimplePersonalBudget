'use client';

import { useState, useEffect } from 'react';
import { Wallet2, Percent, DollarSign, ChevronDown, ChevronRight, Save, Info, Trash2, CheckCircle2 } from 'lucide-react';
import { getBudgetData, updateBudgetConfig, saveAllocation, deleteAllocation } from '@/lib/actions/budget';

type Section = {
    id: string;
    name: string;
    color: string;
    categories: {
        id: string;
        name: string;
    }[];
};

type Allocation = {
    sectionId: string;
    categoryId: string | null;
    amount: string;
    percentage: string;
    allocationType: 'amount' | 'percentage';
};

type BudgetConfig = {
    period: 'weekly' | 'bi-weekly' | 'monthly';
    totalTarget: string;
};

export default function BudgetPage() {
    const [config, setConfig] = useState<BudgetConfig>({ period: 'monthly', totalTarget: '0' });
    const [sections, setSections] = useState<Section[]>([]);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [savingStatus, setSavingStatus] = useState<Record<string, 'saving' | 'saved' | null>>({});

    const fetchData = async () => {
        try {
            const data = await getBudgetData();
            setConfig({
                period: data.config.period as BudgetConfig['period'],
                totalTarget: data.config.totalTarget
            });
            setSections(data.sections as Section[]);
            setAllocations(data.allocations.map(a => ({
                sectionId: a.sectionId,
                categoryId: a.categoryId,
                amount: a.amount,
                percentage: a.percentage,
                allocationType: a.allocationType as Allocation['allocationType']
            })));
        } catch (error) {
            console.error('Failed to load budget data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            await updateBudgetConfig(config);
        } catch (error) {
            console.error('Failed to save config', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAllocation = async (alloc: Allocation) => {
        const key = `${alloc.sectionId}-${alloc.categoryId || 'root'}`;
        setSavingStatus(prev => ({ ...prev, [key]: 'saving' }));
        try {
            await saveAllocation(alloc);
            setSavingStatus(prev => ({ ...prev, [key]: 'saved' }));
            setTimeout(() => {
                setSavingStatus(prev => ({ ...prev, [key]: null }));
            }, 2000);
        } catch (error) {
            console.error('Failed to save allocation', error);
            setSavingStatus(prev => ({ ...prev, [key]: null }));
        }
    };

    const handleDeleteAllocation = async (sectionId: string, categoryId: string | null) => {
        if (!confirm('Are you sure you want to remove this budget allocation?')) return;

        try {
            await deleteAllocation(sectionId, categoryId);
            setAllocations(prev => prev.filter(a => !(a.sectionId === sectionId && a.categoryId === categoryId)));
        } catch (error) {
            console.error('Failed to delete allocation', error);
        }
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getAllocation = (sectionId: string, categoryId: string | null) => {
        return allocations.find(a => a.sectionId === sectionId && a.categoryId === categoryId) || {
            sectionId,
            categoryId,
            amount: '0',
            percentage: '0',
            allocationType: 'amount' as const
        };
    };

    const updateAllocationState = (sectionId: string, categoryId: string | null, updates: Partial<Allocation>) => {
        setAllocations(prev => {
            const index = prev.findIndex(a => a.sectionId === sectionId && a.categoryId === categoryId);
            if (index > -1) {
                const newAlloc = { ...prev[index], ...updates };
                return [...prev.slice(0, index), newAlloc, ...prev.slice(index + 1)];
            } else {
                return [...prev, {
                    sectionId,
                    categoryId,
                    amount: updates.amount || '0',
                    percentage: updates.percentage || '0',
                    allocationType: updates.allocationType || 'amount',
                    ...updates
                }];
            }
        });
    };

    const calculateDisplayValue = (alloc: Allocation) => {
        const total = parseFloat(config.totalTarget) || 0;
        if (alloc.allocationType === 'percentage') {
            const percent = parseFloat(alloc.percentage) || 0;
            return (total * (percent / 100)).toFixed(2);
        }
        return alloc.amount;
    };

    const getUnallocatedInCategory = (sectionId: string) => {
        const sectionAlloc = getAllocation(sectionId, null);
        const sectionTotal = parseFloat(sectionAlloc.allocationType === 'percentage'
            ? ((parseFloat(config.totalTarget) || 0) * (parseFloat(sectionAlloc.percentage) || 0) / 100).toString()
            : sectionAlloc.amount) || 0;

        const categorySum = allocations
            .filter(a => a.sectionId === sectionId && a.categoryId !== null)
            .reduce((sum, a) => {
                const val = parseFloat(a.allocationType === 'percentage'
                    ? ((parseFloat(config.totalTarget) || 0) * (parseFloat(a.percentage) || 0) / 100).toString()
                    : a.amount) || 0;
                return sum + val;
            }, 0);

        return sectionTotal - categorySum;
    };

    if (isLoading) return <div className="text-center py-8">Loading budget...</div>;

    const totalPlanned = allocations
        .filter(a => a.categoryId === null) // Only section totals
        .reduce((sum, a) => {
            const val = parseFloat(a.allocationType === 'percentage'
                ? ((parseFloat(config.totalTarget) || 0) * (parseFloat(a.percentage) || 0) / 100).toString()
                : a.amount) || 0;
            return sum + val;
        }, 0);

    const remainingToPlan = (parseFloat(config.totalTarget) || 0) - totalPlanned;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header / Config */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3 text-indigo-600">
                            <Wallet2 className="h-6 w-6" />
                            <h1 className="text-2xl font-black">Plan Your Money</h1>
                        </div>
                        <p className="text-gray-500">Set your target budget and distribute it across sections.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Budget Period</label>
                                <select
                                    className="w-full bg-gray-50 border-gray-100 text-gray-900 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-indigo-500"
                                    value={config.period}
                                    onChange={(e) => setConfig({ ...config, period: e.target.value as any })}
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="bi-weekly">Bi-weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Target (${config.period})</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-gray-100 text-gray-900 rounded-xl pl-8 pr-4 py-3 font-semibold focus:ring-2 focus:ring-indigo-500"
                                        value={config.totalTarget}
                                        onChange={(e) => setConfig({ ...config, totalTarget: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveConfig}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 h-fit"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Plan'}
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-50 pt-8">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Target</div>
                        <div className="text-xl font-black text-gray-900">${config.totalTarget}</div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-tighter mb-1">Planned</div>
                        <div className="text-xl font-black text-indigo-600">${totalPlanned.toFixed(2)}</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${remainingToPlan >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        <div className={`text-xs font-bold uppercase tracking-tighter mb-1 ${remainingToPlan >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {remainingToPlan >= 0 ? 'Remaining' : 'Over-planned'}
                        </div>
                        <div className={`text-xl font-black ${remainingToPlan >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ${Math.abs(remainingToPlan).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {sections.map(section => {
                    const alloc = getAllocation(section.id, null);
                    const unallocated = getUnallocatedInCategory(section.id);
                    const isExpanded = expandedSections[section.id];

                    return (
                        <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Section Header */}
                            <div className="p-6 flex items-center gap-4">
                                <button onClick={() => toggleSection(section.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                    {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                                </button>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }} />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{section.name}</h3>
                                    {unallocated > 0 && <p className="text-xs text-amber-600 font-semibold">${unallocated.toFixed(2)} unallocated</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => updateAllocationState(section.id, null, { allocationType: 'percentage' })}
                                            className={`p-1.5 rounded-md transition-all ${alloc.allocationType === 'percentage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                        >
                                            <Percent className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => updateAllocationState(section.id, null, { allocationType: 'amount' })}
                                            className={`p-1.5 rounded-md transition-all ${alloc.allocationType === 'amount' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                        >
                                            <DollarSign className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="relative w-32 group">
                                        {alloc.allocationType === 'percentage' ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={alloc.percentage}
                                                    onBlur={() => handleSaveAllocation(alloc)}
                                                    onChange={(e) => updateAllocationState(section.id, null, { percentage: e.target.value })}
                                                    className="w-full bg-gray-50 border-gray-100 text-gray-900 rounded-xl px-3 py-2 text-right font-black focus:ring-2 focus:ring-indigo-500 pr-8"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                                                <input
                                                    type="number"
                                                    value={alloc.amount}
                                                    onBlur={() => handleSaveAllocation(alloc)}
                                                    onChange={(e) => updateAllocationState(section.id, null, { amount: e.target.value })}
                                                    className="w-full bg-gray-50 border-gray-100 text-gray-900 rounded-xl pl-6 pr-3 py-2 text-right font-black focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </>
                                        )}
                                        {/* Save Status */}
                                        <div className="absolute -top-1 -right-1">
                                            {savingStatus[`${section.id}-null`] === 'saving' && (
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                            )}
                                            {savingStatus[`${section.id}-null`] === 'saved' && (
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500 bg-white rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-24 text-right text-sm font-bold ${parseFloat(calculateDisplayValue(alloc)) > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                            ≈ ${calculateDisplayValue(alloc)}
                                        </div>
                                        {parseFloat(calculateDisplayValue(alloc)) > 0 && (
                                            <button
                                                onClick={() => handleDeleteAllocation(section.id, null)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                                title="Remove allocation"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section Progress bar */}
                            <div className="px-6 pb-4">
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500"
                                        style={{
                                            backgroundColor: section.color,
                                            width: `${Math.min(100, (parseFloat(calculateDisplayValue(alloc)) / (parseFloat(config.totalTarget) || 1)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            {isExpanded && (
                                <div className="bg-gray-50 border-t border-gray-100 p-6 space-y-4">
                                    {section.categories.length === 0 ? (
                                        <div className="text-center py-4 text-sm text-gray-400 italic">No categories in this section.</div>
                                    ) : (
                                        section.categories.map(cat => {
                                            const catAlloc = getAllocation(section.id, cat.id);
                                            return (
                                                <div key={cat.id} className="flex items-center gap-4 pl-8">
                                                    <div className="flex-1 text-sm font-semibold text-gray-600">{cat.name}</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex bg-gray-200/50 p-1 rounded-lg">
                                                            <button
                                                                onClick={() => updateAllocationState(section.id, cat.id, { allocationType: 'percentage' })}
                                                                className={`p-1 rounded-md transition-all ${catAlloc.allocationType === 'percentage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                                            >
                                                                <Percent className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => updateAllocationState(section.id, cat.id, { allocationType: 'amount' })}
                                                                className={`p-1 rounded-md transition-all ${catAlloc.allocationType === 'amount' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                                            >
                                                                <DollarSign className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <div className="relative w-28 group">
                                                            {catAlloc.allocationType === 'percentage' ? (
                                                                <>
                                                                    <input
                                                                        type="number"
                                                                        value={catAlloc.percentage}
                                                                        onBlur={() => handleSaveAllocation(catAlloc)}
                                                                        onChange={(e) => updateAllocationState(section.id, cat.id, { percentage: e.target.value })}
                                                                        className="w-full bg-white border-gray-100 text-gray-900 rounded-lg px-2 py-1.5 text-right text-sm font-bold focus:ring-2 focus:ring-indigo-500 pr-6"
                                                                    />
                                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">%</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={catAlloc.amount}
                                                                        onBlur={() => handleSaveAllocation(catAlloc)}
                                                                        onChange={(e) => updateAllocationState(section.id, cat.id, { amount: e.target.value })}
                                                                        className="w-full bg-white border-gray-100 text-gray-900 rounded-lg pl-5 pr-2 py-1.5 text-right text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                                                    />
                                                                </>
                                                            )}
                                                            {/* Save Status */}
                                                            <div className="absolute -top-1 -right-1">
                                                                {savingStatus[`${section.id}-${cat.id}`] === 'saving' && (
                                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                                                )}
                                                                {savingStatus[`${section.id}-${cat.id}`] === 'saved' && (
                                                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 bg-white rounded-full" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-20 text-right text-xs font-bold ${parseFloat(calculateDisplayValue(catAlloc)) > 0 ? (unallocated < 0 ? 'text-red-500' : 'text-gray-700') : 'text-gray-400'}`}>
                                                                ≈ ${calculateDisplayValue(catAlloc)}
                                                            </div>
                                                            {parseFloat(calculateDisplayValue(catAlloc)) > 0 && (
                                                                <button
                                                                    onClick={() => handleDeleteAllocation(section.id, cat.id)}
                                                                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                                                    title="Remove allocation"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div className="flex items-center gap-3 pl-8 py-2 text-indigo-600 bg-indigo-50/30 rounded-xl border border-dashed border-indigo-100">
                                        <Info className="h-4 w-4" />
                                        <div className="text-xs font-bold">
                                            {unallocated > 0 ? (
                                                `$${unallocated.toFixed(2)} is unallocated. It stays as a "General" buffer for the ${section.name} section.`
                                            ) : unallocated < 0 ? (
                                                `WARNING: You have over-allocated categories by $${Math.abs(unallocated).toFixed(2)}!`
                                            ) : (
                                                "Section fully allocated to categories."
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
