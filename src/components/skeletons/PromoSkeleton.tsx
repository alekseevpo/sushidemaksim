export const PromoSkeleton = () => (
    <div className="flex-1 bg-transparent">
        {/* Hero Header Skeleton */}
        <section className="relative h-72 md:h-80 flex items-center justify-center overflow-hidden pt-12 border-b border-gray-800 bg-black/80">
            <div className="max-w-4xl mx-auto text-center relative z-10 w-full px-4 space-y-4">
                <div className="h-12 w-3/4 skeleton rounded-2xl mx-auto opacity-30" />
                <div className="h-6 w-1/2 skeleton rounded-lg mx-auto opacity-20" />
            </div>
        </section>

        <div className="max-w-7xl mx-auto px-2 md:px-4 -mt-12 md:-mt-20 mb-20 relative z-20">
            {/* Static Promo Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-16">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className="bg-white rounded-3xl shadow-lg border border-gray-50 overflow-hidden flex flex-col h-[400px]"
                    >
                        <div className="p-8 h-40 bg-gray-100 skeleton rounded-none" />
                        <div className="p-6 flex flex-col flex-1 space-y-4">
                            <div className="h-4 w-full skeleton rounded" />
                            <div className="h-4 w-2/3 skeleton rounded" />
                            <div className="mt-auto h-12 w-full skeleton rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Weekly Banner Skeleton */}
            <div className="bg-orange-100 h-64 md:h-80 rounded-[2.5rem] md:rounded-[3rem] mb-20 skeleton" />

            {/* Promo Menu Items Skeleton */}
            <div className="max-w-5xl mx-auto space-y-10">
                <div className="h-8 w-48 skeleton rounded-xl mx-auto" />
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
                    {[1, 2].map(i => (
                        <div
                            key={i}
                            className="bg-white rounded-3xl shadow-lg border border-gray-50 overflow-hidden flex flex-col h-[350px] md:h-[450px]"
                        >
                            <div className="h-32 md:h-56 skeleton rounded-none" />
                            <div className="p-4 md:p-8 space-y-4 flex-1">
                                <div className="h-6 md:h-8 w-3/4 skeleton rounded-xl" />
                                <div className="h-4 w-full skeleton rounded-lg" />
                                <div className="mt-auto h-10 md:h-14 w-full skeleton rounded-xl md:rounded-2xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
