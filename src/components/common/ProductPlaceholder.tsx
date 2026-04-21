import React from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';

interface ProductPlaceholderProps {
    className?: string;
    iconSize?: number;
    text?: string;
}

/**
 * A standard, premium-styled placeholder for product images.
 * Designed to be used as fallbackContent for SafeImage.
 */
export const ProductPlaceholder: React.FC<ProductPlaceholderProps> = ({
    className,
    iconSize = 24,
    text = 'No Image',
}) => {
    return (
        <div
            className={cn(
                'w-full h-full bg-[#111111] flex flex-col items-center justify-center p-4 gap-2 border border-white/5',
                className
            )}
        >
            <div className="relative">
                <ImageOff size={iconSize} className="text-gray-700" />
                <div className="absolute inset-0 bg-orange-600/5 blur-xl rounded-full" />
            </div>
            {text && (
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em] text-center ml-1">
                    {text}
                </span>
            )}
        </div>
    );
};
