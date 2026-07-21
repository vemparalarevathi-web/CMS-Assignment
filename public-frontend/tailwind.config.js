/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefdf5',
          100: '#d6fbe6',
          500: '#12b76a',
          600: '#0e9a58',
          700: '#0b7c46'
        }
      }
    }
  },
  plugins: []
};
