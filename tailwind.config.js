/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  // 禁用 preflight：Bootstrap 已自带 Reboot 重置，避免 Tailwind base 覆盖 Bootstrap/原项目样式
  // 保证导航菜单、轮播图指示点、搜索按钮等与迁移前完全一致
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // 品牌主色系
        brand: {
          primary: '#005f96',
          'primary-dark': '#003d5c',
          'primary-light': '#0074b0',
          'primary-lighter': '#e8f1f8',
          'primary-soft': '#dce8f3',
          accent: '#c0151c',
          'accent-soft': '#fef0f0',
        },
        // 文字色阶
        text: {
          primary: '#1a2332',
          secondary: '#454545',
          tertiary: '#5a6573',
          muted: '#8a94a3',
          disabled: '#b8c0cc',
          'on-primary': '#ffffff',
        },
        // 背景色阶
        bg: {
          page: '#f5f7fa',
          card: '#ffffff',
          elevated: '#ffffff',
          muted: '#f0f3f7',
          hover: '#f5f7fa',
        },
        // 边框色阶
        border: {
          light: '#f0f3f7',
          base: '#e8ecf0',
          dark: '#d1d9e0',
        },
      },
      fontFamily: {
        base: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"微软雅黑"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['"方正大标宋简体"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.4' }],
        base: ['15px', { lineHeight: '1.75' }],
        md: ['16px', { lineHeight: '1.6' }],
        lg: ['18px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.35' }],
        '3xl': ['28px', { lineHeight: '1.3' }],
        '4xl': ['32px', { lineHeight: '1.25' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
        sm: '0 2px 8px rgba(15, 23, 42, 0.06)',
        md: '0 4px 16px rgba(15, 23, 42, 0.08)',
        lg: '0 8px 24px rgba(15, 23, 42, 0.10)',
        xl: '0 12px 32px rgba(0, 95, 150, 0.14)',
        primary: '0 8px 24px rgba(0, 95, 150, 0.12)',
        hover: '0 12px 28px rgba(0, 95, 150, 0.18)',
      },
      transitionDuration: {
        fast: '200ms',
        base: '250ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      screens: {
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        '2xl': '1400px',
      },
      maxWidth: {
        container: '1280px',
      },
      keyframes: {
        shine: {
          '100%': { left: '125%' },
        },
        dropdownIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shine: 'shine 1s',
        'dropdown-in': 'dropdownIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
