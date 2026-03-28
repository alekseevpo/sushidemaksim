/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                'sushi-red': '#DC2626',
                'sushi-pink': '#EC4899',
                wasabi: '#84CC16',
                soy: '#78716C',
                rice: '#FEF3C7',
            },
            zIndex: {
                sticky: '100',
                header: '500',
                fixed: '600',
                backdrop: '1000',
                modal: '1100',
                popover: '1200',
                toast: '20000',
                loading: '30000',
                max: '99999',
            },
        },
    },
    plugins: [],
    future: {
        hoverOnlyWhenSupported: true,
    },
};
