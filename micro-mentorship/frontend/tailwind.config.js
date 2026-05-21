/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0d0d0f',
          50: '#f5f5f6',
          100: '#e8e8ea',
          200: '#c8c8cc',
          300: '#9898a0',
          400: '#6b6b75',
          500: '#3d3d45',
          600: '#252530',
          700: '#17171f',
          800: '#0d0d14',
          900: '#080810',
        },
        accent: {
          DEFAULT: '#7c6af7',
          dim: '#5b4dd1',
          soft: '#ede9ff',
        },
        emerald: { light: '#d1fae5', DEFAULT: '#10b981', dark: '#065f46' },
        amber:   { light: '#fef3c7', DEFAULT: '#f59e0b', dark: '#78350f' },
        rose:    { light: '#ffe4e6', DEFAULT: '#f43f5e', dark: '#881337' },
        sky:     { light: '#e0f2fe', DEFAULT: '#0ea5e9', dark: '#0c4a6e' },
      },
    },
  },
  plugins: [],
};
