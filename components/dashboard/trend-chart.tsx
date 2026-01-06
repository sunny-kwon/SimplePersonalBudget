'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface TrendChartProps {
    data: {
        date: string;
        income: number;
        expense: number;
    }[];
}

export function TrendChart({ data }: TrendChartProps) {
    const chartData = {
        labels: data.map(d => {
            // Format YYYY-MM-DD to simpler DD or M/D
            const [, month, day] = d.date.split('-');
            return `${parseInt(month)}/${parseInt(day)}`;
        }),
        datasets: [
            {
                label: 'Income',
                data: data.map(d => d.income),
                borderColor: '#22c55e', // green-500
                backgroundColor: '#22c55e',
                tension: 0.3,
            },
            {
                label: 'Expenses',
                data: data.map(d => d.expense),
                borderColor: '#ef4444', // red-500
                backgroundColor: '#ef4444',
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6',
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Trend</h3>
            <div className="h-64">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
}
