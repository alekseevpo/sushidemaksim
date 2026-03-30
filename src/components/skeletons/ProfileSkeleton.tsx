export const ProfileSkeleton = () => (
    <div className="min-h-screen bg-transparent flex flex-col">
        {/* Header Section Skeleton - More Compact */}
        <div className="bg-orange-600 pt-8 pb-32 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/20 skeleton border-2 border-white/10 shadow-xl" />

                    <div className="flex-1 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <div className="h-8 w-48 bg-white/20 skeleton rounded-xl mx-auto md:mx-0" />
                            <div className="h-5 w-24 bg-white/10 skeleton rounded-full mx-auto md:mx-0" />
                        </div>
                        <div className="h-4 w-40 bg-white/20 skeleton rounded-lg mx-auto md:mx-0 opacity-60" />
                    </div>

                    {/* Stats Skeleton */}
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="h-14 w-full md:w-32 bg-white/10 skeleton rounded-[24px]" />
                        <div className="h-14 w-full md:w-14 bg-white/10 skeleton rounded-[24px]" />
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content Skeleton */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-2 md:px-4 -mt-16 pb-20 relative z-20">
            {/* Loyalty Program Skeletons */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                    <div
                        key={i}
                        className="bg-white rounded-[32px] p-6 shadow-xl border border-white space-y-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 skeleton rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 skeleton rounded" />
                                <div className="h-3 w-1/4 skeleton rounded opacity-50" />
                            </div>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 skeleton rounded-full" />
                    </div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar Skeleton */}
                <aside className="lg:w-80 shrink-0">
                    <div className="bg-white rounded-[32px] p-2 shadow-xl space-y-1.5 border border-gray-50">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-14 w-full skeleton rounded-2xl" />
                        ))}
                    </div>
                </aside>

                {/* Content Section Skeleton */}
                <div className="flex-1">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-xl p-6 md:p-8 space-y-8 border border-white">
                        <div className="h-8 w-1/3 skeleton rounded-xl mb-8" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-3">
                                    <div className="h-3 w-20 skeleton rounded opacity-40" />
                                    <div className="h-12 w-full skeleton rounded-2xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
);
