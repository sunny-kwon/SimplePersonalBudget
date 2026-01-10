'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateTime } from 'luxon';

interface PeriodNavigatorProps {
    startDate: string;
    endDate: string;
}

export function PeriodNavigator({ startDate, endDate }: PeriodNavigatorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse dates to show nice labels
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);

    const navigate = (direction: 'prev' | 'next' | 'current') => {
        const params = new URLSearchParams(searchParams.toString());

        let targetDate: DateTime;
        if (direction === 'current') {
            targetDate = DateTime.now();
        } else {
            // Move target date outside the current window to trigger new boundary calculation
            const diff = end.diff(start, 'days').days + 1;
            targetDate = direction === 'prev'
                ? start.minus({ days: 1 })
                : end.plus({ days: 1 });
        }

        params.set('date', targetDate.toISODate()!);
        router.push(`/?${params.toString()}`);
    };

    const isCurrent = DateTime.now() >= start && DateTime.now() <= end;

    return (
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <button
                onClick={() => navigate('prev')}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-500 hover:text-indigo-600"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center px-4 min-w-[200px]">
                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest mb-0.5">
                    <Calendar className="h-3 w-3" />
                    {isCurrent ? 'Current Period' : 'Planned Period'}
                </div>
                <div className="text-sm font-bold text-gray-900 tracking-tight">
                    {start.toFormat('MMM d')} – {end.toFormat('MMM d, yyyy')}
                </div>
            </div>

            <button
                onClick={() => navigate('next')}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-500 hover:text-indigo-600"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            {!isCurrent && (
                <button
                    onClick={() => navigate('current')}
                    className="ml-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                    Today
                </button>
            )}
        </div>
    );
}
