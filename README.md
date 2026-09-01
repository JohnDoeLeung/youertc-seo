# Nuxt3 迁移目录

基于 Nuxt3 + Vue 3 + Pinia + Tailwind CSS 的服务端渲染版本，由 Vue2 + Bootstrap3 + jQuery 项目迁移而来。

## 技术栈

- Nuxt 3.x（SSR）
- Vue 3.5+（Composition API + `<script setup>`）
- Pinia（替代 Vuex 3）
- Tailwind CSS 3.4（含 Bootstrap 兼容层，无 jQuery 依赖）
- TypeScript
- SCSS
- DOMPurify（HTML 净化）

## 样式架构

项目已从 Bootstrap CSS 迁移至 Tailwind CSS，保持原有视觉效果完全一致：

- `tailwind.css`：Tailwind 指令 + Bootstrap 兼容层（用纯 CSS 重新实现项目用到的 Bootstrap 类：container、栅格、navbar、collapse 等）
- `public.css`：原项目公共样式（reset、布局工具类、模块样式）
- `home.css`：首页样式
- `page.css`：内页样式
- `main.scss`：设计令牌（CSS 变量）+ 响应式 mixin + 全局排版
- `tailwind.config.js`：Tailwind 配置（自定义颜色、间距、断点等，禁用 preflight 避免覆盖原项目 reset）

CSS 引入顺序（`nuxt.config.ts`）：tailwind.css → public.css → home.css → page.css → main.scss

## 目录结构

```
nuxt3/
├── app.vue                  # 应用根组件（JSON-LD 结构化数据）
├── nuxt.config.ts           # Nuxt 配置
├── tailwind.config.js       # Tailwind 配置
├── package.json
├── tsconfig.json
├── assets/
│   ├── css/
│   │   ├── tailwind.css     # Tailwind 指令 + Bootstrap 兼容层
│   │   ├── public.css       # 公共样式（reset + 工具类 + 模块）
│   │   ├── home.css         # 首页样式
│   │   ├── page.css         # 内页样式
│   │   ├── main.scss        # 设计令牌 + mixin + 全局排版
│   │   └── 方正大标宋简体.*  # 自定义字体
│   └── images/              # 静态图片
├── components/              # 组件（自动导入）
│   ├── AppHeader.vue        # 顶部导航（PC + 移动端抽屉）
│   ├── AppFooter.vue        # 页脚
│   └── BackToTop.vue        # 返回顶部
├── composables/             # 组合式函数（自动导入）
│   ├── useApi.ts            # API 调用
│   └── useSeo.ts            # SEO / JSON-LD
├── layouts/
│   └── default.vue          # 默认布局
├── pages/                   # 文件系统路由
│   ├── index.vue            # 首页
│   ├── about.vue            # 联系我们
│   ├── search.vue           # 站内搜索
│   ├── channel/[id].vue     # 栏目页
│   ├── detail/[id].vue      # 文章详情页
│   ├── 404.vue              # 404 页面
│   └── [...slug].vue        # 兜底路由
├── plugins/
│   ├── init-site.ts         # 站点数据初始化（SSR）
│   └── directives.client.ts # 客户端自定义指令
├── server/                  # Nitro 服务端
│   ├── api/search.ts        # 搜索 API
│   └── routes/sitemap.xml.ts # sitemap 生成
├── stores/
│   └── site.ts              # 站点状态（siteInfo + cateList）
├── public/                  # 静态资源
│   ├── favicon.ico
│   ├── logo.png
│   ├── og-image.jpg
│   └── robots.txt
└── utils/
    ├── index.ts             # 通用工具
    └── sanitize.ts          # HTML 净化
```

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build      # 生产构建
npm run generate   # 静态生成
npm run preview    # 预览生产构建
```

## 与原项目对比

| 维度 | 原项目 | Nuxt3 |
|------|--------|-------|
| 渲染 | CSR + puppeteer 预渲染 | SSR（原生） |
| 框架 | Vue 2.6 | Vue 3.5 |
| 路由 | Vue Router 3 手写 | 文件系统自动 |
| 状态 | Vuex 3 | Pinia |
| 样式 | Bootstrap 3 + jQuery | Tailwind CSS（含 Bootstrap 兼容层） |
| SEO | JS 注入 document | useSeoMeta（SSR 友好） |
| 类型 | JavaScript | TypeScript |
