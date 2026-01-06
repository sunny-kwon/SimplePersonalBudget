'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Category = {
    id: string;
    name: string;
    type: 'income' | 'expense' | 'both';
};

export function TransactionForm() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Form State
    const [kind, setKind] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // Default to local date YYYY-MM-DD
    const getLocalDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [occurredOn, setOccurredOn] = useState(getLocalDate());
    const [note, setNote] = useState('');

    // Load categories
    useEffect(() => {
        const loadCats = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                    // Set default category if any match kind
                    // (Can be improved to find first match after state set)
                }
            } catch (e) { console.error(e) } finally { setIsLoading(false) }
        };
        loadCats();
    }, []);

    // Filter categories by selected kind
    const validCategories = categories.filter(c => c.type === 'both' || c.type === kind);

    // Auto-select first category when switching kind if current selection is invalid
    useEffect(() => {
        if (validCategories.length > 0) {
            // Check if current categoryId is in valid list
            const isValid = validCategories.find(c => c.id === categoryId);
            if (!isValid) {
                setCategoryId(validCategories[0].id);
            }
        } else {
            setCategoryId('');
        }
    }, [kind, categories, categoryId, validCategories]);
    // Actually simpler: just unset categoryId if invalid when kind changes? 
    // Let's keep it simple: When kind changes, reset categoryId to first valid.

    const handleKindChange = (k: 'income' | 'expense') => {
        setKind(k);
        const firstValid = categories.find(c => c.type === 'both' || c.type === k);
        if (firstValid) setCategoryId(firstValid.id);
        else setCategoryId('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !occurredOn || !categoryId) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    kind,
                    occurredOn,
                    categoryId,
                    note
                }),
            });

            if (res.ok) {
                setMessage('Transaction added!');
                setAmount('');
                setNote('');
                router.refresh(); // Refresh server components (like Recent Transactions list)

                // Clear message after 3s
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage('Error saving.');
            }
        } catch (error) {
            console.error('Error submitting', error);
            setMessage('Failed to submit.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Add</h3>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`flex-1 py-2 text-sm font-medium border-b-2 ${kind === 'expense' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleKindChange('expense')}
                >
                    Expense
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium border-b-2 ${kind === 'income' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleKindChange('income')}
                >
                    Income
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <div className={`p-2 rounded text-sm ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 bg-white"
                        value={occurredOn}
                        onChange={e => setOccurredOn(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            className="block w-full rounded-md border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 bg-white"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 bg-white"
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                    >
                        {validCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        {validCategories.length === 0 && <option value="">No categories</option>}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Note (Optional)</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 bg-white"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !categoryId}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Add Transaction'}
                </button>
            </form>
        </div>
    );
}
