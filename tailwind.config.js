/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f6f0',
          100: '#e8ede0',
          200: '#d1dbc1',
          300: '#b4c39a',
          400: '#97a973',
          500: '#7d8f56',
          600: '#4E6813',
          700: '#3e5310',
          800: '#2f3e0c',
          900: '#1f2908',
          950: '#0f1404',
        },
        secondary: {
          50: '#faf8f5',
          100: '#f5f0ea',
          200: '#eae0d5',
          300: '#dcc9b8',
          400: '#ccb199',
          500: '#B59E7D',
          600: '#a68e6b',
          700: '#8b7558',
          800: '#6f5d46',
          900: '#534534',
          950: '#372d22',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 