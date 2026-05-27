/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        // Laranja principal — identidade Organiza Odonto
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(14px)'},to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:    { from: { opacity: '0', transform: 'scale(0.94)' },   to: { opacity: '1', transform: 'scale(1)' } },
        pulseSoft:  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}
