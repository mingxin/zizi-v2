import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand — ui_design_spec.md Section 1
        'primary':         '#eecd2b',
        'primary-orange':  '#f59e0b',
        // Backgrounds
        'bg-light':        '#f8f8f6',
        'bg-dark':         '#221f10',
        // Surfaces
        'surface':         '#ffffff',
        'surface-tinted':  '#fef9c3',
        // Semantic
        'error':           '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        // ui_design_spec.md Section 2
        display: ['Be Vietnam Pro', 'Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        // ui_design_spec.md Section 3
        DEFAULT: '1rem',
        lg:      '2rem',
        xl:      '3rem',
        full:    '9999px',
      },
      boxShadow: {
        // ui_design_spec.md Section 4
        'bubbly':     '0 10px 25px -5px rgba(238,205,43,0.4), 0 8px 10px -6px rgba(238,205,43,0.2)',
        'bubbly-sm':  '0 4px 10px -2px rgba(238,205,43,0.5)',
        'float':      '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)',
      },
    },
  },
  plugins: [],
} satisfies Config
