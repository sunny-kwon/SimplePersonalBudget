'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil } from 'lucide-react';
import { ColorPicker } from './color-picker';

type Category = {
    id: string;
    name: string;
    type: 'income' | 'expense' | 'both';
    color: string | null;
};

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCatName, setNewCatName] = useState('');
    const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
    const [newCatColor, setNewCatColor] = useState<string>('#6366f1');

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to load categories', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddStart = () => {
        setIsAdding(true);
        setNewCatName('');
        setNewCatColor('#6366f1');
    };

    const handleEditStart = (cat: Category) => {
        setEditingCategory(cat);
        setNewCatName(cat.name);
        setNewCatType(cat.type === 'both' ? 'expense' : cat.type);
        setNewCatColor(cat.color || '#6366f1');
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCatName,
                    type: newCatType,
                    color: newCatColor
                }),
            });

            if (res.ok) {
                setIsAdding(false);
                fetchCategories();
            }
        } catch (error) {
            console.error('Failed to add category', error);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !newCatName.trim()) return;

        try {
            const res = await fetch(`/api/categories/${editingCategory.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCatName,
                    color: newCatColor
                }),
            });

            if (res.ok) {
                setEditingCategory(null);
                fetchCategories();
            }
        } catch (error) {
            console.error('Failed to update category', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category? Transactions will become uncategorized.')) return;

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCategories();
        } catch (error) {
            console.error('Failed to delete category', error);
        }
    };

    if (isLoading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                {!isAdding && (
                    <button
                        onClick={handleAddStart}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAddSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                placeholder="e.g., Groceries"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={newCatType}
                                onChange={(e) => setNewCatType(e.target.value as 'income' | 'expense')}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <ColorPicker value={newCatColor} onChange={setNewCatColor} />
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        onClick={() => handleEditStart(cat)}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded-full ring-2 ring-gray-200"
                                style={{ backgroundColor: cat.color || '#9ca3af' }}
                            />
                            <div>
                                <div className="font-medium text-gray-900">{cat.name}</div>
                                <div className="text-xs text-gray-500 capitalize">{cat.type}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Pencil className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(cat.id);
                                }}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete category"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && !isAdding && (
                <div className="text-center py-12 text-gray-500">
                    No categories yet. Click "Add Category" to create one.
                </div>
            )}

            {/* Edit Modal */}
            {editingCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Category</h3>
                            <button
                                onClick={() => setEditingCategory(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md capitalize">
                                    {editingCategory.type}
                                    <span className="text-xs ml-2">(cannot be changed)</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <ColorPicker value={newCatColor} onChange={setNewCatColor} />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingCategory(null)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
