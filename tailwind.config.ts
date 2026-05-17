import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#16100A',
        surface: '#1F1610',
        'surface-alt': '#2A1D12',
        border: '#3D2B1A',
        primary: {
          DEFAULT: '#C4845A',
          light: '#DCB08A',
          dark: '#A86840',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#7A9E69',
          light: '#9DBE8D',
          dark: '#5C7E50',
          foreground: '#FFFFFF',
        },
        nuts: {
          DEFAULT: '#B8945C',
          light: '#D0AC78',
          dark: '#946C3C',
        },
        muted: {
          DEFAULT: '#5A4535',
          foreground: '#A08878',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 14px rgba(196,132,90,0.35)' },
          '50%': { boxShadow: '0 0 28px rgba(196,132,90,0.65)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
