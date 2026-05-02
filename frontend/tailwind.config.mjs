/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // KernelLearn Design System (DESIGN.md compliant)
        // The Void (Surfaces & Backgrounds)
        'background': '#09090b',
        'on-background': '#fafafa',
        'surface-container-high': '#18181b',
        'on-surface': '#fafafa',
        'on-surface-variant': '#a1a1aa',

        // The Neon (Brand & Interaction)
        'primary': '#06b6d4',
        'primary-container': '#06b6d4',
        'on-primary-container': '#06b6d4',

        // Semantic/State Colors
        'error': '#f43f5e',
        'success': '#10b981',
        'warning': '#f59e0b',

        // Override inverse & secondary to match
        'outline': '#a1a1aa',
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
