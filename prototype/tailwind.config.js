/** Токены JINA v3 (docs/08-jina-v3.md §4). Цвета — CSS-переменные из src/styles/tokens.css */
export default {
  content: ['./index.html', './app.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        sky: 'var(--sky)',
        'sky-ink': 'var(--sky-ink)',
        'sky-soft': 'var(--sky-soft)',
        sun: 'var(--sun)',
        'sun-ink': 'var(--sun-ink)',
        'sun-soft': 'var(--sun-soft)',
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        mist: 'var(--mist)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        'warn-soft': 'var(--warn-soft)',
      },
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        sans: ['Onest', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: { field: '16px', hero: '28px' },
    },
  },
  plugins: [],
};
