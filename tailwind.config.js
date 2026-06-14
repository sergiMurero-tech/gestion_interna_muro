/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        muro: {
          DEFAULT: '#C8102E',
          dark: '#9E0C24',
          light: '#E8506A',
        },
      },
    },
  },
  plugins: [],
}
