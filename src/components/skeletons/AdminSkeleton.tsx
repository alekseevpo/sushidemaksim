// Full page skeleton for initial load
export const AdminSkeleton = () => (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Admin Sidebar Skeleton */}
        <div className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col p-6 space-y-4">
            <div className="h-8 w-24 skeleton rounded mb-10" />
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-11 w-full skeleton rounded-xl" />
            ))}
        </div>

        <AdminContentSkeleton />
    </div>
);

// Content-only skeleton for Suspense tab switches
export const AdminContentSkeleton = () => (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Admin Topbar Skeleton */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
            <div className="h-6 w-32 skeleton rounded" />
            <div className="flex gap-4 items-center">
                <div className="h-4 w-24 skeleton rounded" />
                <div className="w-10 h-10 skeleton rounded-xl" />
            </div>
        </div>

        {/* Admin Stats/Table Area Skeleton */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-28 skeleton rounded-2xl" />
                ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
                <div className="h-16 border-b border-gray-100 flex items-center px-6">
                    <div className="h-5 w-48 skeleton rounded" />
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="h-12 flex-1 skeleton rounded-xl" />
                            <div className="h-12 w-20 skeleton rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
