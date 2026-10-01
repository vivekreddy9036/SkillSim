/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        base: {
          950: "#06080e",
          900: "#0a0e17",
          850: "#0f1422",
          800: "#151b2e",
          750: "#1a2238",
          700: "#222c47",
          600: "#334155",
        },
        brand: {
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        // Theme-reactive tokens: each resolves through a CSS custom property that
        // flips value under `:root[data-theme="light"]` (see index.css) — swapping
        // theme never needs a className change, just the data-theme attribute.
        surface: {
          0: "rgb(var(--surface-0) / <alpha-value>)",
          alt: "rgb(var(--surface-0-alt) / <alpha-value>)",
          1: "rgb(var(--surface-1) / <alpha-value>)",
          2: "rgb(var(--surface-2) / <alpha-value>)",
          3: "rgb(var(--surface-3) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          2: "rgb(var(--ink-2) / <alpha-value>)",
          dim: "rgb(var(--ink-dim) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
        },
        line: "rgb(var(--line) / <alpha-value>)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(59 130 246 / 0.25), 0 4px 20px -2px rgb(59 130 246 / 0.15)",
        glowSuccess: "0 0 0 1px rgb(16 185 129 / 0.3), 0 4px 20px -2px rgb(16 185 129 / 0.2)",
        card: "0 1px 0 0 rgb(var(--shadow-inset) / 0.05) inset, 0 4px 20px -4px rgb(0 0 0 / var(--shadow-depth))",
        cardHover: "0 1px 0 0 rgb(var(--shadow-inset) / 0.08) inset, 0 12px 32px -8px rgb(0 0 0 / var(--shadow-depth))",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 90% 40% at 50% -10%, rgb(59 130 246 / 0.12), transparent 70%), linear-gradient(to bottom, rgb(var(--surface-0)), rgb(var(--surface-0-alt)))",
        "subtle-card":
          "linear-gradient(180deg, rgb(var(--shadow-inset) / 0.03) 0%, rgb(var(--shadow-inset) / 0.01) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
