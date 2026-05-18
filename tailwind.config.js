/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 主品牌色 — 深海蓝
        pine: '#174B63',
        // 强调色 — 灯塔红（仅小面积使用）
        red: '#D92828',
        // 文字色
        ink: '#12323F',
        muted: '#52656D',
        faint: '#829399',
        // 背景色 — 冰川白 / 浅蓝白
        cream: '#F5FAFC',
        aquaCard: '#F0F6FA',
        mint: '#E3EFF5',
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
        softLine: 'rgba(23, 75, 99, 0.10)',
      },
      boxShadow: {
        soft: '0 16px 38px rgba(18, 50, 63, 0.10)',
        card: '0 8px 24px rgba(18, 50, 63, 0.07)',
        shell: '0 24px 70px rgba(18, 50, 63, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
