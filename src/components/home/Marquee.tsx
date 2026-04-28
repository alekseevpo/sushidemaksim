export const Marquee = () => (
    <div className="relative py-4 md:py-6 overflow-hidden bg-black border-y border-white/5 select-none">
        <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-12 px-6">
                    <span className="text-white/10 text-3xl md:text-5xl font-black italic tracking-tighter">
                        FRESH SEAFOOD DAILY
                    </span>
                    <span className="text-orange-600/30 text-3xl md:text-5xl font-black">●</span>
                    <span className="text-white/10 text-3xl md:text-5xl font-black italic tracking-tighter">
                        PREMIUM QUALITY
                    </span>
                    <span className="text-orange-600/30 text-3xl md:text-5xl font-black">●</span>
                    <span className="text-white/10 text-3xl md:text-5xl font-black italic tracking-tighter">
                        FASTEST DELIVERY
                    </span>
                    <span className="text-orange-600/30 text-3xl md:text-5xl font-black">●</span>
                </div>
            ))}
        </div>
    </div>
);
