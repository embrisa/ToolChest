/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        // Brand Colors - Modern Tech Palette
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Primary brand color
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },

        // Accent Colors - Electric Purple/Pink
        accent: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef", // Secondary accent
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          950: "#4a044e",
        },

        // Success Colors - Modern Green
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },

        // Warning Colors - Vibrant Orange
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },

        // Error Colors - Modern Red
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },

        // Neutral Colors - Balanced Grays with Enhanced Contrast
        neutral: {
          0: "#ffffff", // Pure white (reserved for highlights)
          25: "#fcfcfc", // Subtle off-white
          50: "#f8f9fa", // Very light background (new primary background)
          100: "#f1f3f4", // Light surfaces
          150: "#e8eaed", // Subtle borders
          200: "#dadce0", // Medium borders, dividers
          250: "#ced4da", // Light borders
          300: "#bdc1c6", // Disabled states
          350: "#adb5bd", // Muted elements
          400: "#9aa0a6", // Placeholder text
          450: "#868e96", // Supporting icons
          500: "#5f6368", // Secondary text (improved contrast)
          550: "#495057", // Emphasized secondary text
          600: "#3c4043", // Primary supporting text
          650: "#343a40", // Strong supporting text
          700: "#202124", // Primary text
          750: "#1a1d20", // High emphasis text
          800: "#171717", // Maximum emphasis
          850: "#121212", // Near black
          900: "#0d0d0d", // Deepest text
          950: "#0a0a0a", // Almost black
          1000: "#000000", // Pure black
        },

        // Semantic Colors
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--background-secondary)",
          tertiary: "var(--background-tertiary)",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          secondary: "var(--foreground-secondary)",
          tertiary: "var(--foreground-tertiary)",
        },
        border: {
          DEFAULT: "var(--border)",
          secondary: "var(--border-secondary)",
        },
        ring: "var(--ring)",

        // Tool-specific colors
        tool: {
          base64: "#0ea5e9",
          hash: "#d946ef",
          favicon: "#22c55e",
          markdown: "#f59e0b",
        },
      },

      fontFamily: {
        sans: [
          "Inter Variable",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono Variable",
          "JetBrains Mono",
          "Fira Code",
          "SF Mono",
          "Monaco",
          "Inconsolata",
          "Roboto Mono",
          "Source Code Pro",
          "Menlo",
          "Consolas",
          "DejaVu Sans Mono",
          "monospace",
        ],
        heading: [
          "Clash Display Variable",
          "Clash Display",
          "Inter Variable",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },

      spacing: {
        4.5: "1.125rem",
        5.5: "1.375rem",
        6.5: "1.625rem",
        7.5: "1.875rem",
        8.5: "2.125rem",
        9.5: "2.375rem",
        13: "3.25rem",
        15: "3.75rem",
        17: "4.25rem",
        18: "4.5rem",
        19: "4.75rem",
        21: "5.25rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
        34: "8.5rem",
        38: "9.5rem",
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },

      boxShadow: {
        soft: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
        medium: "0 4px 12px 0 rgb(0 0 0 / 0.08)",
        large: "0 8px 24px 0 rgb(0 0 0 / 0.12)",
        "extra-large": "0 12px 32px 0 rgb(0 0 0 / 0.16)",
        glow: "0 0 20px rgb(14 165 233 / 0.15)",
        "glow-accent": "0 0 20px rgb(217 70 239 / 0.15)",
        "inner-soft": "inset 0 1px 3px 0 rgb(0 0 0 / 0.05)",
        colored: "0 4px 14px 0 rgb(14 165 233 / 0.15)",
      },

      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "slide-left": "slideLeft 0.4s ease-out",
        "slide-right": "slideRight 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "scale-out": "scaleOut 0.3s ease-out",
        "bounce-gentle": "bounceGentle 0.6s ease-out",
        "pulse-gentle": "pulseGentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        gradient: "gradient 6s ease infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
        bounceGentle: {
          "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
          "40%, 43%": { transform: "translate3d(0,-8px,0)" },
          "70%": { transform: "translate3d(0,-4px,0)" },
          "90%": { transform: "translate3d(0,-2px,0)" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgb(14 165 233 / 0.1)" },
          "100%": { boxShadow: "0 0 30px rgb(14 165 233 / 0.2)" },
        },
      },

      backdropBlur: {
        "4xl": "72px",
      },

      transitionTimingFunction: {
        "bounce-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "bounce-in": "cubic-bezier(0.36, 0, 0.66, -0.56)",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-mesh":
          "radial-gradient(at 40% 20%, rgb(14 165 233 / 0.5) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(217 70 239 / 0.5) 0px, transparent 50%), radial-gradient(at 0% 50%, rgb(34 197 94 / 0.5) 0px, transparent 50%)",
        noise:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    function ({ addUtilities }) {
      addUtilities({
        ".text-balance": {
          "text-wrap": "balance",
        },
        ".text-pretty": {
          "text-wrap": "pretty",
        },
        ".glass": {
          "backdrop-filter": "blur(10px)",
          "background-color": "rgb(255 255 255 / 0.1)",
          border: "1px solid rgb(255 255 255 / 0.2)",
        },
        ".glass-dark": {
          "backdrop-filter": "blur(10px)",
          "background-color": "rgb(0 0 0 / 0.2)",
          border: "1px solid rgb(255 255 255 / 0.1)",
        },
      });
    },
  ],
};
