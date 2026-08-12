/**
 * 动态 Sitemap 生成（服务端路由）
 *
 * 访问 /sitemap.xml 时触发，从后端 API 拉取全站分类 + 文章列表，
 * 自动生成包含所有页面 URL 的 sitemap.xml
 *
 * 特性：
 * - 内存缓存 1 小时，避免每次请求都调用 API
 * - 新增文章后自动包含（下次缓存过期或手动刷新）
 * - 支持 lastmod（取文章发布时间）
 *
 * 手动刷新缓存：访问 /sitemap.xml?refresh=1
 */
import type { H3Event } from 'h3'

interface Category {
  id: number | string
  name: string
  childs?: Category[]
  siteId?: number
}

interface Article {
  id: number | string
  title: string
  createTime?: string
  time?: string
  updateTime?: string
}

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq: string
  priority: number
}

// 内存缓存
let cache: { xml: string; time: number } | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 小时

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const forceRefresh = query.refresh === '1'

  // 命中缓存直接返回
  if (!forceRefresh && cache && Date.now() - cache.time < CACHE_TTL) {
    setHeader(event, 'content-type', 'application/xml; charset=utf-8')
    setHeader(event, 'cache-control', 'public, max-age=3600')
    return cache.xml
  }

  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string
  const siteUrl = config.public.siteUrl as string
  const siteId = config.public.siteId as number

  const urls: SitemapUrl[] = []

  // 首页
  urls.push({
    loc: `${siteUrl}/`,
    changefreq: 'daily',
    priority: 1.0
  })

  // 关于我们页
  urls.push({
    loc: `${siteUrl}/about`,
    changefreq: 'monthly',
    priority: 0.5
  })

  try {
    // 1. 获取分类树
    const cateRes = await $fetch<{ code: number; data: Category[] }>(
      `/cate/common/tree/${siteId}`,
      { baseURL, method: 'GET' }
    )

    if (cateRes.code === 0 && Array.isArray(cateRes.data)) {
      for (const cate of cateRes.data) {
        // 频道页 URL
        urls.push({
          loc: `${siteUrl}/channel/${cate.id}`,
          changefreq: 'daily',
          priority: 0.8
        })

        // 获取该分类下的所有文章
        let articles: Article[] = []

        if (cate.childs && cate.childs.length > 0) {
          // 有子分类：用 cateArticle 接口获取父分类下全量文章
          articles = await fetchCateArticles(baseURL, siteId, cate.id)
        } else {
          // 无子分类：用 articlePage 接口获取
          articles = await fetchPagedArticles(baseURL, siteId, cate.id)
        }

        // 添加文章详情页 URL
        for (const art of articles) {
          urls.push({
            loc: `${siteUrl}/detail/${art.id}`,
            lastmod: normalizeDate(art.updateTime || art.createTime || art.time),
            changefreq: 'weekly',
            priority: 0.6
          })
        }
      }
    }
  } catch (err) {
    console.error('[sitemap] 获取分类树失败:', err)
  }

  // 生成 XML
  const xml = buildSitemapXml(urls)

  // 更新缓存
  cache = { xml, time: Date.now() }

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return xml
})

/**
 * 获取父分类下全量文章（cateArticle 接口）
 */
async function fetchCateArticles(
  baseURL: string,
  siteId: number,
  pCateId: string | number
): Promise<Article[]> {
  try {
    const res = await $fetch<{ code: number; data: Article[] | { list: Article[] } }>(
      '/article/common/cateArticle',
      {
        baseURL,
        method: 'POST',
        body: { siteId, pCateId, page: 1, pageSize: 9999 },
        headers: { 'Content-Type': 'application/json' }
      }
    )
    if (res.code !== 0) return []
    return Array.isArray(res.data) ? res.data : (res.data as { list: Article[] }).list || []
  } catch (err) {
    console.error(`[sitemap] 获取分类 ${pCateId} 文章失败:`, err)
    return []
  }
}

/**
 * 获取无子分类的文章列表（articlePage 接口）
 */
async function fetchPagedArticles(
  baseURL: string,
  siteId: number,
  cateId: string | number
): Promise<Article[]> {
  try {
    const res = await $fetch<{ code: number; data: { list: Article[]; total: number } }>(
      '/article/common/page',
      {
        baseURL,
        method: 'POST',
        body: { page: 1, pageSize: 9999, siteId, cateId },
        headers: { 'Content-Type': 'application/json' }
      }
    )
    if (res.code !== 0 || !res.data?.list) return []
    // 兼容 { article: {...} } 的返回结构
    return res.data.list.map((item: any) => item.article || item)
  } catch (err) {
    console.error(`[sitemap] 获取分类 ${cateId} 文章失败:`, err)
    return []
  }
}

/**
 * 生成 sitemap XML 字符串
 */
function buildSitemapXml(urls: SitemapUrl[]): string {
  const entries = urls.map(u => {
    let entry = '  <url>\n'
    entry += `    <loc>${escapeXml(u.loc)}</loc>\n`
    entry += `    <changefreq>${u.changefreq}</changefreq>\n`
    entry += `    <priority>${u.priority}</priority>`
    if (u.lastmod) {
      entry += `\n    <lastmod>${u.lastmod}</lastmod>`
    }
    entry += '\n  </url>'
    return entry
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`
}

/**
 * 转义 XML 特殊字符
 */
function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

/**
 * 规范化日期为 W3C datetime 格式（YYYY-MM-DD）
 */
function normalizeDate(date?: string): string | undefined {
  if (!date) return undefined
  // 已是 ISO 格式
  const d = new Date(date)
  if (isNaN(d.getTime())) return undefined
  return d.toISOString().split('T')[0]
}
