import { MapPin } from 'lucide-react';

export const SearchSkeleton = ({ count = 4 }: { count?: number }) => {
    return (
        <div className="divide-y divide-gray-50 bg-white/50 backdrop-blur-sm">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="w-full px-5 py-4 flex items-start gap-3 animate-pulse">
                    <div className="mt-1 w-4 h-4 bg-gray-100 rounded-full shrink-0" />
                    <div className="flex flex-col flex-1 space-y-2 min-w-0">
                        <div className="h-4 w-3/4 bg-gray-100 rounded-lg" />
                        <div className="h-3 w-1/2 bg-gray-50 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const MapPlaceholderSkeleton = () => (
    <div className="absolute inset-0 bg-gray-100 animate-pulse flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-white/50 rounded-3xl shadow-sm flex items-center justify-center">
            <MapPin size={32} className="text-gray-200" />
        </div>
        <div className="h-2 w-32 bg-gray-200 rounded-full opacity-50" />
    </div>
);
