<template>
  <NuxtLoadingIndicator
    color="#005f96"
    :height="3"
    :duration="3000"
    :throttle="200"
  />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// 应用根组件：仅承载 Layout 与 Page，路由由 Nuxt 自动处理
// 全局 SEO（Organization / WebSite / WebApplication 结构化数据）在此注入，所有页面共享
const config = useRuntimeConfig()

useHead({
  htmlAttrs: { lang: 'zh-CN' },
  script: [
    {
      type: 'application/ld+json',
      key: 'jsonld-organization',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '陕西有色驼城建设有限公司',
        url: config.public.siteUrl,
        logo: `${config.public.siteUrl}/logo.png`,
        description: '陕西有色驼城建设有限公司 - 专注于矿山建设、土木工程、市政工程等领域',
        address: {
          '@type': 'PostalAddress',
          addressLocality: '榆林市',
          addressRegion: '陕西省',
          addressCountry: 'CN'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: 'Chinese'
        }
      })
    },
    {
      type: 'application/ld+json',
      key: 'jsonld-website',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '陕西有色驼城建设有限公司',
        url: config.public.siteUrl,
        description: '陕西有色驼城建设有限公司官方网站',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${config.public.siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      })
    },
    // P2-21: 合并原 structured-data.json 的 WebApplication 类型（精简描述）
    {
      type: 'application/ld+json',
      key: 'jsonld-webapp',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: '陕西有色驼城建设有限公司',
        url: config.public.siteUrl,
        description: '陕西有色驼城建设有限公司官方网站 - 对外承包工程、矿山建设、市政工程',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY'
        }
      })
    }
  ]
})
</script>
