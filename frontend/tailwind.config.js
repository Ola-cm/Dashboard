/** @type {import('tailwindcss').Config} */

// Every shade below resolves through a CSS custom property (defined in src/index.css for
// :root and redefined under [data-theme="dark"]), instead of a fixed hex value. That's what
// lets the whole app re-theme by flipping one attribute on <html> instead of adding a `dark:`
// variant to every one of the ~40 files that already use these class names.
function themedColor(name) {
  return `rgb(var(--color-${name}) / <alpha-value>)`;
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: themedColor('cream'), dark: themedColor('cream-dark') },
        card: { DEFAULT: themedColor('card'), 2: themedColor('card-2') },
        brown: {
          50: themedColor('brown-50'),
          100: themedColor('brown-100'),
          200: themedColor('brown-200'),
          300: themedColor('brown-300'),
          400: themedColor('brown-400'),
          500: themedColor('brown-500'),
          600: themedColor('brown-600'),
          700: themedColor('brown-700'),
          800: themedColor('brown-800'),
          900: themedColor('brown-900'),
        },
        terracotta: {
          DEFAULT: themedColor('terracotta'),
          light: themedColor('terracotta-light'),
          pale: themedColor('terracotta-pale'),
        },
        olive: {
          DEFAULT: themedColor('olive'),
          light: themedColor('olive-light'),
          pale: themedColor('olive-pale'),
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        ui: ['"DM Sans"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
