'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Pencil, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { ColorPicker } from './color-picker';

type Category = {
    id: string;
    name: string;
    type: 'income' | 'expense' | 'both';
    sectionId: string | null;
};

type Section = {
    id: string;
    name: string;
    order: string;
    color: string;
    categories: Category[];
};

export function CategoryManager() {
    const [sections, setSections] = useState<Section[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Section State
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [sectionName, setSectionName] = useState('');
    const [sectionColor, setSectionColor] = useState('#6366f1');

    // Category State
    const [isAddingCategory, setIsAddingCategory] = useState<{ sectionId: string | null } | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [catName, setCatName] = useState('');
    const [catType, setCatType] = useState<'income' | 'expense'>('expense');
    const [catSectionId, setCatSectionId] = useState<string>('');

    const fetchData = async () => {
        try {
            const res = await fetch('/api/sections');
            if (res.ok) {
                const data = await res.json();
                setSections(data);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Section Handlers ---
    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sectionName.trim()) return;

        try {
            const res = await fetch('/api/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: sectionName,
                    order: sections.length.toString(),
                    color: sectionColor
                }),
            });
            if (res.ok) {
                setIsAddingSection(false);
                setSectionName('');
                setSectionColor('#6366f1');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to add section', error);
        }
    };

    const handleEditSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSection || !sectionName.trim()) return;

        try {
            const res = await fetch(`/api/sections/${editingSection.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: sectionName,
                    color: sectionColor
                }),
            });
            if (res.ok) {
                setEditingSection(null);
                setSectionName('');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update section', error);
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm('Delete this section? All categories inside will be deleted too!')) return;
        try {
            const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Failed to delete section', error);
        }
    };

    const moveSection = async (id: string, direction: 'up' | 'down') => {
        const index = sections.findIndex(s => s.id === id);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const current = sections[index];
        const target = sections[targetIndex];

        try {
            await Promise.all([
                fetch(`/api/sections/${current.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: targetIndex.toString() }),
                }),
                fetch(`/api/sections/${target.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: index.toString() }),
                })
            ]);
            fetchData();
        } catch (error) {
            console.error('Failed to reorder sections', error);
        }
    };

    // --- Category Handlers ---
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catName.trim() || !isAddingCategory) return;

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: catName,
                    type: catType,
                    sectionId: isAddingCategory.sectionId
                }),
            });
            if (res.ok) {
                setIsAddingCategory(null);
                setCatName('');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to add category', error);
        }
    };

    const handleEditCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !catName.trim()) return;

        try {
            const res = await fetch(`/api/categories/${editingCategory.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: catName,
                    sectionId: catSectionId
                }),
            });
            if (res.ok) {
                setEditingCategory(null);
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update category', error);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Failed to delete category', error);
        }
    };

    if (isLoading) return <div className="text-center py-8">Loading settings...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Budget Structure</h2>
                    <p className="text-sm text-gray-500">Manage sections and categories</p>
                </div>
                <button
                    onClick={() => {
                        setIsAddingSection(true);
                        setSectionName('');
                        setSectionColor('#6366f1');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    New Section
                </button>
            </div>

            {/* Sections List */}
            <div className="space-y-6">
                {sections.map((section, idx) => (
                    <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Section Header */}
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-4 h-4 rounded-full ring-2 ring-white"
                                    style={{ backgroundColor: section.color }}
                                />
                                <h3 className="text-sm font-black uppercase tracking-wider text-gray-500">{section.name}</h3>
                                <div className="hidden group-hover:flex items-center gap-1">
                                    <button
                                        disabled={idx === 0}
                                        onClick={() => moveSection(section.id, 'up')}
                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        disabled={idx === sections.length - 1}
                                        onClick={() => moveSection(section.id, 'down')}
                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setEditingSection(section);
                                        setSectionName(section.name);
                                        setSectionColor(section.color);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteSection(section.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Categories in Section */}
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {section.categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => {
                                            setEditingCategory(cat);
                                            setCatName(cat.name);
                                            setCatType(cat.type === 'both' ? 'expense' : cat.type);
                                            setCatSectionId(cat.sectionId || '');
                                        }}
                                        className="flex items-center justify-between p-3 bg-gray-50 border border-transparent rounded-lg hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full ring-2 ring-white"
                                                style={{ backgroundColor: section.color }}
                                            />
                                            <div className="font-semibold text-gray-700">{cat.name}</div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        setIsAddingCategory({ sectionId: section.id });
                                        setCatName('');
                                        setCatType('expense');
                                    }}
                                    className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm font-medium"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Category
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {sections.length === 0 && !isAddingSection && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <MoreVertical className="h-6 w-6 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No structure yet</h3>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">Create sections and categories to organize your financial life.</p>
                    <button
                        onClick={() => {
                            setIsAddingSection(true);
                            setSectionName('');
                            setSectionColor('#6366f1');
                        }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                    >
                        Create Your First Section
                    </button>
                </div>
            )}

            {/* Modals */}

            {/* Add/Edit Section Modal */}
            {(isAddingSection || editingSection) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-black text-gray-900 mb-2">
                            {isAddingSection ? 'New Section' : 'Edit Section'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">Sections group your categories. Each section now has its own theme color.</p>
                        <form onSubmit={isAddingSection ? handleAddSection : handleEditSection} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Section Name</label>
                                <input
                                    type="text"
                                    value={sectionName}
                                    onChange={(e) => setSectionName(e.target.value)}
                                    className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-900"
                                    placeholder="e.g., Fixed Expenses"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Theme Color</label>
                                <ColorPicker value={sectionColor} onChange={setSectionColor} />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100">
                                    {isAddingSection ? 'Create Section' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingSection(false); setEditingSection(null); }}
                                    className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {isAddingCategory && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-black text-gray-900 mb-6">New Category</h3>
                        <form onSubmit={handleAddCategory} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-900"
                                    placeholder="e.g., Rent"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCatType('expense')}
                                        className={`py-3 rounded-xl font-bold border-2 transition-all ${catType === 'expense' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCatType('income')}
                                        className={`py-3 rounded-xl font-bold border-2 transition-all ${catType === 'income' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        Income
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                    Create Category
                                </button>
                                <button type="button" onClick={() => setIsAddingCategory(null)} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Edit Category</h3>
                            <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleEditCategory} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Section</label>
                                <select
                                    value={catSectionId}
                                    onChange={(e) => setCatSectionId(e.target.value)}
                                    className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none text-gray-900"
                                >
                                    {sections.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                    Save Changes
                                </button>
                                <button type="button" onClick={() => setEditingCategory(null)} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
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
