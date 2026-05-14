/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pine: '#1e6f67',
        ink: '#183e4d',
        mint: '#eef8f4',
        cream: '#fff8ed',
        amberSoft: '#fff2da',
        coral: '#ef6f61',
        skySoft: '#e8f4ff',
      },
      boxShadow: {
        soft: '0 18px 42px rgba(24, 62, 77, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
