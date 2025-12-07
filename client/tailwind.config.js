/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        comfortaa: ["Comfortaa", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        grotesk: ["Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [],
}
