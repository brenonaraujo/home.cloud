import colors from 'tailwindcss/colors.js'

// bc-ui tokens. Values live as CSS variables in src/style.css (:root);
// see docs/design-kit.md for contrast ratios and usage rules.
const token = (name) => `rgb(var(--bc-${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Lime from the brenon.cloud logo. Text on brand-500 is dark (fg-inverse).
        brand: {
          50: '#f5fbe6',
          100: '#e8f6c8',
          200: '#d2ee96',
          300: '#b4e020',
          400: '#95cf12',
          500: '#76b900',
          600: '#5c9200',
          700: '#476f05',
          800: '#3a580a',
          900: '#31490d',
          950: '#182902'
        },
        info: colors.sky,
        success: colors.emerald,
        warning: colors.amber,
        danger: colors.red,
        surface: {
          DEFAULT: token('surface'),
          raised: token('surface-raised'),
          sunken: token('surface-sunken'),
          overlay: token('surface-overlay')
        },
        line: {
          DEFAULT: 'rgb(var(--bc-line) / 0.1)',
          strong: token('line-strong')
        },
        fg: {
          DEFAULT: token('fg'),
          muted: token('fg-muted'),
          subtle: token('fg-subtle'),
          inverse: token('fg-inverse')
        }
      },
      borderRadius: {
        control: '0.375rem',
        card: '0.5rem',
        overlay: '0.75rem'
      },
      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.08em', fontWeight: '500' }],
        'page-title': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.015em', fontWeight: '600' }],
        'section-title': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }]
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms'
      },
      minHeight: {
        target: '44px'
      },
      minWidth: {
        target: '44px'
      }
    }
  },
  plugins: []
}
