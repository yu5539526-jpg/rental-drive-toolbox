/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pine: '#2F6B5F',
        ink: '#1F2D2A',
        muted: '#6B7C78',
        mint: '#EAF4EF',
        cream: '#F8F5EC',
        amberSoft: '#F6E7B8',
        coral: '#D96B5F',
        card: '#FFFFFF',
        softLine: 'rgba(47, 107, 95, 0.12)',
      },
      boxShadow: {
        soft: '0 18px 42px rgba(31, 45, 42, 0.12)',
        card: '0 12px 30px rgba(31, 45, 42, 0.08)',
        shell: '0 24px 70px rgba(31, 45, 42, 0.18)',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
