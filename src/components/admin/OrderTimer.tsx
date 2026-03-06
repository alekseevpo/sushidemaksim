import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const OrderTimer = ({ createdAt, status }: { createdAt: string, status: string }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        if (status === 'delivered' || status === 'cancelled') return;

        const calculateTime = () => {
            try {
                // Ensure date parsing works correctly across browsers
                const safeDateStr = createdAt.replace(' ', 'T');
                const createdDate = new Date(safeDateStr + (safeDateStr.includes('Z') ? '' : 'Z'));
                const now = new Date();

                const elapsed = now.getTime() - createdDate.getTime();
                const sixtyMinutes = 60 * 60 * 1000;
                const remaining = sixtyMinutes - elapsed;

                if (remaining <= 0) {
                    setIsLate(true);
                    const expired = Math.abs(remaining);
                    const min = Math.floor(expired / 60000);
                    const sec = Math.floor((expired % 60000) / 1000);
                    setTimeLeft(`-${min}:${sec.toString().padStart(2, '0')}`);
                } else {
                    setIsLate(false);
                    const min = Math.floor(remaining / 60000);
                    const sec = Math.floor((remaining % 60000) / 1000);
                    setTimeLeft(`${min}:${sec.toString().padStart(2, '0')}`);
                }
            } catch (e) {
                setTimeLeft('--:--');
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [createdAt, status]);

    if (status === 'delivered' || status === 'cancelled') {
        return <span className="text-[10px] font-bold text-gray-400 uppercase">Terminado</span>;
    }

    return (
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${isLate ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
            <Clock size={10} />
            {timeLeft}
        </div>
    );
};
