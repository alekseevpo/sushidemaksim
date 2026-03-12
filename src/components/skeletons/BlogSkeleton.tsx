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
        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
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
