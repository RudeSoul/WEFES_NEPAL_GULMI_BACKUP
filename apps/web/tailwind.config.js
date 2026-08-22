/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wefes: {
          water: '#0284c7', // Sky blue
          energy: '#eab308', // Amber/Yellow
          food: '#16a34a', // Emerald Green
          ecosystem: '#059669', // Teal Green
          socio: '#8b5cf6', // Violet/Purple
          dark: '#0f172a',
          card: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
