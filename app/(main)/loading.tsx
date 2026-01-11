export function DashboardSkeleton() {
    return (
        <div className="space-y-12 pb-20 font-sans animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-3">
                    <div className="h-4 w-32 bg-gray-100 rounded-full" />
                    <div className="h-10 sm:h-12 w-64 bg-gray-200 rounded-2xl" />
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <div className="h-14 w-40 bg-gray-100 rounded-2xl flex-1 lg:flex-none" />
                    <div className="h-14 w-40 bg-gray-100 rounded-2xl hidden sm:block" />
                </div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-white rounded-[32px] border border-gray-100 p-6" />
                ))}
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
                <div className="space-y-12">
                    {/* Transaction Form Skeleton */}
                    <div className="h-[500px] bg-white rounded-[40px] border border-gray-100" />
                    {/* Recent Transactions Skeleton */}
                    <div className="h-96 bg-white rounded-[32px] border border-gray-100" />
                </div>

                <div className="space-y-12">
                    {/* Budget Progress Skeleton */}
                    <div className="h-80 bg-white rounded-[32px] border border-gray-100" />
                    {/* Charts Skeleton */}
                    <div className="h-[500px] bg-white rounded-[32px] border border-gray-100" />
                    <div className="h-[440px] bg-white rounded-[32px] border border-gray-100" />
                </div>
            </div>
        </div>
    );
}

export default function Loading() {
    return <DashboardSkeleton />;
}
