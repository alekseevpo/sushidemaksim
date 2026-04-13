interface BrandedPlaceholderProps {
    className?: string;
    icon?: string;
    color?: string;
}

export default function BrandedPlaceholder({
    className = 'w-full h-full',
    icon = '🍱',
    color = '#F26522',
}: BrandedPlaceholderProps) {
    return (
        <div
            className={`relative flex items-center justify-center overflow-hidden bg-gray-50 ${className}`}
            style={{ backgroundColor: `${color}10` }} // 10% opacity version of the color
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>

            {/* Logo Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
                <img src="/logo.svg" alt="" className="w-1/2 h-1/2 object-contain grayscale" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl animate-float"
                    style={{ backgroundColor: color, color: 'white' }}
                >
                    {icon}
                </div>
                <img
                    src="/logo.svg"
                    alt="Sushi de Maksim"
                    className="h-6 object-contain opacity-20 grayscale"
                />
            </div>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
