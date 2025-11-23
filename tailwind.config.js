/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        shake: "shake 0.4s ease-in-out",

        // ⭐ NUEVOS LOADER ANIMATIONS
        logoPulse: "logoPulse 1.6s ease-in-out infinite",
        logoGlow: "logoGlow 1.6s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },

        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-3px)" },
          "40%": { transform: "translateX(3px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },

        // ⭐ KEYFRAMES CORRECTOS PARA EL LOADER
        logoPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },

        logoGlow: {
          "0%, 100%": { opacity: 0.25 },
          "50%": { opacity: 0.6 },
        },
      },
    },
  },
  plugins: [],
}
