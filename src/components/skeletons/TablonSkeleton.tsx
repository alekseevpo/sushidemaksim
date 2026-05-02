export function TablonSkeleton() {
    return (
        <div className="min-h-[100svh] bg-[#0d0d0d] pt-24 pb-20 relative">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-orange-900/15 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-orange-950/25 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[110vw] h-[70vw] bg-orange-900/20 rounded-full blur-[160px]" />
            </div>

            {/* Content Skeleton */}
            <div className="relative z-10 max-w-6xl mx-auto px-4">
                {/* Filters Skeleton */}
                <div className="flex gap-2 overflow-hidden mb-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                            key={i}
                            className="h-9 w-24 bg-white/5 rounded-full animate-pulse flex-shrink-0"
                        />
                    ))}
                </div>

                {/* Post Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                            key={i}
                            className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden"
                        >
                            <div className="h-48 bg-white/5 animate-pulse" />
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="h-5 w-24 bg-white/5 rounded-full animate-pulse" />
                                    <div className="h-4 w-12 bg-white/5 rounded animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                                    <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
                                    <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-5 w-16 bg-white/5 rounded-md animate-pulse" />
                                    <div className="h-5 w-12 bg-white/5 rounded-md animate-pulse" />
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-white/5 rounded-full animate-pulse" />
                                        <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                                    </div>
                                    <div className="h-3 w-8 bg-white/5 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
