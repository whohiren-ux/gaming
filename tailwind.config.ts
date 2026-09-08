import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/store/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1440px"
      }
    },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        neon: {
          blue: "#0066FF",
          cyan: "#00D4FF",
          green: "#00FF88",
          amber: "#FFB020",
          red: "#FF0033",
          violet: "#8A7CFF"
        },
        ink: {
          950: "#030508",
          900: "#060A12",
          850: "#0A1020",
          800: "#0E1628",
          700: "#142040"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        "neon-sm": "0 0 20px rgba(0, 102, 255, 0.35)",
        neon: "0 0 36px rgba(0, 102, 255, 0.45), 0 0 72px rgba(255, 0, 51, 0.2)",
        "neon-green": "0 0 22px rgba(0, 255, 136, 0.35)",
        "neon-red": "0 0 20px rgba(255, 0, 51, 0.35)",
        panel: "0 20px 65px rgba(0, 0, 0, 0.45)",
        "gaming-glow": "0 0 40px rgba(0, 102, 255, 0.15), 0 20px 60px rgba(0, 0, 0, 0.5)"
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(0,102,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,.06) 1px, transparent 1px)",
        "radial-neon":
          "radial-gradient(circle at 30% 20%, rgba(0,102,255,.18), transparent 34%), radial-gradient(circle at 80% 0%, rgba(255,0,51,.12), transparent 24%)",
        "gaming-gradient":
          "linear-gradient(135deg, rgba(0,102,255,0.1), rgba(255,0,51,0.05), rgba(0,212,255,0.08))"
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" }
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        scan: "scan 4s linear infinite",
        "pulse-glow": "pulseGlow 2.6s ease-in-out infinite",
        ticker: "ticker 24s linear infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out"
      }
    }
  },
  plugins: [animate]
};

export default config;
