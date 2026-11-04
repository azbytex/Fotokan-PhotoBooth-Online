import type { Config } from 'tailwindcss';

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        page: token('page'),
        surface: token('surface'),
        line: token('line'),
        fg: token('fg'),
        muted: token('muted'),
        brand: {
          DEFAULT: token('brand'),
          hover: token('brand-hover'),
          text: token('brand-text'),
          soft: token('brand-soft'),
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        flash: {
          '0%': { opacity: '0.95' },
          '100%': { opacity: '0' },
        },
        countdown: {
          '0%': { transform: 'scale(1.3)', opacity: '0' },
          '25%': { transform: 'scale(1)', opacity: '1' },
          '80%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
      },
      animation: {
        flash: 'flash 0.4s ease-out forwards',
        countdown: 'countdown 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
