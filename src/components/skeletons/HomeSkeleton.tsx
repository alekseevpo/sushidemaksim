export const HomeSkeleton = () => (
    <div className="overflow-hidden">
        <div className="bg-black">
            {/* Hero Section */}
            <section
                className="relative min-h-screen w-full px-4 pt-20 md:pt-0 pb-10 flex flex-col items-center justify-center text-center overflow-hidden bg-black"
                style={{ contentVisibility: 'auto' }}
            >
                <div className="absolute inset-0 z-0 bg-gray-900 border-none animate-pulse" />

                <div className="relative z-20 flex flex-col items-center max-w-4xl mx-auto space-y-6 w-full">
                    {/* Badge */}
                    <div className="h-[25px] md:h-[28px] w-56 bg-white/10 rounded-full animate-pulse backdrop-blur-sm" />

                    {/* Title */}
                    <div className="space-y-3 md:space-y-4 w-full flex flex-col items-center">
                        <div className="h-[42px] md:h-[96px] w-[90%] md:w-[70%] bg-white/10 rounded-2xl animate-pulse" />
                        <div className="h-[42px] md:h-[96px] w-[80%] md:w-[60%] bg-white/10 rounded-2xl animate-pulse" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2 w-full flex flex-col items-center pt-2">
                        <div className="h-[20px] md:h-[28px] w-[90%] md:w-[60%] bg-white/10 rounded-lg animate-pulse" />
                        <div className="h-[20px] md:h-[28px] w-[80%] md:w-[50%] bg-white/10 rounded-lg animate-pulse" />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
                        <div className="h-[55px] md:h-[60px] w-full sm:w-[200px] bg-red-600/50 rounded-2xl animate-pulse" />
                        <div className="h-[55px] md:h-[60px] w-full sm:w-[200px] bg-white/10 rounded-2xl animate-pulse border border-white/10" />
                    </div>
                </div>

                {/* Scroll Down Indicator */}
                <div className="absolute bottom-6 inset-x-0 flex flex-col items-center justify-center gap-1.5 opacity-20 pointer-events-none">
                    <div className="h-[10px] w-12 bg-white/20 rounded-full" />
                    <div className="h-[16px] w-[16px] bg-white/20 rounded-full mt-1" />
                </div>
            </section>

            {/* Marquee Banner */}
            <div className="relative py-4 md:py-6 overflow-hidden bg-black border-y border-white/5 h-[68px] md:h-[92px]">
                <div className="w-full h-full bg-white/5 animate-pulse" />
            </div>
        </div>

        {/* Ratings Banner */}
        <section className="bg-white py-6 border-y border-gray-100 overflow-hidden">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-6 md:gap-px items-stretch rounded-3xl overflow-hidden p-1 md:p-0 h-[360px] md:h-[135px]">
                    <div className="flex-1 bg-gray-100/50 animate-pulse rounded-2xl md:rounded-r-none" />
                    <div className="flex-1 bg-gray-100/50 animate-pulse rounded-2xl md:rounded-l-none" />
                </div>
            </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16 px-2 md:px-6 bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-xl text-center md:text-left space-y-4 w-full">
                        <div className="h-[16px] w-48 bg-gray-200 rounded-full mx-auto md:mx-0 animate-pulse" />
                        <div className="h-[36px] md:h-[48px] w-3/4 mx-auto md:mx-0 bg-gray-200 rounded-2xl animate-pulse" />
                    </div>
                    <div className="hidden md:block h-[40px] w-48 bg-gray-100 rounded-full animate-pulse" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div
                            key={i}
                            className="h-40 md:h-56 bg-gray-100 rounded-[2rem] animate-pulse relative overflow-hidden"
                        >
                            <div className="absolute top-5 left-5 h-[20px] md:h-[24px] w-2/3 bg-gray-200 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Promo Banner Section */}
        <section className="px-4 py-6 md:py-12">
            <div className="max-w-7xl mx-auto">
                <div className="h-[280px] md:h-[224px] rounded-[2.5rem] bg-gray-100 animate-pulse" />
            </div>
        </section>

        {/* Reservation Section */}
        <section className="py-12 md:py-20 px-4 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="h-[300px] md:h-[500px] rounded-[3rem] bg-gray-100 animate-pulse order-last lg:order-first" />
                <div className="text-center lg:text-left space-y-6 w-full">
                    <div className="h-[16px] w-48 bg-gray-200 rounded-full mx-auto lg:mx-0 animate-pulse mb-4" />
                    <div className="h-[40px] md:h-[60px] w-3/4 mx-auto lg:mx-0 bg-gray-200 rounded-2xl animate-pulse mb-6" />
                    <div className="h-[20px] w-full bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-[20px] w-[90%] mx-auto lg:mx-0 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-[20px] w-[80%] mx-auto lg:mx-0 bg-gray-100 rounded-lg animate-pulse mb-10" />
                    <div className="h-[65px] w-full sm:w-[220px] bg-gray-200 rounded-2xl animate-pulse mx-auto lg:mx-0 mt-10" />
                </div>
            </div>
        </section>

        {/* Placeholder for the rest of the page to match scroll height roughly */}
        <div className="h-screen bg-transparent" />
    </div>
);
