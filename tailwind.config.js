/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pine: '#2F7A6D',
        ink: '#18322D',
        muted: '#667B75',
        mint: '#DDEFEA',
        aquaCard: '#F2F7F5',
        cream: '#F6F8F5',
        lightText: '#F8FCFA',
        amberSoft: '#F5D98B',
        amberWarm: '#F4B66A',
        success: '#52A57C',
        warning: '#E5B85C',
        coral: '#D86F6A',
        card: '#FFFFFF',
        softLine: 'rgba(47, 122, 109, 0.12)',
      },
      boxShadow: {
        soft: '0 16px 38px rgba(34, 82, 71, 0.12)',
        card: '0 8px 24px rgba(34, 82, 71, 0.08)',
        shell: '0 24px 70px rgba(34, 82, 71, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
