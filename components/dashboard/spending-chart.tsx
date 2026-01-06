'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingChartProps {
    data: {
        categoryName: string;
        amount: number;
        color: string | null;
    }[];
}

export function SpendingChart({ data }: SpendingChartProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-64 text-gray-400 italic">
                No expenses this month
            </div>
        );
    }

    const chartData = {
        labels: data.map(d => d.categoryName),
        datasets: [
            {
                data: data.map(d => d.amount),
                backgroundColor: data.map(d => d.color || '#e5e7eb'), // Fallback gray
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    boxWidth: 10,
                    usePointStyle: true,
                }
            },
        },
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Expenses by Category</h3>
            <div className="h-64">
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
}
