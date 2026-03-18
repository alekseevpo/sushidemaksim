export const HomeSkeleton = () => (
    <div className="overflow-hidden">
        {/* Hero Section Skeleton */}
        <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center px-4 pt-24 md:pt-20 pb-20 md:pb-32 bg-gray-900">
            <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left space-y-8">
                    {/* Badge */}
                    <div className="h-6 w-48 bg-white/10 rounded-full mx-auto lg:mx-0 animate-pulse" />
                    {/* Title */}
                    <div className="space-y-4">
                        <div className="h-12 md:h-16 w-full md:w-3/4 bg-white/10 rounded-2xl mx-auto lg:mx-0 animate-pulse" />
                        <div className="h-12 md:h-16 w-2/3 md:w-1/2 bg-white/10 rounded-2xl mx-auto lg:mx-0 animate-pulse" />
                    </div>
                    {/* Description */}
                    <div className="space-y-2">
                        <div className="h-4 w-full md:w-2/3 bg-white/5 rounded-lg mx-auto lg:mx-0 animate-pulse" />
                        <div className="h-4 w-1/2 bg-white/5 rounded-lg mx-auto lg:mx-0 animate-pulse" />
                    </div>
                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                        <div className="h-14 w-full sm:w-48 bg-white/20 rounded-2xl animate-pulse" />
                        <div className="h-14 w-full sm:w-48 bg-white/10 rounded-2xl animate-pulse" />
                    </div>
                </div>
                {/* Image Placeholder */}
                <div className="hidden lg:block relative">
                    <div className="aspect-square w-full max-w-md mx-auto bg-white/5 rounded-[3rem] animate-pulse border-8 border-white/5" />
                </div>
            </div>
        </section>

        {/* Marquee Skeleton */}
        <div className="h-16 md:h-20 bg-gray-950 animate-pulse" />

        {/* Stats Banner Skeleton */}
        <section className="bg-white/50 py-8 md:py-10 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-8 items-center">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col md:flex-row items-center gap-3">
                        <div className="h-8 w-12 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="space-y-1 hidden md:block">
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Categories Section Skeleton */}
        <section className="py-24 px-4 bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                    <div className="h-10 w-48 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="h-48 md:h-64 bg-gray-100 rounded-[2rem] animate-pulse"
                        />
                    ))}
                </div>
            </div>
        </section>

        {/* Promo Banner Skeleton */}
        <section className="px-4 py-12">
            <div className="max-w-7xl mx-auto h-64 bg-gray-100 rounded-[2.5rem] animate-pulse" />
        </section>

        {/* Features Section Skeleton */}
        <section className="py-24 px-4 bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4 font-black">
                    <div className="h-12 w-64 skeleton rounded-2xl mx-auto animate-pulse" />
                    <div className="h-4 w-96 skeleton rounded-lg mx-auto opacity-40 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-white p-8 rounded-[40px] border border-gray-100 h-64 space-y-6 flex flex-col items-center animate-pulse"
                        >
                            <div className="w-16 h-16 skeleton rounded-2xl shrink-0 opacity-20" />
                            <div className="h-6 w-3/4 skeleton rounded-lg" />
                            <div className="space-y-2 w-full">
                                <div className="h-4 w-full skeleton rounded-md opacity-20" />
                                <div className="h-4 w-2/3 skeleton rounded-md opacity-20 mx-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section Skeleton */}
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto h-[350px] bg-gray-100 rounded-[3rem] animate-pulse flex flex-col items-center justify-center space-y-6">
                <div className="h-12 w-64 bg-gray-200 rounded-2xl" />
                <div className="h-4 w-80 bg-gray-200 rounded-lg" />
                <div className="h-16 w-56 bg-white rounded-2xl" />
            </div>
        </section>
    </div>
);
