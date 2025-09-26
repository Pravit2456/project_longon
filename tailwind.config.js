/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'sans-serif'], // font-sans ของ Tailwind ใช้ Prompt
      },
    },
  },
  plugins: [],
}
