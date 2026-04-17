/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* shadcn-compatible */
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
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* Sirocco-inspired palette (with dark mode via CSS vars) */
        sand: {
          DEFAULT: 'var(--tw-sand, #F5EDE0)',
          dark: 'var(--tw-sand-dark, #E8DCC8)',
          medium: 'var(--tw-sand-medium, #D9CCBA)',
        },
        terracotta: {
          DEFAULT: '#C4572A',
          light: '#D4714A',
          dark: '#A04520',
        },
        gold: {
          DEFAULT: '#D4A853',
          light: '#E8D5B0',
          dark: '#B8903F',
        },
        brown: {
          DEFAULT: 'var(--tw-brown, #2C1810)',
          medium: 'var(--tw-brown-medium, #5C4033)',
          light: '#8B6F4E',
        },
        night: {
          DEFAULT: 'var(--tw-night, #0A0F1E)',
          light: 'var(--tw-night-light, #141B2D)',
          medium: 'var(--tw-night-medium, #1E2640)',
        },
        cream: {
          DEFAULT: 'var(--tw-cream, #F0E6D6)',
          muted: 'rgba(240, 230, 214, 0.6)',
        },
      },
      fontFamily: {
        display: ["var(--tenant-font-display)", 'serif'],
        body: ["var(--tenant-font-body)", 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        'scroll-pulse': {
          '0%, 100%': { transform: 'scaleY(0.3)', opacity: '0.3' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
        'border-spin': {
          to: { '--border-angle': '360deg' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        'scroll-pulse': 'scroll-pulse 2s ease-in-out infinite',
        'border-spin': 'border-spin 4s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
    },
  },
  plugins: [],
}
