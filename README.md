# Nuxt3 迁移目录

基于 Nuxt3 + Vue 3 + Pinia + Bootstrap 5 的服务端渲染版本，由 Vue2 + Bootstrap3 + jQuery 项目迁移而来。

## 技术栈

- Nuxt 3.x（SSR）
- Vue 3.5+（Composition API + `<script setup>`）
- Pinia（替代 Vuex 3）
- Bootstrap 5.3（无 jQuery 依赖）
- @nuxt/image（图片优化 + WebP + 懒加载）
- TypeScript

## 目录结构

```
nuxt3/
├── app.vue                  # 应用根组件
├── nuxt.config.ts           # Nuxt 配置
├── package.json
├── tsconfig.json
├── assets/
│   ├── css/main.scss        # 全局样式
│   └── images/              # 静态图片
├── components/              # 组件（自动导入）
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   └── AppLayout/
├── composables/             # 组合式函数（自动导入）
│   ├── useApi.ts            # API 调用
│   └── useSeo.ts            # SEO / JSON-LD
├── layouts/
│   └── default.vue          # 默认布局
├── middleware/              # 路由中间件
├── pages/                   # 文件系统路由
│   ├── index.vue
│   ├── about.vue
│   ├── channel/[id].vue
│   ├── detail/[id].vue
│   └── 404.vue (对应 [...slug].vue)
├── plugins/                 # Nuxt 插件
│   └── directives.client.ts # 客户端自定义指令
├── public/                  # 静态资源
├── server/                  # Nitro 服务端
├── stores/                  # Pinia stores
│   └── site.ts
└── utils/                   # 工具函数
    └── sanitize.ts
```

## 开发

```bash
npm install
npm run dev
```

## 与原项目对比

| 维度 | 原项目 | Nuxt3 |
|------|--------|-------|
| 渲染 | CSR + puppeteer 预渲染 | SSR（原生） |
| 框架 | Vue 2.6 | Vue 3.5 |
| 路由 | Vue Router 3 手写 | 文件系统自动 |
| 状态 | Vuex 3 | Pinia |
| UI | Bootstrap 3 + jQuery + Element UI 2 | Bootstrap 5（无 jQuery） |
| 图片 | 无优化，12.7MB | @nuxt/image WebP |
| SEO | JS 注入 document | useSeoMeta（SSR 友好） |
