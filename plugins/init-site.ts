/**
 * 站点数据初始化插件
 *
 * 作用：在应用渲染前（SSR + 客户端水合前）预加载站点信息 + 分类树
 * 这样 AppHeader / AppFooter 等全局组件可直接读取 store.cateList / store.siteInfo
 *
 * 替代原 Vue2 项目 App.vue created() 中的 Promise.all([siteItem, cateTree]) 逻辑
 */
import { useSiteStore } from '~/stores/site'

export default defineNuxtPlugin(async () => {
  const store = useSiteStore()

  // 仅在 siteInfo.name 为空时初始化（避免重复请求）
  if (!store.siteInfo.name) {
    try {
      await store.initSiteData()
    } catch (err) {
      console.error('[plugin:init-site] 站点数据初始化失败:', err)
    }
  }
})
