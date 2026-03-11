export const BlogSkeleton = () => (
    <div className="min-h-screen bg-transparent pt-20 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
        {/* Blog Header Skeleton */}
        <div className="text-center space-y-4 mb-20">
            <div className="h-10 w-64 skeleton rounded-2xl mx-auto" />
            <div className="h-4 w-96 skeleton rounded-lg mx-auto opacity-50" />
        </div>

        {/* Blog Layout Skeleton */}
        <div className="flex flex-col lg:flex-row gap-12">
            {/* Blog Post List (Skeleton Cards) */}
            <div className="flex-1 space-y-16">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col gap-8">
                        <div className="aspect-[21/9] w-full skeleton rounded-[40px]" />
                        <div className="space-y-4">
                            <div className="h-8 w-3/4 skeleton rounded-xl" />
                            <div className="h-4 w-full skeleton rounded-lg" />
                            <div className="h-4 w-1/2 skeleton rounded-md opacity-50" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Blog Sidebar Skeleton */}
            <div className="w-full lg:w-96 space-y-12">
                <div className="bg-white p-10 rounded-[45px] border border-gray-100 space-y-6 shadow-sm">
                    <div className="h-6 w-3/4 skeleton rounded-lg" />
                    <div className="space-y-4 mt-8">
                        {[1, 2].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="w-16 h-16 skeleton rounded-2xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-full skeleton rounded-md" />
                                    <div className="h-3 w-1/2 skeleton rounded opacity-50" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
