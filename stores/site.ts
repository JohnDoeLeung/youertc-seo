/**
 * 站点 Pinia store（替代 src/store/index.js 的 Vuex 3）
 *
 * 改造点：
 * 1. Composition API 风格 store（setup store）
 * 2. 修正原 typo：SET_ACTIVEIDDEX → SET_ACTIVE_INDEX，SET_ACTIVEARTIVLEID → SET_ACTIVE_ARTICLE_ID
 * 3. TypeScript 类型定义
 * 4. 移除 sessionStorage 依赖（SSR 不兼容），改用 useState 模式由 Nuxt payload 传递
 */
import { defineStore } from 'pinia'

export interface Category {
  id: number | string
  pid?: number | string
  name: string
  childs?: Category[]
  articleList?: Article[]
  siteId?: number
}

export interface Article {
  id: number | string
  title: string
  description?: string
  header?: string
  createTime?: string
  time?: string
  author?: string
  views?: number
  cateId?: number | string
  cateName?: string
  detail?: string
  files?: string[]
}

export interface SiteInfo {
  id?: number
  name?: string
  logo?: string
  banner?: string[]
  address?: string
  phone?: string
  beian?: string
  description?: string
  domain?: string
  detail?: string
  [key: string]: unknown
}

export const useSiteStore = defineStore('site', () => {
  // state
  const siteId = useState<number>('siteId', () => 5)
  const cateList = useState<Category[]>('cateList', () => [])
  const siteInfo = useState<SiteInfo>('siteInfo', () => ({}))
  const activeId = useState<string>('activeId', () => '-1')
  const activeIndex = useState<number>('activeIndex', () => -1)
  const activeArticleId = useState<string>('activeArticleId', () => '-1')

  // getters
  const getCateTree = computed(() => cateList.value)

  // actions
  const setSiteInfo = (info: SiteInfo) => {
    siteInfo.value = info
  }

  const setCateList = (list: Category[]) => {
    cateList.value = list
  }

  const setActiveId = (id: string | number) => {
    activeId.value = id.toString()
  }

  const setActiveIndex = (index: number) => {
    activeIndex.value = index
  }

  const setActiveArticleId = (id: string | number) => {
    activeArticleId.value = id.toString()
  }

  /**
   * 初始化站点信息（SSR 友好，替代原 App.vue created() 中的 Promise.all）
   * 在服务端执行后，状态自动通过 Nuxt payload 序列化到客户端
   */
  const initSiteData = async () => {
    const { fetchSiteItem, fetchCateTree } = useApi()
    const config = useRuntimeConfig()

    try {
      const [siteRes, cateRes] = await Promise.all([
        fetchSiteItem(config.public.siteId as number),
        fetchCateTree(config.public.siteId as number)
      ])

      // banner 字段后端返回字符串，需 JSON 解析
      if (siteRes && typeof siteRes.banner === 'string') {
        try {
          siteRes.banner = JSON.parse(siteRes.banner as unknown as string)
        } catch {
          siteRes.banner = []
        }
      }

      setSiteInfo(siteRes)
      setCateList(cateRes)
      return { siteRes, cateRes }
    } catch (err) {
      console.error('[site store] 初始化站点数据失败:', err)
      throw err
    }
  }

  return {
    // state
    siteId,
    cateList,
    siteInfo,
    activeId,
    activeIndex,
    activeArticleId,
    // getters
    getCateTree,
    // actions
    setSiteInfo,
    setCateList,
    setActiveId,
    setActiveIndex,
    setActiveArticleId,
    initSiteData
  }
})
