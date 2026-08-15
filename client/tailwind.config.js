/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vcet: {
          maroon: '#7A0000',
          darkMaroon: '#500000',
          navy: '#0F172A',
          gold: '#D97706',
          amber: '#F59E0B',
          surface: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
