// Grid of cards to be used during initial load and category changes
export const MenuItemsSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 pb-24">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div
                key={i}
                className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden border border-gray-100 flex flex-col h-full"
            >
                {/* Image Container Skeleton */}
                <div className="aspect-[4/3] md:h-56 skeleton w-full" />

                {/* Info Container Skeleton */}
                <div className="p-3 md:p-6 flex flex-col flex-1">
                    <div className="mb-2 md:mb-3 space-y-2">
                        <div className="h-4 md:h-6 w-3/4 skeleton rounded-lg md:rounded-xl" />
                        <div className="h-2.5 md:h-3 w-1/4 skeleton rounded opacity-40" />
                    </div>

                    <div className="space-y-1.5 mb-4 md:mb-6">
                        <div className="h-3 w-full skeleton rounded opacity-30" />
                        <div className="h-3 w-5/6 skeleton rounded opacity-30" />
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-1">
                        <div className="h-5 md:h-8 w-14 md:w-20 skeleton rounded-lg opacity-80" />
                        <div className="h-8 w-8 md:h-11 md:w-24 skeleton rounded-lg md:rounded-2xl" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// Full page skeleton for Suspense fallback
export const MenuSkeleton = () => (
    <div className="min-h-screen bg-transparent px-0 md:px-4 pb-0 pt-0 flex flex-col">
        <div className="max-w-7xl mx-auto flex-1 lg:flex px-4 md:px-6 w-full">
            {/* Desktop Sidebar Skeleton */}
            <aside className="hidden lg:block w-[220px] flex-shrink-0 bg-red-600 min-h-full z-30">
                <div className="sticky top-[72px] h-[calc(100vh-72px)] pb-8 px-3 flex flex-col items-stretch pt-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div
                            key={i}
                            className="h-[52px] w-full bg-white/10 skeleton rounded-xl opacity-60 mb-0"
                        />
                    ))}
                    <div className="mt-auto py-10 flex items-center justify-center opacity-20">
                        <div className="w-16 h-16 bg-white/20 skeleton rounded-full" />
                    </div>
                </div>
            </aside>

            <div className="flex-1 min-w-0 md:pl-8 pt-20 md:pt-8">
                {/* Categories Skeleton Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-10 gap-4">
                    <div className="h-10 md:h-14 w-40 md:w-64 skeleton rounded-[24px] md:rounded-[32px] opacity-80" />
                    <div className="h-11 md:h-12 w-full md:w-80 skeleton rounded-[20px] md:rounded-[24px]" />
                </div>

                {/* Mobile Categories Scroll Skeleton (Hidden on desktop) */}
                <div className="mb-8 lg:hidden">
                    <div className="flex gap-3 overflow-hidden py-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="h-10 w-28 bg-white skeleton rounded-2xl flex-shrink-0 opacity-40"
                            />
                        ))}
                    </div>
                </div>

                {/* Grid Skeleton - Using the detailed MenuItemsSkeleton for perfect matching */}
                <MenuItemsSkeleton />
            </div>
        </div>
    </div>
);
