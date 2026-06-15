/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Anton"', 'Impact', 'system-ui', 'sans-serif'],
      },
      colors: {
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
      boxShadow: {
        gold: '0 10px 30px -10px rgba(242, 169, 0, 0.45)',
        glow: '0 0 0 1px rgba(242,169,0,0.4), 0 12px 40px -12px rgba(242,169,0,0.5)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(242,169,0,0.6)' },
          '50%': { boxShadow: '0 0 0 14px rgba(242,169,0,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'slide-in': 'slide-in 0.4s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-gold': 'pulse-gold 2s ease-out infinite',
      },
      backgroundImage: {
        'gold-grad': 'linear-gradient(135deg, #FFC93C 0%, #F2A900 50%, #C8881B 100%)',
        'red-grad': 'linear-gradient(135deg, #E84C52 0%, #D81E26 50%, #A4161A 100%)',
        'stripes-gold':
          'repeating-linear-gradient(45deg, rgba(242,169,0,0.18) 0px, rgba(242,169,0,0.18) 8px, transparent 8px, transparent 16px)',
      },
    },
  },
  plugins: [],
}
