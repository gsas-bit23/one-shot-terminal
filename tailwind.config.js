/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rh: {
          green: '#00C805',
          dark: '#0A0D10',
          card: '#12161B',
          border: '#1E242C',
        },
      },
    },
  },
  plugins: [],
};
