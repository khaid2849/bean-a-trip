import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", ...fontFamily.sans],
      },
      colors: {
        terracotta: {
          DEFAULT: '#C0533A',
          mid: '#D97A62',
          lt: '#F2C4B3',
          dk: '#7A2A15',
        },
        matcha: {
          DEFAULT: '#4A6741',
          mid: '#7A9E72',
          lt: '#C2D9BC',
          dk: '#2E4C28',
        },
        fuji: {
          DEFAULT: '#8B6B8A',
          mid: '#B89EB7',
          lt: '#E8D9E7',
          dk: '#5A3A59',
        },
        kincha: {
          DEFAULT: '#C48A3F',
          mid: '#DEB06A',
          lt: '#F5DFB8',
          dk: '#7A4E10',
        },
        asagi: {
          DEFAULT: '#4E7A8F',
          mid: '#7DAFC4',
          lt: '#C2DCEA',
          dk: '#254D5E',
        },
        washi: {
          50: '#F7F4EF',
          100: '#EDE8DF',
          200: '#E4DDD2',
          400: '#9E8E7A',
          600: '#6B5E4E',
          800: '#2C2318',
        },
        sumi: {
          50: '#332E28',
          100: '#282420',
          200: '#1C1A17',
          400: '#131210',
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
