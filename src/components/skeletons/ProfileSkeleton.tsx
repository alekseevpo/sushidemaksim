export const ProfileSkeleton = () => (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        {/* Header Section Skeleton */}
        <div className="bg-red-600 pt-12 pb-24 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/20 skeleton border-4 border-white/10 shadow-2xl" />

                    <div className="flex-1 space-y-4">
                        <div className="h-10 w-64 bg-white/20 skeleton rounded-xl mx-auto md:mx-0" />
                        <div className="h-4 w-48 bg-white/20 skeleton rounded-lg mx-auto md:mx-0 opacity-60" />
                    </div>

                    <div className="hidden md:block w-32 h-10 bg-white/10 skeleton rounded-xl" />
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
