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
        // Sanity design system — semantic tokens
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)",
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
        mute: "rgb(var(--color-mute) / <alpha-value>)",
        ash: "rgb(var(--color-ash) / <alpha-value>)",
        stone: "rgb(var(--color-stone) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        "on-secondary": "rgb(var(--color-on-secondary) / <alpha-value>)",
        "on-dark": "rgb(var(--color-on-dark) / <alpha-value>)",
        "on-dark-mute": "rgb(var(--color-on-dark-mute) / <alpha-value>)",
        hairline: "rgb(var(--color-hairline) / <alpha-value>)",
        "hairline-strong": "rgb(var(--color-hairline-strong) / <alpha-value>)",
        divider: "rgb(var(--color-divider) / <alpha-value>)",
        link: "rgb(var(--color-link) / <alpha-value>)",
        ring: "var(--color-ring-focus)",
        border: "rgb(var(--color-hairline) / <alpha-value>)",
        input: "rgb(var(--color-surface-dark) / <alpha-value>)",
        // Status
        success: {
          DEFAULT: "rgb(var(--color-badge-success) / <alpha-value>)",
          foreground: "rgb(var(--color-on-dark) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-badge-warning) / <alpha-value>)",
          foreground: "rgb(var(--color-on-dark) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          foreground: "rgb(var(--color-on-dark) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--color-badge-info) / <alpha-value>)",
          foreground: "rgb(var(--color-on-dark) / <alpha-value>)",
        },
        // Hero gradient
        "hero-warm": "var(--color-hero-warm)",
        "hero-glow": "var(--color-hero-glow)",
        "hero-pink": "var(--color-hero-pink)",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["80px", { lineHeight: "1", letterSpacing: "-3.6px", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "1.08", letterSpacing: "-1.68px", fontWeight: "600" }],
        "heading-lg": ["38px", { lineHeight: "1.10", letterSpacing: "-1.14px", fontWeight: "600" }],
        "heading-md": ["24px", { lineHeight: "1.24", letterSpacing: "-0.24px", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "1.50", letterSpacing: "-0.18px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.50", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["15px", { lineHeight: "1.50", letterSpacing: "0", fontWeight: "400" }],
        "button-md": ["16px", { lineHeight: "1", letterSpacing: "0", fontWeight: "600" }],
        "button-sm": ["11px", { lineHeight: "1", letterSpacing: "0.5px", fontWeight: "600" }],
        caption: ["13px", { lineHeight: "1.50", letterSpacing: "-0.13px", fontWeight: "400" }],
        "code-md": ["15px", { lineHeight: "1.50", letterSpacing: "0", fontWeight: "400" }],
        "code-sm": ["13px", { lineHeight: "1.50", letterSpacing: "0", fontWeight: "500" }],
      },
      spacing: {
        "sanity-xxs": "2px",
        "sanity-xs": "4px",
        "sanity-sm": "8px",
        "sanity-md": "12px",
        "sanity-lg": "16px",
        "sanity-xl": "24px",
        "sanity-xxl": "32px",
        "sanity-xxxl": "48px",
        "sanity-section": "96px",
        "sanity-band": "120px",
      },
      borderRadius: {
        xs: "3px",
        sm: "5px",
        md: "6px",
        lg: "12px",
        full: "99999px",
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
