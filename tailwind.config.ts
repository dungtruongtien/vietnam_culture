import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vn-red':       '#C8102E',
        'vn-red-dark':  '#8E0A1F',
        'vn-yellow':    '#FFCD00',
        'vn-gold':      '#C9A24C',
        'vn-gold-lt':   '#DEC07F',
        'vn-jade':      '#2E7D5A',
        'vn-jade-dk':   '#1F5B40',
        'vn-ivory':     '#FBF8F1',
        'vn-sand':      '#EDE3CC',
        'vn-mist':      '#D9D3C5',
        'vn-fog':       '#E9E6DE',
        'vn-stone':     '#6E6A60',
        'vn-charcoal':  '#3A3833',
        'vn-ink':       '#1B1B1A',
        // legacy aliases kept for any remaining references
        'heritage-forest':  '#1B3A2D',
        'heritage-green':   '#2E7D5A',
        'heritage-amber':   '#C9A24C',
        'heritage-cream':   '#FBF8F1',
        'heritage-border':  '#D9D3C5',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body:    ['var(--font-body)',    'system-ui', 'sans-serif'],
        sans:    ['var(--font-body)',    'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
