export const PromoSkeleton = () => (
    <div className="min-h-screen bg-transparent pt-20 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
        {/* Promo Header Skeleton */}
        <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="h-10 w-64 skeleton rounded-2xl mx-auto" />
            <div className="h-4 w-96 skeleton rounded-lg mx-auto opacity-50" />
        </div>

        {/* Promo List (Skeleton Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 pb-24">
            {[1, 2, 3, 4].map(i => (
                <div
                    key={i}
                    className="flex flex-col gap-8 bg-white p-6 rounded-[50px] border border-gray-100 shadow-sm relative overflow-hidden h-[450px]"
                >
                    <div className="aspect-[16/10] w-full skeleton rounded-[40px]" />
                    <div className="space-y-4 mt-2">
                        <div className="h-8 w-3/4 skeleton rounded-xl" />
                        <div className="h-4 w-full skeleton rounded-lg opacity-50" />
                        <div className="h-14 w-full skeleton rounded-3xl mt-4" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);
