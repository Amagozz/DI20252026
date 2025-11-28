/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  safelist: [
    { pattern: /(bg|text|border)-(sky|emerald|fuchsia)-(100|400|600|700)/ },
    { pattern: /focus:ring-(sky|emerald|fuchsia)-400/ }
  ],
  theme: { extend: {} },
  plugins: [],
};
