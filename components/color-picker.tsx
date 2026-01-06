'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
    value: string | null;
    onChange: (color: string) => void;
}

const PRESET_COLORS = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#84cc16', // lime
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
                <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: value || '#9ca3af' }}
                />
                <Palette className="h-4 w-4 text-gray-500" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="grid grid-cols-5 gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => {
                                        onChange(color);
                                        setIsOpen(false);
                                    }}
                                    className="w-8 h-8 rounded border-2 border-gray-200 hover:border-indigo-500 transition-colors"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
