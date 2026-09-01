<template>
  <div>
    <div class="is-main f-mb15" role="main">
      <div class="container">
        <!-- 面包屑（沿用原 .m-location，选中二级分类时显示完整层级） -->
        <nav class="m-location f-mb10" aria-label="面包屑导航">
          <span>当前位置：</span>
          <NuxtLink to="/" target="_blank">网站首页</NuxtLink>
          <template v-for="(crumb, i) in breadcrumbTrail" :key="i">
            &gt;
            <NuxtLink v-if="i < breadcrumbTrail.length - 1" :to="crumb.url" target="_blank">{{ crumb.name }}</NuxtLink>
            <a v-else aria-current="page">{{ crumb.name }}</a>
          </template>
        </nav>

        <div class="m-pgpdbox1">
          <div class="row f-mlrf10">
            <!-- 侧边栏子分类 -->
            <section class="col-md-3 f-plr10 m-listlf f-md-mb15">
              <div class="g-listlf">
                <h1 class="u-tit">
                  <span />
                  {{ cateInfo.name }}
                </h1>
                <ul>
                  <li
                    v-for="(item, index) in childList"
                    :key="index"
                    :class="{ 'u-active': activeIndex === index }"
                    @click="handleSelectChild(index)"
                  >
                    <a :title="item.name">{{ item.name }}</a>
                  </li>
                </ul>
              </div>
            </section>

            <!-- 文章列表 -->
            <section class="col-md-9 f-plr10 m-listrg">
              <div class="m-titstyle1 f-clearfix f-mb5">
                <span class="u-tit f-fl">
                  {{ activeIndex < 0 ? cateInfo.name : childList[activeIndex]?.name }}
                  <em />
                </span>
              </div>

              <div class="m-cglist m-liststyle1 f-md-mb15">
                <ul>
                  <li v-for="(item, index) in cateArticleList" :key="index">
                    <span>{{ formDate(item.createTime) }}</span>
                    <NuxtLink
                      :title="item.title"
                      :to="`/detail/${item.id}`"
                      target="_blank"
                    >
                      {{ item.title }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <!-- 分页（使用原 .m-pagination 结构） -->
              <div class="m-pagination-wrap">
                <ul class="m-pagination f-clearfix">
                  <li class="u-total">
                    共 <em>{{ total }}</em> 条
                  </li>
                  <li :class="{ disabled: currentPage <= 1 }">
                    <button type="button" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">上一页</button>
                  </li>
                  <li
                    v-for="p in totalPages"
                    :key="p"
                    :class="{ active: p === currentPage }"
                  >
                    <button type="button" @click="changePage(p)">{{ p }}</button>
                  </li>
                  <li :class="{ disabled: currentPage >= totalPages }">
                    <button type="button" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">下一页</button>
                  </li>
                  <li class="u-pagesize">
                    <span>每页</span>
                    <select v-model.number="pageSize" @change="changePageSize">
                      <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} 条</option>
                    </select>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Article, Category } from '~/stores/site'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const store = useSiteStore()

// 从 URL query 初始化分页参数（支持 /channel/1?page=3 直接访问）
const activeIndex = ref(-1)
const currentPage = ref(parseInt(route.query.page as string) || 1)
const pageSize = ref(parseInt(route.query.pageSize as string) || 15)
const pageSizeOptions = [15, 25, 40]

const categoryId = computed(() => route.params.id as string)

const { fetchCateArticle, fetchArticlePage } = useApi()

// 兼容 API 返回 data 直接为数组的情况（cateArticle 接口返回数组，page 接口返回 { list, total }）
const extractPageData = (res: any): { list: Article[]; total: number } => {
  if (Array.isArray(res)) return { list: res, total: res.length }
  return { list: res.list || res.records || [], total: res.total || 0 }
}

// 父分类全量文章缓存（fetchCateArticle 不支持分页，需客户端分页）
const allCateArticles = ref<Article[]>([])

// 父分类客户端分页：从全量缓存中切片当前页
const sliceCateArticlePage = () => {
  const start = (currentPage.value - 1) * pageSize.value
  cateArticleList.value = allCateArticles.value.slice(start, start + pageSize.value)
}

// 服务端获取数据：返回分类信息 + 文章列表
// 关键：使用 useAsyncData 返回的 data，客户端水合时从 payload 恢复
const { data: channelData, refresh } = await useAsyncData(
  `channel-${categoryId.value}`,
  async () => {
    const id = categoryId.value

    // 解析当前 ID 是一级分类还是二级分类
    let parent: Category | null = null
    let childIndex = -1
    for (const c of store.cateList) {
      if (c.id.toString() === id) {
        parent = c
        childIndex = -1
        break
      }
      const idx = (c.childs || []).findIndex(ch => ch.id.toString() === id)
      if (idx !== -1) {
        parent = c
        childIndex = idx
        break
      }
    }

    const cateInfo = parent || ({} as Category)
    const childList = parent?.childs || []

    // 同步 store：一级分类直接显示全部子分类，二级分类高亮对应子分类
    store.setActiveId(cateInfo.id?.toString() || id)
    store.setActiveIndex(childIndex)
    activeIndex.value = childIndex

    // 获取文章列表
    let articles: Article[] = []
    let totalCount = 0

    if (childIndex === -1) {
      // 父分类：fetchCateArticle 不支持分页，一次性获取全量数据，由前端 slice 分页
      const res = await fetchCateArticle({
        siteId: config.public.siteId as number,
        pCateId: store.activeId,
        page: 1,
        pageSize: 9999
      })
      const page = extractPageData(res)
      articles = page.list
      totalCount = page.total
    } else {
      const child = childList[childIndex]
      if (child) {
        const res = await fetchArticlePage({
          page: currentPage.value,
          pageSize: pageSize.value,
          siteId: child.siteId as number,
          cateId: child.id
        })
        const page = extractPageData(res)
        articles = page.list.map((item: any) => item.article || item)
        totalCount = page.total
      }
    }

    return { cateInfo, childList, articles, totalCount }
  }
)

// 从 channelData 派生响应式数据
const cateInfo = computed<Category>(() => channelData.value?.cateInfo || ({} as Category))
const childList = computed<Category[]>(() => channelData.value?.childList || [])

// 面包屑层级：默认「首页 > 一级分类」，选中二级分类时显示「首页 > 一级分类 > 二级分类」
const breadcrumbTrail = computed(() => {
  const trail: { name: string; url: string }[] = []
  const parent = cateInfo.value
  if (parent?.name) {
    trail.push({ name: parent.name, url: `${config.public.siteUrl}/channel/${parent.id}` })
  }
  if (activeIndex.value >= 0 && childList.value[activeIndex.value]) {
    const child = childList.value[activeIndex.value]
    trail.push({ name: child.name, url: `${config.public.siteUrl}/channel/${child.id}` })
  }
  return trail
})

// cateArticleList 和 total 需要在交互中修改，用 ref 并从 channelData 初始化
const cateArticleList = ref<Article[]>([])
const total = ref<number>(0)

// 初始化：父分类客户端分页（slice 当前页），子分类服务端分页（直接使用）
const initArticleList = (data: { articles: Article[]; totalCount: number } | null) => {
  if (!data) return
  if (store.activeIndex === -1) {
    // 父分类：缓存全量数据，前端 slice 当前页
    allCateArticles.value = data.articles || []
    total.value = data.totalCount || 0
    sliceCateArticlePage()
  } else {
    // 子分类：服务端已分页，直接使用
    allCateArticles.value = []
    cateArticleList.value = data.articles || []
    total.value = data.totalCount || 0
  }
  activeIndex.value = store.activeIndex
}

initArticleList(channelData.value)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

// 当 channelData 变化时（路由切换/refresh），同步 cateArticleList 和 total
watch(channelData, (newData) => {
  initArticleList(newData)
})

// 子分类：服务端分页加载
const loadChildArticle = async (index: number) => {
  const child = childList.value[index]
  if (!child) return
  const res = await fetchArticlePage({
    page: currentPage.value,
    pageSize: pageSize.value,
    siteId: child.siteId as number,
    cateId: child.id
  })
  const page = extractPageData(res)
  cateArticleList.value = page.list.map((item: any) => item.article || item)
  total.value = page.total
  allCateArticles.value = []
}

const handleSelectChild = async (index: number) => {
  const child = childList.value[index]
  if (!child) return
  currentPage.value = 1
  // 点击子分类直接跳转到子分类 URL，与顶部导航行为保持一致
  await router.push({
    path: `/channel/${child.id}`,
    query: { pageSize: pageSize.value }
  })
}

const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages.value) return
  // 仅更新 URL，数据加载由 route.query.page watcher 统一处理
  // 使用 push 以支持浏览器后退/前进
  router.push({
    query: { ...route.query, page: newPage }
  })
}

// 切换每页条数：重置到第 1 页并重新加载
const changePageSize = async () => {
  currentPage.value = 1
  // 重置 URL 中的 page 参数
  const newQuery = { ...route.query, pageSize: pageSize.value }
  delete newQuery.page
  await router.replace({ query: newQuery })
  if (activeIndex.value === -1) {
    // 父分类：客户端分页，直接重新 slice
    sliceCateArticlePage()
  } else {
    // 子分类：服务端分页，重新请求
    await loadChildArticle(activeIndex.value)
  }
}

// 日期格式化（保持原逻辑）
const formDate = (date: string) => {
  if (!date) return ''
  return date.substr(0, 10)
}

// SEO：在数据加载后注入，确保 SSR HTML 中包含真实分类名
const seoName = computed(() => {
  if (activeIndex.value >= 0 && childList.value[activeIndex.value]) {
    return childList.value[activeIndex.value].name
  }
  return cateInfo.value.name || '分类'
})

useSeo({
  title: `${seoName.value} - 陕西有色驼城建设有限公司`,
  description: `${seoName.value} - 陕西有色驼城建设有限公司分类页面`,
  keywords: `${seoName.value},陕西有色驼城建设有限公司`,
  url: `${config.public.siteUrl}/channel/${categoryId.value}`,
  type: 'website'
})

useBreadcrumbJsonLd(breadcrumbTrail)

// 监听路由参数变化（切换分类）
watch(() => route.params.id, async (newId) => {
  if (newId) {
    activeIndex.value = -1
    currentPage.value = 1
    store.setActiveId(newId as string)
    store.setActiveIndex(-1)
    // 切换分类时清除 page 参数（重置到第 1 页）
    const newQuery = { ...route.query }
    delete newQuery.page
    await router.replace({ query: newQuery })
    await refresh()
  }
})

// 监听 URL query.page 变化（浏览器后退/前进时同步分页数据）
watch(() => route.query.page, async (newPage) => {
  const page = parseInt(newPage as string) || 1
  // 避免与 changePage 的直接设置重复加载
  if (page === currentPage.value) return
  currentPage.value = page
  if (activeIndex.value === -1) {
    // 父分类：客户端分页，直接 slice
    sliceCateArticlePage()
  } else {
    // 子分类：服务端分页，重新请求
    await loadChildArticle(activeIndex.value)
  }
})
</script>

<style scoped lang="scss">
/* .m-liststyle1 li a 在 page.css 中已定义为 padding-left:13px + 背景 icon
   原 .m-cglist li span 已 float:right，这里仅补充 button 样式重置 */
.m-pagination li button {
  display: block;
  padding: 0 14px;
  line-height: 34px;
  border: 1px solid var(--border-base);
  font-size: 14px;
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.m-pagination li.active button,
.m-pagination li button:hover:not(:disabled) {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 95, 150, 0.25);
  transform: translateY(-1px);
}

.m-pagination li button:disabled {
  background: var(--bg-muted);
  border-color: var(--border-base);
  color: var(--text-disabled);
  cursor: default;
  transform: none;
  box-shadow: none;
}

/* 每页条数选择器 */
.m-pagination-wrap {
  margin-top: 20px;
  text-align: right;
}

.m-pagination-wrap .m-pagination {
  display: inline-block;
}

.u-total {
  margin-right: 12px;
  line-height: 36px;
  font-size: 14px;
  color: var(--text-muted);

  em {
    font-style: normal;
    color: var(--brand-primary);
    font-weight: 600;
    margin: 0 3px;
    font-size: 16px;
  }
}

.u-pagesize {
  margin-left: 12px;
  line-height: 36px;
  font-size: 14px;
  color: var(--text-muted);

  span {
    margin-right: 8px;
  }

  select {
    height: 36px;
    padding: 0 28px 0 12px;
    border: 1px solid var(--border-base);
    border-radius: var(--radius-sm);
    background: #fff;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    vertical-align: middle;
    transition: all 0.25s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238a94a3'><path d='M7 10l5 5 5-5z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 6px center;
    background-size: 18px;

    &:hover {
      border-color: var(--brand-primary);
    }

    &:focus {
      border-color: var(--brand-primary);
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 95, 150, 0.12);
    }
  }
}
</style>
