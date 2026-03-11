export const CartSkeleton = () => (
    <div className="min-h-screen bg-transparent px-4 py-8 md:py-12 mt-16">
        <div className="max-w-6xl mx-auto">
            {/* Title skeleton */}
            <div className="h-10 w-48 skeleton rounded-2xl mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items skeleton */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-[32px] flex gap-4 border border-gray-100"
                        >
                            <div className="w-20 h-20 skeleton rounded-2xl shrink-0" />
                            <div className="flex-1 space-y-3 pt-1">
                                <div className="h-5 w-1/3 skeleton rounded-lg" />
                                <div className="h-4 w-2/3 skeleton rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary skeleton */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[35px] border border-gray-100 space-y-4 shadow-sm">
                        <div className="h-6 w-1/2 skeleton rounded-lg mb-2" />
                        <div className="h-4 w-full skeleton rounded-lg" />
                        <div className="h-4 w-full skeleton rounded-lg" />
                        <div className="h-12 w-full skeleton rounded-2xl mt-4" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
