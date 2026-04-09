export const BlogSkeleton = () => (
    <div className="min-h-screen bg-transparent pb-20">
        {/* Hero Section Skeleton */}
        <section className="relative h-[40vh] bg-gray-900 flex items-center justify-center">
            <div className="text-center space-y-4 px-4 w-full">
                <div className="h-6 w-32 bg-white/10 rounded-full mx-auto animate-pulse" />
                <div className="h-12 md:h-16 w-3/4 md:w-1/2 bg-white/10 rounded-2xl mx-auto animate-pulse" />
                <div className="h-4 w-2/3 md:w-1/3 bg-white/5 rounded-lg mx-auto animate-pulse" />
            </div>
        </section>

        {/* Post Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-14 relative z-20">
            {/* Event Banner Skeleton */}
            <div className="w-full bg-gray-900/40 rounded-[2rem] h-[500px] md:h-[400px] mb-16 animate-pulse flex flex-col md:flex-row overflow-hidden border border-white/5">
                <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-center space-y-6">
                    <div className="flex gap-3">
                        <div className="h-6 w-24 bg-white/10 rounded-full" />
                        <div className="h-6 w-20 bg-white/10 rounded-full" />
                    </div>
                    <div className="h-12 w-3/4 bg-white/10 rounded-xl" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-white/5 rounded" />
                        <div className="h-4 w-5/6 bg-white/5 rounded" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="h-24 bg-white/5 rounded-2xl" />
                        <div className="h-24 bg-white/5 rounded-2xl" />
                    </div>
                </div>
                <div className="hidden md:block md:w-2/5 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full"
                    >
                        <div className="h-64 skeleton rounded-none" />
                        <div className="p-6 flex-1 flex flex-col space-y-4">
                            <div className="h-4 w-1/4 skeleton rounded" />
                            <div className="h-8 w-full skeleton rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-3 w-full skeleton rounded" />
                                <div className="h-3 w-5/6 skeleton rounded" />
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between">
                                <div className="h-4 w-1/3 skeleton rounded" />
                                <div className="h-4 w-1/4 skeleton rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
