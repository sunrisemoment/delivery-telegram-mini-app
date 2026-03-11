/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Instrument Sans'", "sans-serif"],
      },
      colors: {
        ink: {
          900: "#101828",
        },
        mint: {
          100: "#d9f8ed",
          500: "#14b87a",
          700: "#0b7f54",
        },
        amber: {
          100: "#fff5db",
          500: "#f4a70a",
          700: "#ad6900",
        },
        rose: {
          100: "#ffe4e2",
          500: "#f04438",
          700: "#b42318",
        },
      },
      backgroundImage: {
        "admin-grid":
          "linear-gradient(rgba(16,24,40,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.03) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(20,184,122,0.22), transparent 35%), radial-gradient(circle at 100% 0%, rgba(244,167,10,0.22), transparent 40%)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [],
};
