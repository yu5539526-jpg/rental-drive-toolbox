/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 主品牌色：清爽蓝青，保持活力与对比度
        pine: '#0B8DB8',
        // 强调色：小面积使用
        red: '#D92828',
        // 文字色
        ink: '#102F3A',
        muted: '#4F6670',
        faint: '#7D969F',
        // 背景色：明亮但不发灰
        cream: '#F3FBFE',
        aquaCard: '#E8F8FD',
        mint: '#D7F2F8',
        // 卡片色
        card: '#FFFFFF',
        lightText: '#FFFFFF',
        // 功能色
        amberSoft: '#FEF0C7',
        amberDark: '#735B16',
        amberWarm: '#F4B66A',
        success: '#52A57C',
        warning: '#E5B85C',
        coral: '#E53935',
        // 边框色
        softLine: 'rgba(11, 141, 184, 0.12)',
        skyLine: 'rgba(14, 165, 214, 0.16)',
      },
      boxShadow: {
        soft: '0 16px 38px rgba(8, 116, 151, 0.12)',
        card: '0 8px 24px rgba(8, 116, 151, 0.08)',
        shell: '0 24px 70px rgba(8, 116, 151, 0.14)',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
