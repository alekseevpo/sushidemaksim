export const MenuSkeleton = () => (
    <div className="min-h-screen bg-transparent px-2 md:px-4 py-4 md:py-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex gap-8">
            {/* Desktop Sidebar Skeleton (Hidden on mobile) */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[100px] self-start z-30">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <div className="h-4 w-24 skeleton rounded mb-6 opacity-30" />
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-10 w-full skeleton rounded-2xl opacity-60" />
                    ))}
                </div>
            </aside>

            <div className="flex-1 min-w-0">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8 h-14">
                    <div className="h-10 md:h-12 w-48 md:w-64 skeleton rounded-2xl" />
                    <div className="h-12 w-12 md:w-80 skeleton rounded-2xl" />
                </div>

                {/* Mobile Categories Scroll Skeleton (Hidden on desktop since we have sidebar skeleton) */}
                <div className="sticky top-[72px] md:top-[80px] -mx-2 md:-mx-4 px-2 md:px-4 py-4 mb-6 lg:hidden">
                    <div className="flex gap-2 overflow-hidden">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-10 w-28 skeleton rounded-2xl shrink-0 opacity-70" />
                        ))}
                    </div>
                </div>

                {/* Section Header Skeleton */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl skeleton shrink-0" />
                    <div className="h-8 w-40 skeleton rounded-xl" />
                    <div className="h-[2px] flex-1 bg-gray-100" />
                </div>

                {/* Product Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 pb-24">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                            key={i}
                            className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden border border-gray-100 flex flex-col h-full"
                        >
                            <div className="aspect-[4/3] md:h-56 skeleton w-full" />
                            <div className="p-3 md:p-6 flex-1 space-y-3">
                                <div className="space-y-2">
                                    <div className="h-4 md:h-6 w-3/4 skeleton rounded-lg md:rounded-xl" />
                                    <div className="h-3 w-1/4 skeleton rounded opacity-40" />
                                </div>
                                <div className="space-y-1.5 pt-2">
                                    <div className="h-3 w-full skeleton rounded opacity-40" />
                                    <div className="h-3 w-5/6 skeleton rounded opacity-40" />
                                </div>
                                <div className="pt-2 md:pt-4 flex items-center justify-between gap-1">
                                    <div className="h-6 md:h-8 w-16 md:w-20 skeleton rounded-lg opacity-80" />
                                    <div className="h-8 w-8 md:h-11 md:w-24 skeleton rounded-lg md:rounded-2xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

