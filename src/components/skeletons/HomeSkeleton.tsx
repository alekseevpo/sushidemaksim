export const HomeSkeleton = () => (
    <div className="overflow-hidden">
        {/* Hero Section Skeleton */}
        <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center px-4 pt-24 md:pt-20 pb-20 md:pb-32 bg-gray-900">
            <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left space-y-8">
                    <div className="h-6 w-48 bg-white/10 rounded-full mx-auto lg:mx-0 animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-16 md:h-24 w-full md:w-3/4 bg-white/10 rounded-2xl mx-auto lg:mx-0 animate-pulse" />
                        <div className="h-16 md:h-24 w-2/3 md:w-1/2 bg-white/10 rounded-2xl mx-auto lg:mx-0 animate-pulse" />
                    </div>
                    <div className="h-4 w-full md:w-2/3 bg-white/5 rounded-lg mx-auto lg:mx-0 animate-pulse" />
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                        <div className="h-14 w-48 bg-white/20 rounded-2xl animate-pulse" />
                        <div className="h-14 w-48 bg-white/10 rounded-2xl animate-pulse" />
                    </div>
                </div>
                <div className="hidden lg:block relative">
                    <div className="aspect-square w-full skeleton rounded-full opacity-10 animate-pulse scale-90" />
                </div>
            </div>
        </section>

        {/* Features Section Skeleton */}
        <section className="py-24 px-4 bg-transparent mt-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 h-64 space-y-6 flex flex-col items-center">
                        <div className="w-16 h-16 skeleton rounded-2xl shrink-0" />
                        <div className="h-6 w-3/4 skeleton rounded-lg" />
                        <div className="h-4 w-full skeleton rounded-md opacity-40" />
                    </div>
                ))}
            </div>
        </section>
    </div>
);
