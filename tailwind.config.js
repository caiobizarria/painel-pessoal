/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        surface: '#13151c',
        'surface-subtle': '#1e212b',
        border: '#272b37',
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff'
        },
        priority: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}