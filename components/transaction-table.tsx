'use client';

import { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Transaction {
    id: string;
    amount: string;
    kind: 'income' | 'expense';
    occurredOn: string;
    note: string | null;
    categoryId: string | null;
    category: {
        id: string;
        name: string;
        color: string | null;
    } | null;
}

interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense' | 'both';
}

interface TransactionTableProps {
    transactions: Transaction[];
    categories: Category[];
}

export function TransactionTable({ transactions, categories }: TransactionTableProps) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        amount: '',
        categoryId: '',
        occurredOn: '',
        note: '',
    });
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleEdit = (tx: Transaction) => {
        setEditingId(tx.id);
        setEditForm({
            amount: tx.amount,
            categoryId: tx.categoryId || '',
            occurredOn: tx.occurredOn,
            note: tx.note || '',
        });
    };

    const handleSave = async (id: string) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            if (!res.ok) throw new Error('Failed to update');

            setEditingId(null);
            router.refresh();
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert('Failed to update transaction');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            router.refresh();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction');
        } finally {
            setIsDeleting(null);
        }
    };

    const formatCurrency = (amount: string) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount));

    if (transactions.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500 text-base">No transactions found</p>
                <p className="text-gray-400 text-sm mt-1">Add your first transaction from the dashboard</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Note
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {transactions.map((tx) => {
                            const isEditing = editingId === tx.id;
                            const validCategories = categories.filter(
                                c => c.type === tx.kind || c.type === 'both'
                            );

                            return (
                                <tr
                                    key={tx.id}
                                    className={`hover:bg-gray-50 transition-colors ${isDeleting === tx.id ? 'opacity-50' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={editForm.occurredOn}
                                                onChange={(e) => setEditForm({ ...editForm, occurredOn: e.target.value })}
                                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        ) : (
                                            new Date(tx.occurredOn + 'T00:00:00').toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {isEditing ? (
                                            <select
                                                value={editForm.categoryId}
                                                onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                            >
                                                <option value="">None</option>
                                                {validCategories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="inline-flex items-center">
                                                {tx.category?.color && (
                                                    <span
                                                        className="w-3 h-3 rounded-full mr-2 ring-1 ring-gray-200"
                                                        style={{ backgroundColor: tx.category.color }}
                                                    />
                                                )}
                                                <span className="font-medium text-gray-900">
                                                    {tx.category?.name || 'Uncategorized'}
                                                </span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.note}
                                                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Add a note..."
                                            />
                                        ) : (
                                            <span className="block truncate" title={tx.note || undefined}>
                                                {tx.note || <span className="text-gray-400">—</span>}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.amount}
                                                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-28 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        ) : (
                                            <span className={tx.kind === 'income' ? 'text-green-600' : 'text-red-600'}>
                                                {tx.kind === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleSave(tx.id)}
                                                    className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                                                    title="Save"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(tx)}
                                                    className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                    disabled={isDeleting === tx.id}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
