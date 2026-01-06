'use client';




type Transaction = {
    id: string;
    amount: string;
    kind: 'income' | 'expense';
    occurredOn: string;
    note: string | null;
    category: {
        name: string;
        color: string | null;
    } | null;
};

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
            <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                    {transactions.map((t) => (
                        <li key={t.id} className="py-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {t.category?.name || 'Uncategorized'}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {t.occurredOn} {t.note ? `- ${t.note}` : ''}
                                    </p>
                                </div>
                                <div className={`inline-flex items-center text-base font-semibold ${t.kind === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                    {t.kind === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                                </div>
                            </div>
                        </li>
                    ))}
                    {transactions.length === 0 && <li className="py-4 text-sm text-gray-500 italic">No transactions yet.</li>}
                </ul>
            </div>
        </div>
    );
}
