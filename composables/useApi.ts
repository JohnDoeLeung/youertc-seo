/**
 * API 组合式函数（替代 src/api/api.js + src/api/request.js）
 *
 * 改造点：
 * 1. 使用 Nuxt3 原生 $fetch / ofetch，无需 axios
 * 2. 错误处理改为 SSR 友好方式（不用 Element UI 的 MessageBox）
 * 3. 移除原模板残留的 token 过期逻辑（项目无登录系统）
 * 4. 全部 TypeScript，类型安全
 * 5. 自动从 runtimeConfig 读取 baseURL
 */
import type { Category, Article, SiteInfo } from '~/stores/site'

interface PageResponse<T> {
  list?: T[]
  records?: T[]
  total?: number
  pages?: number
  [key: string]: unknown
}

interface ArticlePageParams {
  page: number
  pageSize?: number
  siteId?: number
  cateId?: string | number
}

interface CateArticleParams {
  siteId: number
  pCateId: string | number
  page: number
  pageSize: number
}

export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  /**
   * 统一请求封装（替代 request.js）
   * - 自动拼接 baseURL
   * - 统一处理业务码（res.code === 0 为成功，返回 res.data）
   * - 错误使用 console.error + 抛出，由调用方处理（不再用 Element UI 弹窗）
   */
  const request = async <T = unknown>(
    url: string,
    options: { method?: 'GET' | 'POST'; body?: unknown } = {}
  ): Promise<T> => {
    const { method = 'GET', body } = options
    try {
      const res = await $fetch<{ code: number; data: T; msg?: string }>(url, {
        baseURL,
        method,
        body: body as Record<string, unknown> | undefined,
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.code !== 0) {
        console.error(`[API] ${url} 业务错误:`, res.msg || 'Error')
        throw new Error(res.msg || 'Error')
      }
      return res.data
    } catch (err) {
      console.error(`[API] ${url} 请求失败:`, err)
      throw err
    }
  }

  /** 站点信息 */
  const fetchSiteItem = (id: number) =>
    request<SiteInfo>(`/site/common/item/${id}`, { method: 'POST' })

  /** 文章分类树 */
  const fetchCateTree = (siteId: number) =>
    request<Category[]>(`/cate/common/tree/${siteId}`)

  /** 首页聚合数据 */
  const fetchIndexData = (siteId: number) =>
    request<{
      recommendArticle: Article[]
      recommendCate: (Category & { articleList: Article[] })[]
      normalCate: (Category & { articleList: Article[] })[]
    }>('/index/common/index', { method: 'POST', body: { siteId } })

  /** 文章分页 */
  const fetchArticlePage = (params: ArticlePageParams) =>
    request<PageResponse<Article>>('/article/common/page', {
      method: 'POST',
      body: {
        page: params.page,
        pageSize: params.pageSize || 10,
        siteId: params.siteId,
        cateId: params.cateId
      }
    })

  /** 文章详情 */
  const fetchArticleItem = (id: string | number) =>
    request<Article>(`/article/common/item/${id}`, { method: 'POST' })

  /** 一级分类下文章 */
  const fetchCateArticle = (params: CateArticleParams) =>
    request<PageResponse<Article>>('/article/common/cateArticle', {
      method: 'POST',
      body: params
    })

  /** 友情链接 */
  const fetchFriendLinks = (siteId: number) =>
    request<{ url: string; name: string }[]>('/friend/all', {
      method: 'POST',
      body: { siteId }
    })

  return {
    request,
    fetchSiteItem,
    fetchCateTree,
    fetchIndexData,
    fetchArticlePage,
    fetchArticleItem,
    fetchCateArticle,
    fetchFriendLinks
  }
}
