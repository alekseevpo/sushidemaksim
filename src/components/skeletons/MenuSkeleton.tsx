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
    <div className="min-h-screen bg-transparent px-2 md:px-4 pb-0 pt-0 flex flex-col">
        <div className="max-w-7xl mx-auto flex-1 lg:flex px-4 w-full">
            {/* Desktop Sidebar Skeleton */}
            <aside className="hidden lg:block w-[218px] flex-shrink-0 bg-red-600 min-h-full z-30">
                <div className="sticky top-[64px] h-[calc(100vh-64px)] pb-8 px-3 flex flex-col items-stretch space-y-0">
                    <div className="h-4 w-16 bg-white/20 skeleton rounded-lg my-4 mx-8 opacity-30" />
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div
                            key={i}
                            className="h-[52px] w-full bg-white/10 skeleton rounded-none opacity-60"
                        />
                    ))}
                </div>
            </aside>

            <div className="flex-1 min-w-0 md:pl-8 pt-4 md:pt-8">
                {/* Header Skeleton - Matches MenuSearch layout precisely */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 h-14">
                    <div className="h-10 md:h-14 w-40 md:w-64 skeleton rounded-2xl" />
                    <div className="h-10 md:h-12 w-10 md:w-80 skeleton rounded-2xl self-end md:self-auto" />
                </div>

                {/* Mobile Categories Scroll Skeleton (Hidden on desktop) */}
                <div className="mb-6 lg:hidden">
                    <div className="flex gap-2 overflow-hidden py-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="h-10 w-24 bg-white skeleton rounded-2xl flex-shrink-0"
                            />
                        ))}
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8 pb-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[400px] w-full bg-white skeleton rounded-3xl" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);
