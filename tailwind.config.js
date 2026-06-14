/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Identidad Muro CF (escudo: senyera roja/oro sobre blanco, corona dorada).
        muro: {
          DEFAULT: '#D81E26',
          dark: '#A4161A',
          light: '#E84C52',
        },
        gold: {
          DEFAULT: '#F2A900',
          dark: '#C8881B',
          light: '#FFC93C',
        },
      },
    },
  },
  plugins: [],
}
