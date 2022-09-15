/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require("@soundcore/ui/tailwind")
  ],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
      }
    },
  },
  plugins: [],
}