export const ProfileSkeleton = () => (
    <div className="min-h-screen bg-transparent flex flex-col">
        {/* Header Section Skeleton */}
        <div className="bg-red-600/10 pt-12 pb-24 px-4 relative overflow-hidden border-b border-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl skeleton" />
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="h-10 w-48 md:w-64 skeleton rounded-xl mx-auto md:mx-0" />
                        <div className="h-4 w-32 md:w-48 skeleton rounded-lg mx-auto md:mx-0 opacity-40" />
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content Skeleton */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-2 md:px-4 -mt-16 pb-20 relative z-20">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar Skeleton */}
                <aside className="lg:w-80 shrink-0">
                    <div className="bg-white rounded-[32px] p-4 shadow-xl space-y-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-14 w-full skeleton rounded-2xl" />
                        ))}
                    </div>
                </aside>

                {/* Content Section Skeleton */}
                <div className="flex-1">
                    <div className="bg-white rounded-[32px] shadow-xl p-8 space-y-8">
                        <div className="h-8 w-1/3 skeleton rounded-xl mb-12" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-4">
                                    <div className="h-4 w-24 skeleton rounded opacity-50" />
                                    <div className="h-14 w-full skeleton rounded-2xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
);
