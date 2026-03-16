/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        qgo: {
          blue: 'var(--color-primary, #0D5C9E)',
          cyan: 'var(--color-secondary, #90CCE0)',
          navy: 'var(--color-navy, #083D6E)',
          bg: 'var(--color-bg, #EAF4FA)',
          text: 'var(--color-text, #1A2B3C)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
