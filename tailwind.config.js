/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF3A2D', // Paalupiste red
          hover: '#E62E22',
        },
        secondary: {
          DEFAULT: '#005CA9', // Paalupiste blue
          hover: '#004D8A',
        }
      }
    },
  },
  plugins: [],
};