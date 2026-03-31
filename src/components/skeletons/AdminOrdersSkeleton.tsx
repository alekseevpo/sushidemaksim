export const AdminOrderCardSkeleton = () => (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group border-b-4 border-b-gray-100 animate-pulse">
        {/* Header Skeleton */}
        <div className="p-5 sm:p-6 border-b border-gray-50 bg-gray-50/20 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-2xl w-12 h-12" />
                <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-20 bg-gray-50 rounded-md" />
                </div>
            </div>
            <div className="h-8 w-24 bg-gray-100 rounded-2xl" />
        </div>

        {/* Body Skeleton */}
        <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Info Column */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 h-4 w-32 bg-gray-50 rounded" />
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 w-full bg-gray-100 rounded" />
                        <div className="h-3 w-2/3 bg-gray-50 rounded" />
                    </div>
                </div>
                <div className="h-10 w-full bg-gray-50 rounded-2xl" />
            </div>

            {/* Middle Column (Address) */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 h-4 w-32 bg-gray-50 rounded" />
                <div className="h-20 w-full bg-gray-50 rounded-2xl border border-dashed border-gray-100" />
            </div>

            {/* Right Column (Items/Actions) */}
            <div className="space-y-4">
                <div className="h-4 w-32 bg-gray-50 rounded" />
                <div className="space-y-2">
                    <div className="h-12 w-full bg-gray-50 rounded-xl" />
                    <div className="h-12 w-full bg-gray-50 rounded-xl" />
                </div>
            </div>
        </div>
    </div>
);

export const AdminOrdersSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="grid gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <AdminOrderCardSkeleton key={i} />
        ))}
    </div>
);
