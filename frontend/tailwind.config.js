/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#0e141a',
        'on-background': '#dde3eb',
        'surface-container-high': 'rgba(36, 43, 49, 0.6)',
        'primary': '#adc6ff',
        'primary-container': '#4d8eff',
        'on-surface': '#dde3eb',
        'on-surface-variant': '#c2c6d6',
        'error': '#ffb4ab',
        'outline': '#8c909f',
        'inverse-primary': '#005ac2',
        'secondary-container': '#6f00be',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
