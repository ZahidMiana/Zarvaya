import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E8D5A3",
          dark: "#8B6914",
        },
        cream: {
          DEFAULT: "#FAF8F5",
          dark: "#F0EDE8",
        },
        charcoal: {
          DEFAULT: "#1A1A1A",
          light: "#2D2D2D",
        },
        rose: "#D4A5A5",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
        marquee: "marquee 20s linear infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;