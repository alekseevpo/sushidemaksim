export const PostSkeleton = () => (
    <div className="min-h-screen bg-transparent pb-20">
        {/* Back Button Skeleton */}
        <div className="absolute top-24 left-4 md:left-8 z-50">
            <div className="h-10 w-28 skeleton rounded-full" />
        </div>

        {/* Hero Image Skeleton */}
        <div className="relative h-[50vh] md:h-[60vh] w-full bg-gray-900 overflow-hidden">
            <div className="skeleton w-full h-full opacity-20" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:px-32 max-w-5xl mx-auto space-y-4">
                <div className="h-6 w-24 skeleton rounded-full opacity-40" />
                <div className="h-12 md:h-16 w-3/4 skeleton rounded-2xl" />
                <div className="flex gap-6">
                    <div className="h-4 w-32 skeleton rounded opacity-40" />
                    <div className="h-4 w-32 skeleton rounded opacity-40" />
                </div>
            </div>
        </div>

        {/* Content Section Skeleton */}
        <div className="max-w-3xl mx-auto px-6 pt-16 md:pt-24 relative space-y-12">
            {/* Author Badge Skeleton */}
            <div className="absolute -top-10 right-6 md:right-10 h-16 w-48 skeleton rounded-2xl shadow-xl border border-gray-100" />

            {/* Excerpt Skeleton */}
            <div className="h-20 w-full skeleton rounded-2xl border-l-4 border-orange-500 opacity-80" />

            {/* Content Body Skeletons */}
            <div className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-3">
                        <div className="h-4 w-full skeleton rounded opacity-70" />
                        <div className="h-4 w-full skeleton rounded opacity-70" />
                        <div className="h-4 w-4/5 skeleton rounded opacity-70" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);
