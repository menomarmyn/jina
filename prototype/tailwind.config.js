/** Цвета ссылаются на CSS-переменные из src/styles/tokens.css — при приходе Figma меняем только их */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        'accent-soft': 'var(--accent-soft)',
        gold: 'var(--gold)',
        'gold-soft': 'var(--gold-soft)',
        positive: 'var(--positive)',
        negative: 'var(--negative)',
        'negative-soft': 'var(--negative-soft)',
        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
      },
      borderRadius: { s: 'var(--radius-s)', m: 'var(--radius-m)', l: 'var(--radius-l)' },
      boxShadow: { card: 'var(--shadow-card)' },
      fontFamily: { sans: 'var(--font-sans)' },
    },
  },
  plugins: [],
};
