export const ProfileSkeleton = () => (
    <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
            {/* Profile Sidebar Skeleton */}
            <div className="w-72 space-y-4">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 items-center flex flex-col space-y-4 mb-4">
                    <div className="w-24 h-24 skeleton rounded-[32px] mb-2 shadow-sm" />
                    <div className="h-6 w-3/4 skeleton rounded-lg" />
                    <div className="h-4 w-1/2 skeleton rounded-md opacity-50" />
                </div>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 w-full skeleton rounded-2xl" />
                ))}
            </div>

            {/* Profile Content Skeleton */}
            <div className="flex-1 space-y-8">
                <div className="bg-white p-12 rounded-[50px] border border-gray-100">
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
    </div>
);
