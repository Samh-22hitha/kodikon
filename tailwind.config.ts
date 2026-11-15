import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.tsx", "./components/**/*.tsx", "./lib/**/*.ts"],
  theme: { extend: {
    colors: { navy: "#080B18", deep: "#10182B", glass: "#182238", cyan: "#00D9FF", violet: "#8B5CF6", ok: "#10B981", ink: "#F8FAFC" },
    fontFamily: {
      sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      display: ["var(--font-space)", "system-ui", "sans-serif"],
      num: ["var(--font-num)", "system-ui", "sans-serif"],
    },
  } },
  plugins: [] } satisfies Config;
