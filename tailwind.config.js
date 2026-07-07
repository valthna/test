/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // The prototype uses a few intermediate shades / spacings that are not part
      // of the default Tailwind scale. Define them so the design renders as intended
      // instead of silently dropping the class.
      spacing: {
        0.2: '0.05rem',
        4.5: '1.125rem',
      },
      colors: {
        neutral: {
          150: '#ececec',
          250: '#d9d9d9',
          650: '#3f3f3f',
        },
        emerald: {
          150: '#bff0d8',
          250: '#8fe6bb',
          650: '#04814b',
        },
        rose: {
          150: '#ffd9de',
          650: '#c31d3f',
        },
        amber: {
          250: '#fce09a',
        },
        blue: {
          250: '#a9ccf7',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out',
      },
    },
  },
  plugins: [],
}
