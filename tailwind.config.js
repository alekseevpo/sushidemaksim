/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sushi-red': '#DC2626',
        'sushi-pink': '#EC4899',
        'wasabi': '#84CC16',
        'soy': '#78716C',
        'rice': '#FEF3C7',
      },
    },
  },
  plugins: [],
}
