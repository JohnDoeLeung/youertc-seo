// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // 全局 CSS：Bootstrap 5 + 原项目迁移样式 + 站点自定义样式（无 jQuery 依赖）
  // 顺序：Bootstrap 基础 → 原项目公共样式 → 首页样式 → 内页样式 → 自定义覆盖
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '~/assets/css/public.css',
    '~/assets/css/home.css',
    '~/assets/css/page.css',
    '~/assets/css/main.scss'
  ],

  modules: [
    '@pinia/nuxt'
  ],

  // SSR 必开（核心目标）
  ssr: true,

  // 运行时配置：API 地址等环境变量
  runtimeConfig: {
    public: {
      apiBase: 'https://www.yousertc.com/api',
      siteUrl: 'https://www.yousertc.com',
      siteId: 5
    }
  },

  // 应用元信息（HTML 模板基础 head）
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'robots', content: 'index, follow' },
        { name: 'language', content: 'zh-CN' },
        { name: 'revisit-after', content: '7 days' }
      ]
    }
  },

  // Pinia 配置
  pinia: {
    storesDirs: ['./stores/**']
  },

  // 组件自动导入
  components: [
    { path: '~/components', pathPrefix: false }
  ],

  // 编译优化
  vite: {
    server: {
      allowedHosts: true
    }
  },

  typescript: {
    strict: true,
    shim: false
  }
})
