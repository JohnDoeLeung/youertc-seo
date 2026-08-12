/**
 * 站内搜索 API（服务端）
 *
 * 路由：GET /api/search?q=关键词&page=1&pageSize=15
 *
 * 实现：
 * 1. 从全站分类拉取所有文章（带 1 小时内存缓存，复用 sitemap 思路）
 * 2. 服务端按标题/描述模糊匹配关键词
 * 3. 返回分页结果
 *
 * 缓存说明：
 * - 全站文章索引缓存 1 小时，避免每次搜索都全量拉取 API
 * - 手动刷新索引：GET /api/search?refresh=1&q=...
 */
import type { H3Event } from 'h3'

interface Article {
  id: number | string
  title: string
  description?: string
  createTime?: string
  time?: string
  cateId?: string | number
  cateName?: string
  header?: string
}

interface Category {
  id: number | string
  name: string
  childs?: Category[]
  siteId?: number
}

// 全站文章索引缓存
let articleIndex: { articles: Article[]; time: number } | null = null
const INDEX_TTL = 5 * 60 * 1000 // 5 分钟

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const keyword = (query.q as string || '').trim()
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize as string) || 15))
  // 支持 offset 参数（无限滚动模式：首次 15 条后，后续按 offset 加载 10 条）
  const offset = parseInt(query.offset as string) || 0
  const forceRefresh = query.refresh === '1'

  // 获取或刷新全站文章索引
  let articles: Article[] = []
  if (!forceRefresh && articleIndex && Date.now() - articleIndex.time < INDEX_TTL) {
    articles = articleIndex.articles
  } else {
    articles = await buildArticleIndex(event)
    articleIndex = { articles, time: Date.now() }
  }

  // 无关键词：返回空结果 + 推荐文章（取最新 5 篇）
  if (!keyword) {
    const recommend = [...articles]
      .sort((a, b) => new Date(b.createTime || b.time || 0).getTime() - new Date(a.createTime || a.time || 0).getTime())
      .slice(0, 5)
    return {
      code: 0,
      data: { list: [], total: 0, page, pageSize, keyword: '', recommend }
    }
  }

  // 多关键词分词（空格分割，AND 逻辑：所有词都需命中标题或描述）
  const keywords = keyword.split(/\s+/).filter(Boolean).map(k => k.toLowerCase())

  // 匹配 + 计算相关度
  const matched = articles
    .map(a => {
      const titleLower = (a.title || '').toLowerCase()
      const descLower = (a.description || '').toLowerCase()
      // 所有关键词都需命中（标题或描述任一包含即可）
      const allHit = keywords.every(k => titleLower.includes(k) || descLower.includes(k))
      if (!allHit) return null
      // 相关度：标题命中 +2，描述命中 +1（按每个关键词累计）
      let score = 0
      for (const k of keywords) {
        if (titleLower.includes(k)) score += 2
        if (descLower.includes(k)) score += 1
      }
      return { article: a, score }
    })
    .filter((x): x is { article: Article; score: number } => x !== null)

  // 排序：相关度降序 → 发布时间倒序
  matched.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const ta = new Date(a.article.createTime || a.article.time || 0).getTime()
    const tb = new Date(b.article.createTime || b.article.time || 0).getTime()
    return tb - ta
  })

  const matchedArticles = matched.map(m => m.article)

  // 分页（支持 page 和 offset 两种模式）
  const total = matchedArticles.length
  const start = offset > 0 ? offset : (page - 1) * pageSize
  const list = matchedArticles.slice(start, start + pageSize)
  const hasMore = start + list.length < total

  // 无结果时返回推荐文章（取最新 5 篇）
  let recommend: Article[] = []
  if (total === 0) {
    recommend = [...articles]
      .sort((a, b) => new Date(b.createTime || b.time || 0).getTime() - new Date(a.createTime || a.time || 0).getTime())
      .slice(0, 5)
  }

  return {
    code: 0,
    data: { list, total, page, pageSize, hasMore, keyword, recommend }
  }
})

/**
 * 构建全站文章索引（从所有分类拉取）
 */
async function buildArticleIndex(event: H3Event): Promise<Article[]> {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string
  const siteId = config.public.siteId as number
  const articles: Article[] = []

  try {
    // 1. 获取分类树
    const cateRes = await $fetch<{ code: number; data: Category[] }>(
      `/cate/common/tree/${siteId}`,
      { baseURL, method: 'GET' }
    )

    if (cateRes.code !== 0 || !Array.isArray(cateRes.data)) return articles

    // 2. 并发拉取各分类文章
    const fetchTasks = cateRes.data.map(async (cate) => {
      let cateArticles: Article[] = []

      if (cate.childs && cate.childs.length > 0) {
        cateArticles = await fetchCateArticles(baseURL, siteId, cate.id)
      } else {
        cateArticles = await fetchPagedArticles(baseURL, siteId, cate.id)
      }

      // 标注分类信息（用于搜索结果展示）
      return cateArticles.map(a => ({
        ...a,
        cateId: cate.id,
        cateName: cate.name
      }))
    })

    const results = await Promise.all(fetchTasks)
    results.forEach(arr => articles.push(...arr))
  } catch (err) {
    console.error('[search] 构建文章索引失败:', err)
  }

  return articles
}

/**
 * 获取父分类下全量文章
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
  } catch {
    return []
  }
}

/**
 * 获取无子分类的文章列表
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
    return res.data.list.map((item: any) => item.article || item)
  } catch {
    return []
  }
}
