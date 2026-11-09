/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xpool: {
          50: '#fffbf0',
          100: '#fef3c7',
          200: '#fde047',
          300: '#facc15',
          400: '#fbbf24',
          500: '#f59e0b', // primary amber
          600: '#ea580c', // secondary orange
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        slate: {
          850: '#151e2e',
          950: '#070b14',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(245, 158, 11, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}

