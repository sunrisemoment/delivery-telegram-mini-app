/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2faf7",
          100: "#d8f2e8",
          400: "#2ebd85",
          600: "#0f8f61",
          900: "#0b3f31",
        },
        peach: {
          100: "#fff0e5",
          400: "#ff9f5a",
          700: "#cc5f1d",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at 10% 10%, rgba(46,189,133,0.25), transparent 40%), radial-gradient(circle at 90% 0%, rgba(255,159,90,0.3), transparent 40%), linear-gradient(160deg, #f7fff9 0%, #eef8ff 100%)",
      },
    },
  },
  plugins: [],
};
