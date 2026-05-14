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
            blue: "#00A3FF",
            cyan: "#38E8FF",
            green: "#2BFF88",
            amber: "#00A3FF",
            red: "#FF4D6D",
            violet: "#8A7CFF"
          },
          ink: {
            950: "#030508",
            900: "#070A10",
            850: "#0A1018",
            800: "#0E1622"
          }
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)"
        },
        boxShadow: {
          "neon-sm": "0 0 16px rgba(0, 163, 255, 0.32)",
          neon: "0 0 28px rgba(0, 163, 255, 0.42)",
          "neon-green": "0 0 22px rgba(43, 255, 136, 0.35)",
          panel: "0 18px 60px rgba(0, 0, 0, 0.32)"
        },
        backgroundImage: {
          "grid-fade":
            "linear-gradient(rgba(0,163,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,163,255,.12) 1px, transparent 1px)",
          "radial-neon":
            "radial-gradient(circle at 30% 20%, rgba(0,163,255,.22), transparent 34%), radial-gradient(circle at 80% 0%, rgba(56,232,255,.14), transparent 24%)"
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
          }
        },
        animation: {
          scan: "scan 4s linear infinite",
          "pulse-glow": "pulseGlow 2.6s ease-in-out infinite",
          ticker: "ticker 24s linear infinite"
        }
      }
    },
    plugins: [animate]
  };

  export default config;
