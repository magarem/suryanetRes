module.exports = {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary-color)',
        'surface-card': 'var(--surface-card)',
        'surface-section': 'var(--surface-section)',
      }
    },
  },
  plugins: [],
}