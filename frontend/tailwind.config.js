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
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(59 130 246 / 0.25), 0 4px 20px -2px rgb(59 130 246 / 0.15)",
        glowSuccess: "0 0 0 1px rgb(16 185 129 / 0.3), 0 4px 20px -2px rgb(16 185 129 / 0.2)",
        card: "0 1px 0 0 rgb(255 255 255 / 0.05) inset, 0 4px 20px -4px rgb(0 0 0 / 0.6)",
        cardHover: "0 1px 0 0 rgb(255 255 255 / 0.08) inset, 0 12px 32px -8px rgb(0 0 0 / 0.7)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 90% 40% at 50% -10%, rgb(59 130 246 / 0.12), transparent 70%), linear-gradient(to bottom, #06080e, #0a0e17)",
        "subtle-card":
          "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
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
