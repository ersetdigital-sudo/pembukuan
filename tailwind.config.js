/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise design system — semantic tokens
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)",
        },
        plugin: {
          DEFAULT: "rgb(var(--color-plugin) / <alpha-value>)",
          foreground: "rgb(var(--color-plugin-foreground) / <alpha-value>)",
          soft: "rgb(var(--color-plugin-soft) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          2: "rgb(var(--color-surface-2) / <alpha-value>)",
        },
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          foreground: "rgb(var(--color-success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          foreground: "rgb(var(--color-warning-foreground) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          foreground: "rgb(var(--color-danger-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-ubuntu)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-oswald)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-ubuntu-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "0.75rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(7 44 44 / 0.04), 0 1px 3px 0 rgb(7 44 44 / 0.06)",
        "card-hover": "0 4px 8px -2px rgb(7 44 44 / 0.08), 0 2px 4px -2px rgb(7 44 44 / 0.06)",
        sidebar: "0 1px 0 0 rgb(255 255 255 / 0.05) inset",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-scale": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-from-right": {
          "0%": { opacity: "0", transform: "translateX(calc(100% + 24px))" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-from-top": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "fade-scale": "fade-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-from-right":
          "slide-from-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-from-top": "slide-from-top 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

