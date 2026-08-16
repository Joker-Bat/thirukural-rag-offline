/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFCF7',
          100: '#FAF8F0',
          200: '#F3EFE0',
          300: '#E8E1CC',
          400: '#D5C9A8',
          500: '#BDB088',
        },
        terracotta: {
          50: '#FDF4F0',
          100: '#FCE7DF',
          200: '#F8CEBE',
          500: '#C2410C',
          600: '#9A3412',
          700: '#7C2D12',
        },
        indigoSlate: {
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        'serif-tamil': ['"Noto Serif Tamil"', 'serif'],
        'sans-tamil': ['"Noto Sans Tamil"', 'sans-serif'],
        'sans': ['"Plus Jakarta Sans"', '"Noto Sans Tamil"', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
