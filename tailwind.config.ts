import type { Config } from 'tailwindcss';

const config: Config = {
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
        background: '#FAF5EE',
        surface: '#FDF9F5',
        'surface-alt': '#F5EDE0',
        border: '#DEC8B0',
        primary: {
          DEFAULT: '#C4845A',
          light: '#DCA882',
          dark: '#A06038',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#6B9458',
          light: '#8BB876',
          dark: '#4E7040',
          foreground: '#FFFFFF',
        },
        nuts: {
          DEFAULT: '#A8784A',
          light: '#C49666',
          dark: '#7A5030',
        },
        muted: {
          DEFAULT: '#C8B098',
          foreground: '#7A5A40',
        },
        ink: {
          DEFAULT: '#3D2010',
          soft: '#5A3A20',
          muted: '#7A5A40',
          faint: '#9A7A5A',
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
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        glow: {
          '0%, 100%': { boxShadow: '0 0 14px rgba(196,132,90,0.3)' },
          '50%': { boxShadow: '0 0 28px rgba(196,132,90,0.55)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
