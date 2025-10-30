/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1DB954", // Spotify-style green
        secondary: "#191414", // deep black
        accent: "#FFD700", // gold highlight
        background: "#0f0f0f",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 20px rgba(29, 185, 84, 0.5)"
      },
      animation: {
        fadeIn: "fadeIn 1s ease-in-out",
        pulseGlow: "pulseGlow 2s infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        pulseGlow: {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 20px #1DB954" },
          "50%": { opacity: 0.5, boxShadow: "0 0 10px #1DB954" }
        }
      }
    }
  },
  plugins: []
};
