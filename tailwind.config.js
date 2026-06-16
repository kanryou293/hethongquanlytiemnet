/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-dark': '#0a0e14',
        'cyber-card': '#111827',
        'cyber-border': '#1f2937',
        'cyber-green': '#00ff88',
        'cyber-blue': '#00b4ff',
        'cyber-red': '#ff3d5a',
        'cyber-amber': '#ffaa00',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
