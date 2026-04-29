import { Link } from 'react-router-dom';

interface HeaderLogoProps {
    isTable: boolean;
    isScrolled: boolean;
    isTransparentHeaderPage: boolean;
    setShowMobileMenu: (show: boolean) => void;
}

export default function HeaderLogo({
    isTable,
    isScrolled,
    isTransparentHeaderPage,
    setShowMobileMenu,
}: HeaderLogoProps) {
    return (
        <div
            className={`flex-1 flex items-center h-full ${isTable ? 'justify-end' : 'justify-start'}`}
        >
            <Link
                to={isTable ? '/table' : '/'}
                onClick={e => {
                    if (isTable) {
                        e.preventDefault();
                    }
                    setShowMobileMenu(false);
                    if ((window as any).lenis) {
                        (window as any).lenis.scrollTo(0);
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }}
                className="flex items-center no-underline gap-0 group h-full"
            >
                <div
                    className={`
                        transition-all duration-500 shrink-0 flex items-center justify-center
                        md:bg-orange-600 md:h-full md:w-[200px]
                        bg-transparent h-16 w-auto px-1
                    `}
                >
                    <img
                        src="/logo.svg"
                        alt="Sushi de Maksim"
                        className={`
                            h-10 md:h-14 w-auto object-contain transition-all duration-500
                            ${
                                isTable
                                    ? 'brightness-0 invert'
                                    : isScrolled || !isTransparentHeaderPage
                                      ? 'brightness-0 md:invert'
                                      : 'brightness-0 invert'
                            }
                        `}
                    />
                </div>
            </Link>
        </div>
    );
}
