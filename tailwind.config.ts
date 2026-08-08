import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/shared/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        femtrex: {
          navy: "#090315",
          panel: "#12091f",
          elevated: "#1b1030",
          line: "#2a1745",
          violet: "#8b3cff",
          pink: "#ef4ca6",
          blue: "#5d6df6",
          mint: "#10d39b",
          amber: "#ffb21a",
          text: "#f7f2ff",
          soft: "#a896cf"
        }
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "1.75rem"
      },
      boxShadow: {
        glow: "0 0 32px rgba(139, 60, 255, 0.24)",
        pink: "0 18px 60px rgba(239, 76, 166, 0.24)",
        panel: "0 24px 90px rgba(0, 0, 0, 0.32)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        shimmer: "shimmer 1.6s infinite"
      }
    }
  },
  plugins: []
};

export default config;
