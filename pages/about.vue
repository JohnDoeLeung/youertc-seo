<template>
  <div>
    <div class="is-main" role="main">
      <div class="container">
        <!-- 面包屑 -->
        <nav class="m-location f-mb10" aria-label="面包屑导航">
          <span>当前位置：</span>
          <NuxtLink to="/" target="_blank">网站首页</NuxtLink> &gt;
          <a aria-current="page">联系我们</a>
        </nav>

        <article class="about-card">
          <header class="about-header">
            <h1 class="about-title">{{ siteInfo.name }}</h1>
            <div class="about-divider" />
          </header>

          <div class="about-body">
            <div
              v-if="sanitizedDetail"
              class="article-content"
              v-html="sanitizedDetail"
            />
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sanitize } from '~/utils/sanitize'

const config = useRuntimeConfig()
const store = useSiteStore()
const siteInfo = computed(() => store.siteInfo)

// 文章正文消毒（SSR 兼容）
const sanitizedDetail = computed(() => sanitize(siteInfo.value.detail || ''))

// SEO
useSeo({
  title: '联系我们 - 陕西有色驼城建设有限公司',
  description: siteInfo.value.description || '陕西有色驼城建设有限公司联系方式',
  keywords: '联系我们,陕西有色驼城建设有限公司',
  url: `${config.public.siteUrl}/about`,
  type: 'website'
})

useBreadcrumbJsonLd([
  { name: '首页', url: config.public.siteUrl as string },
  { name: '联系我们', url: `${config.public.siteUrl}/about` }
])

// 确保站点信息已初始化（替代原 sessionStorage 读取）
await useAsyncData('about-init', async () => {
  if (!store.siteInfo.name) {
    await store.initSiteData()
  }
  return store.siteInfo
})
</script>

<style scoped lang="scss">
.about-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.about-card:hover {
  box-shadow: var(--shadow-md);
}

.about-header {
  padding: 40px 40px 24px;
  text-align: center;
  background: linear-gradient(135deg, var(--brand-primary-lighter) 0%, #f5f9fc 100%);
  border-bottom: 1px solid var(--border-light);
}

.about-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
  line-height: 1.4;
}

.about-divider {
  display: inline-block;
  width: 60px;
  height: 3px;
  background: var(--brand-primary);
  border-radius: 2px;
}

.about-body {
  padding: 32px 40px 40px;
}

.article-content {
  line-height: 1.8;
  font-size: 16px;
  color: var(--text-secondary);
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  margin: 12px 0;
}

.article-content :deep(p) {
  margin: 16px 0;
  line-height: 1.8;
}

.article-content :deep(table) {
  border-collapse: collapse;
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin: 16px 0;
}

.article-content :deep(td),
.article-content :deep(th) {
  border: 1px solid var(--border-dark);
  padding: 10px 14px;
}

/* 响应式 */
@media (max-width: 767px) {
  .about-header {
    padding: 28px 20px 20px;
  }

  .about-title {
    font-size: 22px;
  }

  .about-body {
    padding: 24px 20px 28px;
  }

  .article-content {
    font-size: 15px;
  }
}
</style>
