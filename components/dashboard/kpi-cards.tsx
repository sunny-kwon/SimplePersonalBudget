import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface KPICardsProps {
    totalIncome: number;
    totalExpense: number;
    net: number;
}

export function KPICards({ totalIncome, totalExpense, net }: KPICardsProps) {
    const format = (n: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Income */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                                <dd className="text-lg font-medium text-gray-900">{format(totalIncome)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expenses */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TrendingDown className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                                <dd className="text-lg font-medium text-gray-900">{format(totalExpense)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Wallet className={`h-6 w-6 ${net >= 0 ? 'text-indigo-600' : 'text-red-600'}`} />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Net Balance</dt>
                                <dd className={`text-lg font-medium ${net >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                    {format(net)}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
