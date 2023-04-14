/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [{
      "light": {
        "primary": "#C0000D",
        "secondary": "#765652",
        "accent": "#715B2E",
        "neutral": "#FFFBFF",
        "base-100": "#FFF8F7",
        "info": "#3ABFF8",
        "success": "#36D399",
        "warning": "#FBBD23",
        "error": "#BA1A1A",
      },
      "dark": {
        "primary": "#FFB5AA",    
        "secondary": "#E7BDB7",        
        "accent": "#DEC38C",       
        "neutral": "#201A19",        
        "base-100": "#181211",         
        "info": "#3ABFF8",
        "success": "#36D399",
        "warning": "#FBBD23",
        "error": "#FFB5AB",
      },

    }],
  },
  plugins: [
    require("daisyui"),
  ],
};
