/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'cool': '8px 8px 16px #d1d9e6, -8px -8px 16px #f9f9f9',
      }
    },
  },
  plugins: [],
}
