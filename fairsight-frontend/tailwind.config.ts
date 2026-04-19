import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Brand Colors (Section 3.2)
        brand: {
          blue: "#2563EB",
          dark: "#1E3A8A",
          light: "#DBEAFE",
        },
        accent: {
          purple: "#7C3AED",
          "purple-light": "#EDE9FE",
        },
        success: {
          DEFAULT: "#059669",
          light: "#D1FAE5",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        surface: {
          gray: "#F9FAFB",
          card: "#F3F4F6",
        },
        text: {
          primary: "#111827",
          secondary: "#4B5563",
          tertiary: "#6B7280",
          muted: "#9CA3AF",
        },
        // shadcn/ui design tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],       // 32px — H1
        "heading-2": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],   // 24px — H2
        "heading-3": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }], // 18px — H3
        "body": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }],      // 14px — Body
        "data-label": ["0.8125rem", { lineHeight: "1.4", fontWeight: "500" }], // 13px — Labels
        "data-value": ["1.75rem", { lineHeight: "1.2", fontWeight: "700" }], // 28px — Big numbers
        "code": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],     // 13px — Code
        "caption": ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],    // 12px — Captions
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(37, 99, 235, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(37, 99, 235, 0)" },
        },
        "metric-count": {
          from: { opacity: "0", transform: "scale(0.5)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s infinite",
        "metric-count": "metric-count 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
