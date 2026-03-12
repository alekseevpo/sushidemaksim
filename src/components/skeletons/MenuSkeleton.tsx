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
    <div className="min-h-screen bg-transparent px-2 md:px-4 py-4 md:py-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex gap-8">
            {/* Desktop Sidebar Skeleton */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[100px] self-start z-30">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <div className="h-4 w-16 skeleton rounded-lg mb-6 opacity-30" />
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-11 w-full skeleton rounded-2xl opacity-60" />
                    ))}
                </div>
            </aside>

            <div className="flex-1 min-w-0">
                {/* Header Skeleton - Matches MenuPageSimple exactly */}
                <div className="flex items-center justify-between mb-8 h-14">
                    <div className="h-10 md:h-14 w-40 md:w-64 skeleton rounded-2xl" />
                    <div className="h-10 md:h-12 w-10 md:w-80 skeleton rounded-2xl" />
                </div>

                {/* Mobile Categories Scroll Skeleton (Hidden on desktop) */}
                <div className="mb-6 lg:hidden">
                    <div className="flex gap-2 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div
                                key={i}
                                className="h-10 w-28 skeleton rounded-2xl shrink-0 opacity-70"
                            />
                        ))}
                    </div>
                </div>

                {/* Grid Header Skeleton */}
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-12 h-12 rounded-2xl skeleton shrink-0" />
                    <div className="h-8 w-48 skeleton rounded-xl" />
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                </div>

                <MenuItemsSkeleton />
            </div>
        </div>
    </div>
);
