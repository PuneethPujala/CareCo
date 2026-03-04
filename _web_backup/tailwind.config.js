/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          green: '#22C55E',
          pink: '#EC4899',
        },
        secondary: {
          coral: '#F97316',
          green: '#22C55E',
          amber: '#F59E0B',
          red: '#EF4444',
        },
        neutral: {
          white: '#FFFFFF',
          lightGray: '#F9FAFB',
          gray: '#6B7280',
          darkGray: '#1F2937',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#8B5CF6', // Purple instead of red
          info: '#06B6D4',
        }
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}