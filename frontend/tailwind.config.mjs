/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#09090b',
        'on-background': '#fafafa',
        'surface-container-high': '#18181b',
        'on-surface': '#fafafa',
        'on-surface-variant': '#a1a1aa',
        'primary': '#06b6d4',
        'primary-container': '#06b6d4',
        'on-primary-container': '#06b6d4',
        'error': '#f43f5e',
        'success': '#10b981',
        'warning': '#f59e0b',
        'outline': '#3f3f46',
        'inverse-primary': '#0891b2',
        'secondary-container': '#8b5cf6',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
