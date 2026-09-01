/**
 * SEO 组合式函数（替代原 src/utils/seo.js）
 *
 * 改造点：
 * 1. 使用 Nuxt3 原生 useSeoMeta / useHead，SSR 友好（无需 document 操作）
 * 2. JSON-LD 通过 useHead 注入，框架自动管理生命周期（无需 cleanupPageSeo）
 * 3. 全部 TypeScript，类型安全
 */
import { isRef, computed, type Ref, type ComputedRef } from 'vue'

interface SeoMetaInput {
  title?: string
  description?: string
  keywords?: string
  url?: string
  image?: string
  type?: 'website' | 'article' | 'profile'
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface ArticleData {
  id: string | number
  title: string
  description?: string
  header?: string
  author?: string
  createTime?: string
  time?: string
  updateTime?: string
  cateId?: string | number
  cateName?: string
}

/**
 * 设置页面 SEO 元信息（title / description / keywords / og / twitter / canonical）
 * 在 SSR 与客户端双端执行，head 由 Nuxt 自动注入到 HTML
 */
export function useSeo(meta: SeoMetaInput) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl as string
  const fullUrl = meta.url ? new URL(meta.url, siteUrl).toString() : siteUrl
  const image = meta.image
    ? (meta.image.startsWith('http') ? meta.image : new URL(meta.image, siteUrl).toString())
    : `${siteUrl}/og-image.jpg`

  useSeoMeta({
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    ogTitle: meta.title,
    ogDescription: meta.description,
    ogImage: image,
    ogUrl: fullUrl,
    ogType: meta.type || 'website',
    ogSiteName: '陕西有色驼城建设有限公司',
    ogLocale: 'zh_CN',
    twitterCard: 'summary_large_image',
    twitterTitle: meta.title,
    twitterDescription: meta.description,
    twitterImage: image,
    twitterUrl: fullUrl
  })

  // canonical link
  useHead({
    link: [
      { rel: 'canonical', href: fullUrl }
    ]
  })
}

/**
 * 注入面包屑 JSON-LD 结构化数据
 * 替代原 setBreadcrumbJsonLd，无需手动清理
 * items 支持传入 Ref / ComputedRef，面包屑变化时会自动更新结构化数据
 */
export function useBreadcrumbJsonLd(
  items: BreadcrumbItem[] | Ref<BreadcrumbItem[]> | ComputedRef<BreadcrumbItem[]>
) {
  const list = computed(() =>
    isRef(items) ? (items.value as BreadcrumbItem[]) : (items as BreadcrumbItem[])
  )

  const jsonLd = computed(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list.value.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }))

  useHead({
    script: [
      {
        type: 'application/ld+json',
        key: 'breadcrumb-jsonld',
        // innerHTML 传入 computed，随面包屑变化自动更新
        innerHTML: computed(() => JSON.stringify(jsonLd.value)) as unknown as string
      }
    ]
  })
}

/**
 * 注入文章 JSON-LD 结构化数据
 * 替代原 setArticleJsonLd
 */
export function useArticleJsonLd(article: ArticleData) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl as string

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description || '',
    image: article.header
      ? (article.header.startsWith('http') ? article.header : new URL(article.header, siteUrl).toString())
      : `${siteUrl}/og-image.jpg`,
    author: {
      '@type': 'Organization',
      name: article.author || '陕西有色驼城建设有限公司'
    },
    publisher: {
      '@type': 'Organization',
      name: '陕西有色驼城建设有限公司',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    datePublished: article.createTime || article.time || '',
    dateModified: article.updateTime || article.createTime || article.time || '',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/detail/${article.id}`
    }
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        key: 'article-jsonld',
        innerHTML: JSON.stringify(jsonLd)
      }
    ]
  })
}
