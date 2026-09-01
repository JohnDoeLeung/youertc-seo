<template>
  <div>
    <div class="is-main f-mb15" role="main">
      <div class="container">
        <!-- 面包屑（沿用原 .m-location）
             注意：文章详情接口只返回 cateId、不返回 cateName，
             分类名称需从全局分类树反查，故这里用 categoryTrail 动态渲染，
             而不是读 article.cateName（该字段永远为空，会导致回退成「联系我们」） -->
        <nav class="m-location f-mb10" aria-label="面包屑导航">
          <span>当前位置：</span>
          <NuxtLink to="/" target="_blank">网站首页</NuxtLink>
          <template v-for="crumb in categoryTrail" :key="`bc-${crumb.id}`">
            <span> &gt; </span>
            <NuxtLink :to="`/channel/${channelId}`" target="_blank">{{ crumb.name }}</NuxtLink>
          </template>
          <span> &gt; </span>
          <a aria-current="page">正文</a>
        </nav>

        <div class="m-pgpdbox1">
          <article class="m-detailbox">
            <h1 class="u-lgtit text-center f-mb15 f-md-mb10">{{ article.title }}</h1>

            <div class="m-dtfuns f-clearfix">
              <div class="u-wzinfo f-fl f-md-fn">
                <span>发布时间：{{ article.time }}</span>
                <span>作者：{{ article.author }}</span>
                <span>浏览：{{ article.views }} 次</span>
              </div>
            </div>

            <!-- 文章正文（v-safe-html 已替换为 v-html + sanitize） -->
            <div class="m-dtfonts">
              <div
                v-if="sanitizedDetail"
                ref="contentRef"
                class="m-dttexts f-clearfix"
                v-html="sanitizedDetail"
              />
            </div>

            <!-- 附件下载 -->
            <div v-if="article.files && article.files.length > 0" class="m-dtdownload f-mb15">
              <ul>
                <li v-for="(file, index) in article.files" :key="index">
                  <a :href="file" target="_blank" rel="noopener noreferrer">
                    附件{{ index + 1 }}：{{ getFileName(file) }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- 上一条 / 下一条（沿用原 .m-dtsxqh 结构） -->
            <div class="m-dtsxqh f-clearfix">
              <ul>
                <li class="f-fl u-dtprev">
                  上一条：
                  <NuxtLink v-if="prev" :to="`/detail/${prev.id}`" target="_blank">{{ prev.title }}</NuxtLink>
                  <a v-else>没有上一条了</a>
                </li>
                <li class="f-fr u-dtnext">
                  下一条：
                  <NuxtLink v-if="next" :to="`/detail/${next.id}`" target="_blank">{{ next.title }}</NuxtLink>
                  <a v-else>没有下一条了</a>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- 返回顶部（客户端组件，替代 v-back-top 指令） -->
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import type { Article } from '~/stores/site'
import { useSiteStore } from '~/stores/site'
import { sanitize } from '~/utils/sanitize'
import { getFileName, findCategoryPath } from '~/utils'

const config = useRuntimeConfig()
const route = useRoute()
const store = useSiteStore()

const { fetchArticleItem } = useApi()
const articleId = computed(() => route.params.id as string)

// 服务端获取数据：使用 useAsyncData 返回的 data，客户端水合时从 payload 恢复
const { data: articleData } = await useAsyncData(`article-${articleId.value}`, async () => {
  const res = await fetchArticleItem(articleId.value)

  // files 字段后端返回字符串，需 JSON 解析
  if (res.files && typeof res.files === 'string') {
    try {
      res.files = JSON.parse(res.files as unknown as string)
    } catch {
      res.files = []
    }
  }

  return res
})

// article ref 从 articleData 初始化，保证 SSR 和客户端水合一致
const article = ref<Article & { next?: Article; prev?: Article }>(articleData.value || ({} as Article))

// 当 articleData 变化时（路由切换），同步 article
watch(articleData, (newData) => {
  if (newData) {
    article.value = newData
  }
})

const next = computed(() => article.value.next || null)
const prev = computed(() => article.value.prev || null)

// 分类层级：文章详情接口只返回 cateId、不返回 cateName，
// 需从全局分类树（已在 init-site 插件中预加载）反查分类名称。
// 例：cateId=37（公司新闻）→ [新闻中心, 公司新闻]
const categoryTrail = computed(() => findCategoryPath(store.cateList, article.value.cateId))

// 频道页只在顶层分类数组中查找（详见 pages/channel/[id].vue），
// 传二级分类 ID 会得到空列表页面，因此链接统一指向一级分类 ID
const channelId = computed(() => categoryTrail.value[0]?.id)

// 文章实际所属分类名（取层级最末一级），供 SEO / 结构化数据使用
const cateName = computed(() =>
  categoryTrail.value.length
    ? categoryTrail.value[categoryTrail.value.length - 1].name
    : ''
)

// 文章正文消毒（SSR 兼容：客户端用 DOMPurify，服务端透传）
const sanitizedDetail = computed(() => sanitize(article.value.detail || ''))

// v-html 内容容器的 ref（用于给正文图片添加 loading="lazy"）
const contentRef = ref<HTMLElement | null>(null)

// 给正文中的 <img> 添加 loading="lazy"（v-html 内容不受 Vue 管理，需手动处理）
const lazyLoadContentImages = () => {
  nextTick(() => {
    if (!contentRef.value) return
    contentRef.value.querySelectorAll('img:not([loading])').forEach(img => {
      img.setAttribute('loading', 'lazy')
    })
  })
}

onMounted(lazyLoadContentImages)
watch(sanitizedDetail, lazyLoadContentImages)

// SEO：在数据加载后注入，确保 SSR HTML 中包含真实文章标题
useSeo({
  title: `${article.value.title || '文章详情'} - 陕西有色驼城建设有限公司`,
  description: article.value.description || article.value.title || '',
  keywords: `${article.value.title},${cateName.value},陕西有色驼城建设有限公司`,
  url: `${config.public.siteUrl}/detail/${articleId.value}`,
  image: article.value.header || '',
  type: 'article'
})

useBreadcrumbJsonLd([
  { name: '首页', url: config.public.siteUrl as string },
  // 与页面面包屑保持一致：层级来自分类树，链接指向一级分类频道页
  ...categoryTrail.value.map(crumb => ({
    name: crumb.name,
    url: `${config.public.siteUrl}/channel/${channelId.value}`
  })),
  { name: article.value.title || '正文', url: `${config.public.siteUrl}/detail/${articleId.value}` }
])

useArticleJsonLd({
  id: articleId.value,
  title: article.value.title || '',
  description: article.value.description,
  header: article.value.header,
  author: article.value.author,
  createTime: article.value.createTime,
  time: article.value.time,
  cateId: article.value.cateId,
  cateName: cateName.value
})
</script>

<style scoped lang="scss">
/* page.css 中 .m-dttexts img max-width:100% 已设置
   这里仅补充 v-html 内容中可能的元素间距 */
.m-dttexts :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
}

.m-dttexts :deep(img:hover) {
  box-shadow: var(--shadow-md);
}

.m-dttexts :deep(p) {
  margin-top: 16px;
  line-height: var(--line-height-loose);
  color: var(--text-secondary);
}

.m-dttexts :deep(h2),
.m-dttexts :deep(h3),
.m-dttexts :deep(h4) {
  color: var(--text-primary);
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 12px;
  line-height: var(--line-height-snug);
}

.m-dttexts :deep(h2) { font-size: 22px; }
.m-dttexts :deep(h3) { font-size: 18px; }
.m-dttexts :deep(h4) { font-size: 16px; }

.m-dttexts :deep(table) {
  border-collapse: collapse;
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin: 16px 0;
  width: 100%;
}

.m-dttexts :deep(td),
.m-dttexts :deep(th) {
  border: 1px solid var(--border-dark);
  padding: 10px 14px;
  line-height: var(--line-height-normal);
}

.m-dttexts :deep(th) {
  background-color: var(--bg-muted);
  font-weight: 600;
  color: var(--text-primary);
}

.m-dttexts :deep(a) {
  color: var(--brand-primary);
  text-decoration: underline;
  transition: color var(--transition-fast);
}

.m-dttexts :deep(a:hover) {
  color: var(--brand-primary-light);
}

.m-dttexts :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 20px;
  border-left: 4px solid var(--brand-primary);
  background-color: var(--brand-primary-lighter);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.m-dttexts :deep(ul),
.m-dttexts :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
  line-height: var(--line-height-loose);
  color: var(--text-secondary);
}

.m-dttexts :deep(li) {
  margin: 6px 0;
}
</style>
