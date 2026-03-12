export const MenuSkeleton = () => (
    <div className="space-y-12 pb-24">
        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
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
    </div>
);
