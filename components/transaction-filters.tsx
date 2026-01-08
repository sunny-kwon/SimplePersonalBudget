'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Category {
    id: string;
    name: string;
}

interface TransactionFiltersProps {
    categories: Category[];
}

export function TransactionFilters({ categories }: TransactionFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
    const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
    const [search, setSearch] = useState(searchParams.get('search') || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        if (categoryId) params.set('categoryId', categoryId);
        if (search) params.set('search', search);

        router.push(`/transactions?${params.toString()}`);
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setCategoryId('');
        setSearch('');
        router.push('/transactions');
    };

    const hasFilters = startDate || endDate || categoryId || search;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    >
                        <option value="" className="text-gray-900">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="text-gray-900">{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Note or amount..."
                            className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Apply Filters
                </button>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
