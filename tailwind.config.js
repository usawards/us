/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B1F3A', 2: '#122c52' },
        paper: { DEFAULT: '#F7F5EF', 2: '#EFEBE0' },
        gold: { DEFAULT: '#C9A15A', light: '#E4C98A' },
        red: { DEFAULT: '#A32638', dark: '#8a1f2e' },
        ink: '#101418',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
