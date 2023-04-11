/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        light: {
          primary: "#116B70",
          secondary: "#703711",
          accent: "#0EB4BD",
          neutral: "#4b5563",
          "base-100": "#1f2937",
          info: "#2FB5BD",
          success: "#36D399",
          warning: "#BD4B00",
          error: "#BD3300",
        },
        dark: {
          primary: "#116B70",
          secondary: "#0EB4BD",
          accent: "#703711",
          neutral: "#F9FAFB",
          "base-100": "#FFFAF0",
          info: "#2FB5BD",
          success: "#36D399",
          warning: "#BD4B00",
          error: "#BD3300",
        },
      },
    ],
  },
  plugins: [
    // require("@tailwindcss/line-clamp"),
    require("daisyui"),
  ],
};
