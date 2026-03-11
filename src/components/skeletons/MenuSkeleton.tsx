export const MenuSkeleton = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row mt-20">
        {/* Sidebar Skeleton (Desktop) */}
        <div className="hidden lg:block w-72 h-[calc(100vh-80px)] sticky top-20 bg-white border-r border-gray-100 p-6 space-y-4">
            <div className="h-6 w-24 skeleton rounded mb-8" />
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-10 w-full skeleton rounded-xl" />
            ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-3">
                        <div className="h-8 w-48 skeleton rounded-xl" />
                        <div className="h-4 w-64 skeleton rounded-lg opacity-50" />
                    </div>
                    <div className="h-14 w-full md:w-80 skeleton rounded-3xl" />
                </div>

                {/* Mobile Categories Scroll */}
                <div className="lg:hidden flex gap-2 mb-8 overflow-hidden pb-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 w-28 skeleton rounded-2xl shrink-0" />
                    ))}
                </div>

                {/* Product Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                            key={i}
                            className="bg-white rounded-[32px] overflow-hidden border border-gray-100 flex flex-col h-[400px]"
                        >
                            <div className="h-48 skeleton w-full" />
                            <div className="p-6 flex-1 space-y-4">
                                <div className="h-6 w-3/4 skeleton rounded-lg" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full skeleton rounded" />
                                    <div className="h-3 w-5/6 skeleton rounded" />
                                </div>
                                <div className="pt-4 flex items-center justify-between">
                                    <div className="h-6 w-16 skeleton rounded-lg" />
                                    <div className="h-10 w-10 skeleton rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
