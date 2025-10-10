import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          600: '#2E7D32',
          700: '#256528',
        },
        fern: {
          300: '#81C784',
        },
        sky: {
          300: '#4FC3F7',
        },
        bark: {
          600: '#6D4C41',
        },
        compost: {
          400: '#8BC34A',
        },
        ivory: '#FAFDF7',
        ink: '#0B1A13',
        line: '#E6F2E9',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Fraunces', ...defaultTheme.fontFamily.serif],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(129,199,132,0.95), rgba(250,253,247,0.95))',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: 0, transform: 'translateY(-8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'slide-down': 'slide-down 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
