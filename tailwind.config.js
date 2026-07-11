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
        // Uber design system — semantic tokens
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          deep: "rgb(var(--color-primary-deep) / <alpha-value>)",
          foreground: "rgb(var(--color-on-primary) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-on-secondary) / <alpha-value>)",
        },
        background: {
          DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
          canvas: "rgb(var(--color-background-canvas) / <alpha-value>)",
          bone: "rgb(var(--color-background-bone) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          card: "rgb(var(--color-surface-card) / <alpha-value>)",
          dark: "rgb(var(--color-surface-dark) / <alpha-value>)",
          deep: "rgb(var(--color-surface-deep) / <alpha-value>)",
        },
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        body: "rgb(var(--color-body) / <alpha-value>)",
        charcoal: "rgb(var(--color-charcoal) / <alpha-value>)",
        ash: "rgb(var(--color-ash) / <alpha-value>)",
        stone: "rgb(var(--color-stone) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        "on-dark": "rgb(var(--color-on-dark) / <alpha-value>)",
        "on-dark-mute": "var(--color-on-dark-mute)",
        hairline: "rgb(var(--color-hairline) / <alpha-value>)",
        "hairline-strong": "rgb(var(--color-hairline-strong) / <alpha-value>)",
        divider: "rgb(var(--color-divider) / <alpha-value>)",
        link: "rgb(var(--color-link) / <alpha-value>)",
        ring: "var(--color-ring-focus)",
        border: "rgb(var(--color-hairline) / <alpha-value>)",
        input: "rgb(var(--color-hairline-strong) / <alpha-value>)",
        // Status
        success: {
          DEFAULT: "rgb(var(--color-badge-success) / <alpha-value>)",
          foreground: "rgb(var(--color-on-primary) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-badge-warning) / <alpha-value>)",
          foreground: "rgb(var(--color-on-primary) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          foreground: "rgb(var(--color-on-primary) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--color-badge-info) / <alpha-value>)",
          foreground: "rgb(var(--color-on-primary) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "-apple-system", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "Cascadia Code", "JetBrains Mono", "Consolas", "monospace"],
      },
      fontSize: {
        "display-xxl": ["4rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-xl": ["3.25rem", { lineHeight: "1.22", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["2.25rem", { lineHeight: "1.22", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["2rem", { lineHeight: "1.22", letterSpacing: "-0.02em", fontWeight: "700" }],
        "heading-lg": ["2.25rem", { lineHeight: "1.22", letterSpacing: "-0.02em", fontWeight: "700" }],
        "heading-md": ["1.5rem", { lineHeight: "1.22", letterSpacing: "0", fontWeight: "700" }],
        "heading-sm": ["1.25rem", { lineHeight: "1.22", letterSpacing: "0", fontWeight: "700" }],
        "subtitle": ["1.125rem", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "500" }],
        "body-lg": ["1.125rem", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "button-md": ["1rem", { lineHeight: "1", letterSpacing: "0", fontWeight: "500" }],
        "button-sm": ["0.875rem", { lineHeight: "1", letterSpacing: "0", fontWeight: "500" }],
        "caption": ["0.875rem", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "500" }],
      },
      spacing: {
        4.5: "18px",
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        full: "9999px",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
        "elevated": "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        "float": "0 12px 32px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)",
        "press": "inset 0 2px 4px rgba(0,0,0,0.12)",
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
