export const HomeSkeleton = () => (
    <div className="min-h-screen bg-transparent pt-20">
        {/* Banner Skeleton */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
            <div className="aspect-[21/9] w-full skeleton rounded-[40px]" />
        </div>

        {/* Categories Skeleton */}
        <div className="max-w-7xl mx-auto px-4 mb-16 overflow-hidden flex gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-12 w-32 skeleton rounded-2xl shrink-0" />
            ))}
        </div>

        {/* Section Header Skeleton */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
            <div className="h-8 w-64 skeleton rounded-xl" />
        </div>

        {/* Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-square skeleton rounded-[32px]" />
            ))}
        </div>
    </div>
);
