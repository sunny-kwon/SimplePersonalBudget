'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Form State
    const [kind, setKind] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const getLocalDate = () => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    };

    const [occurredOn, setOccurredOn] = useState(getLocalDate());
    const [note, setNote] = useState('');

    useEffect(() => {
        const loadCats = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (e) { console.error(e) } finally { setIsLoading(false) }
        };
        loadCats();
    }, []);

    const validCategories = categories.filter(c => c.type === 'both' || c.type === kind);

    useEffect(() => {
        if (validCategories.length > 0) {
            const isValid = validCategories.find(c => c.id === categoryId);
            if (!isValid) setCategoryId(validCategories[0].id);
        } else {
            setCategoryId('');
        }
    }, [kind, categories]);

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
                setMessage({ text: 'Transaction logged successfully', type: 'success' });
                setAmount('');
                setNote('');
                router.refresh();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ text: 'Failed to save transaction', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Connection internal error', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-xl shadow-indigo-50/50 rounded-[40px] p-10 border border-gray-100 overflow-hidden relative"
        >
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Quick Add</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manual Entry</p>
                </div>
                <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-2">
                    <button
                        onClick={() => setKind('expense')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${kind === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <ArrowDownCircle className="h-4 w-4" /> Expense
                    </button>
                    <button
                        onClick={() => setKind('income')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${kind === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <ArrowUpCircle className="h-4 w-4" /> Income
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                    >
                        {message.text}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Event Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-gray-50 border-transparent rounded-[20px] px-6 py-4 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
                            value={occurredOn}
                            onChange={e => setOccurredOn(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Category</label>
                        <select
                            required
                            className="w-full bg-gray-50 border-transparent rounded-[20px] px-6 py-4 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none appearance-none"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                        >
                            {validCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="relative">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Total Amount</label>
                    <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 group-focus-within:text-indigo-600 transition-colors">$</span>
                        <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            className="w-full bg-gray-50 border-transparent rounded-[24px] pl-12 pr-6 py-5 text-2xl font-black text-gray-900 placeholder:text-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Reference Note (Optional)</label>
                    <input
                        type="text"
                        placeholder="What was this for?"
                        className="w-full bg-gray-50 border-transparent rounded-[20px] px-6 py-4 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none italic"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !categoryId}
                    className="w-full bg-indigo-600 text-white rounded-[24px] py-5 font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 relative overflow-hidden group active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center">
                            <Loader2 className="animate-spin h-5 w-5" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                            Submit Transaction
                        </div>
                    )}
                </button>
            </form>
        </motion.div>
    );
}
