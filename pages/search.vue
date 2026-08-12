<template>
  <div>
    <div class="is-main f-mb15" role="main">
      <div class="container">
        <!-- 面包屑 -->
        <nav class="m-location f-mb10" aria-label="面包屑导航">
          <span>当前位置：</span>
          <NuxtLink to="/" target="_blank">网站首页</NuxtLink> &gt;
          <a aria-current="page">站内搜索</a>
        </nav>

        <div class="m-pgpdbox1">
          <div class="m-listrg" style="min-height: 400px; background: #fff;">
            <!-- 搜索框 -->
            <div class="m-searchtop">
              <form class="u-searchkey" @submit.prevent="handleSearch">
                <span>搜索关键词：{{ keyword || '全部' }}</span>
                <div class="u-search-form">
                  <input
                    v-model="searchInput"
                    type="search"
                    placeholder="多个关键词用空格分隔，如：建设 招标"
                    aria-label="搜索关键词"
                  >
                  <button type="submit">搜索</button>
                </div>
              </form>
            </div>

            <!-- 搜索结果 -->
            <div class="m-searchlists">
              <!-- 加载中 -->
              <div v-if="pending" class="u-loading" aria-busy="true" aria-live="polite">
                <span class="loading-text">正在搜索...</span>
              </div>

              <!-- 搜索结果列表 -->
              <template v-else-if="results.length > 0">
                <p class="u-result-info" aria-live="polite">
                  共找到 <strong>{{ total }}</strong> 条与
                  <strong class="u-keyword">{{ keyword }}</strong>
                  相关的结果
                </p>
                <ul>
                  <li v-for="(item, index) in results" :key="index" class="u-search-item">
                    <NuxtLink
                      :to="`/detail/${item.id}`"
                      class="u-item-thumb"
                      target="_blank"
                      :aria-label="`查看文章：${item.title}`"
                    >
                      <img
                        v-if="item.header"
                        :src="item.header"
                        :alt="item.title"
                        loading="lazy"
                      >
                      <span v-else class="u-thumb-placeholder" aria-hidden="true" />
                    </NuxtLink>
                    <div class="u-item-body">
                      <NuxtLink
                        :to="`/detail/${item.id}`"
                        class="u-tit"
                        target="_blank"
                        v-html="highlightKeyword(item.title, keyword)"
                      />
                      <div class="u-infos">
                        <span v-if="item.cateName">栏目：{{ item.cateName }}</span>
                        <span v-if="item.createTime">{{ formDate(item.createTime) }}</span>
                      </div>
                      <p v-if="item.description" class="u-desc" v-html="highlightKeyword(truncate(item.description, 120), keyword)" />
                      <div class="u-url">
                        <NuxtLink :to="`/detail/${item.id}`" target="_blank">
                          {{ siteUrl }}/detail/{{ item.id }}
                        </NuxtLink>
                      </div>
                    </div>
                  </li>
                </ul>

                <!-- 加载更多（无限滚动触发器） -->
                <div
                  v-if="hasMore"
                  ref="loadMoreRef"
                  class="u-load-more"
                  :aria-busy="loadingMore"
                >
                  <span v-if="loadingMore" class="u-loading-more-text">
                    <span class="u-spinner" aria-hidden="true" />
                    正在加载更多...
                  </span>
                  <span v-else class="u-load-more-hint">向下滚动加载更多</span>
                </div>

                <!-- 已加载全部 -->
                <div v-else class="u-load-end">
                  <span class="u-load-end-line" />
                  <span class="u-load-end-text">已加载全部</span>
                  <span class="u-load-end-line" />
                </div>
              </template>

              <!-- 无结果 + 推荐 -->
              <div v-else-if="keyword && !pending" class="u-empty">
                <p class="u-empty-title">未找到与 <strong class="u-keyword">{{ keyword }}</strong> 相关的内容</p>
                <p class="u-empty-desc">建议：</p>
                <ul class="u-empty-tips">
                  <li>检查关键词是否正确</li>
                  <li>尝试使用更简短的关键词</li>
                  <li>多个关键词用空格分隔，如「建设 招标」</li>
                </ul>

                <!-- 推荐文章 -->
                <div v-if="recommendList.length > 0" class="u-recommend">
                  <h3 class="u-recommend-tit">为您推荐</h3>
                  <ul class="u-recommend-list">
                    <li v-for="(item, index) in recommendList" :key="index">
                      <NuxtLink :to="`/detail/${item.id}`" target="_blank">
                        {{ item.title }}
                      </NuxtLink>
                      <span v-if="item.createTime" class="u-recommend-date">{{ formDate(item.createTime) }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- 初始状态 + 推荐 -->
              <div v-else class="u-empty">
                <p class="u-empty-title">请在上方输入关键词进行搜索</p>
                <p class="u-empty-tip">支持多个关键词用空格分隔，如「建设 招标」</p>

                <div v-if="recommendList.length > 0" class="u-recommend">
                  <h3 class="u-recommend-tit">最新文章</h3>
                  <ul class="u-recommend-list">
                    <li v-for="(item, index) in recommendList" :key="index">
                      <NuxtLink :to="`/detail/${item.id}`" target="_blank">
                        {{ item.title }}
                      </NuxtLink>
                      <span v-if="item.createTime" class="u-recommend-date">{{ formDate(item.createTime) }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SearchResult {
  id: number | string
  title: string
  description?: string
  createTime?: string
  cateName?: string
  header?: string
}

interface SearchResponse {
  code: number
  data: {
    list: SearchResult[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
    keyword: string
    recommend?: SearchResult[]
  }
}

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const siteUrl = config.public.siteUrl as string

// 首次加载 15 条，后续每次 10 条
const FIRST_PAGE_SIZE = 15
const MORE_PAGE_SIZE = 10

// 从 URL 读取参数
const keyword = ref((route.query.q as string) || '')
const searchInput = ref(keyword.value)

// 已加载的全部结果（累积）
const results = ref<SearchResult[]>([])
const total = ref(0)
const hasMore = ref(false)
const loadingMore = ref(false)
const recommendList = ref<SearchResult[]>([])

// 首次搜索（SSR + 关键词切换时重置）
const { data: searchData, pending } = await useAsyncData(
  'search',
  async () => {
    if (!keyword.value) {
      const res = await $fetch<SearchResponse>('/api/search', {
        params: { q: '', page: 1, pageSize: FIRST_PAGE_SIZE }
      })
      return res.data
    }
    const res = await $fetch<SearchResponse>('/api/search', {
      params: { q: keyword.value, page: 1, pageSize: FIRST_PAGE_SIZE }
    })
    return res.data
  },
  { watch: [keyword] }
)

// 首次数据加载后初始化累积列表
// immediate: true 保证 SSR 阶段已加载的数据能同步到 results（否则 watcher 在 hydration 时不会触发，导致列表为空）
watch(searchData, (val) => {
  if (val) {
    results.value = val.list
    total.value = val.total
    hasMore.value = val.hasMore
    recommendList.value = val.recommend || []
    // 关键词切换时重置滚动加载状态
    loadingMore.value = false
  }
}, { immediate: true })

// 无限滚动：IntersectionObserver 触发加载更多
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value || !keyword.value) return
  loadingMore.value = true
  try {
    // 使用 offset 直接指定偏移量，避免 page 计算混乱
    const offset = results.value.length
    const res = await $fetch<SearchResponse>('/api/search', {
      params: { q: keyword.value, offset, pageSize: MORE_PAGE_SIZE }
    })
    // 追加到已有列表（保留已加载数据，不重复）
    const existingIds = new Set(results.value.map(r => r.id))
    const newItems = res.data.list.filter(r => !existingIds.has(r.id))
    results.value.push(...newItems)
    total.value = res.data.total
    hasMore.value = res.data.hasMore
  } catch (e) {
    console.error('[search] 加载更多失败:', e)
  } finally {
    loadingMore.value = false
  }
}

// 设置 IntersectionObserver
onMounted(() => {
  if (loadMoreRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(loadMoreRef.value)
  }
})

// 监听 loadMoreRef 出现/消失，重新绑定 observer
watch(loadMoreRef, (el) => {
  if (observer) observer.disconnect()
  if (el) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

// 搜索
const handleSearch = () => {
  const q = searchInput.value.trim()
  if (!q) return
  keyword.value = q
  router.push({ query: { q } })
}

// 监听 URL 变化（浏览器后退/前进）
watch(() => route.query, (newQuery) => {
  keyword.value = (newQuery.q as string) || ''
  searchInput.value = keyword.value
}, { deep: true })

// #2 XSS 防护：先转义 HTML，再做高亮替换
const escapeHtml = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 关键词高亮（转义后再高亮，避免 XSS）
const highlightKeyword = (text: string, kw: string) => {
  if (!text) return ''
  const escaped = escapeHtml(text)
  if (!kw) return escaped
  const keywords = kw.split(/\s+/).filter(Boolean).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  let result = escaped
  for (const k of keywords) {
    result = result.replace(new RegExp(k, 'gi'), (match) => `<strong class="u-highlight">${match}</strong>`)
  }
  return result
}

// 截断描述
const truncate = (text: string, max: number) => {
  if (!text) return ''
  return text.length > max ? text.substr(0, max) + '...' : text
}

// 日期格式化
const formDate = (date: string) => {
  if (!date) return ''
  return date.substr(0, 10)
}

// SEO
useSeoMeta({
  title: `搜索${keyword.value ? `：${keyword.value}` : ''} - 陕西有色驼城建设有限公司`,
  description: '陕西有色驼城建设有限公司网站站内搜索',
  robots: 'noindex, follow'
})

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/search` }]
})
</script>

<style scoped lang="scss">
/* ============================================
 * 设计令牌（企业品牌色系）
 * ========================================== */
$primary: #005f96;
$primary-dark: #003d5c;
$primary-light: #e8f1f8;
$text-primary: #1a2332;
$text-secondary: #5a6573;
$text-tertiary: #8a94a3;
$bg-page: #f5f7fa;
$bg-card: #ffffff;
$border-color: #e8ecf0;
$shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
$shadow-md: 0 4px 16px rgba(15, 23, 42, 0.08);
$shadow-lg: 0 8px 24px rgba(0, 95, 150, 0.12);
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-pill: 999px;

/* ============================================
 * 页面容器
 * ========================================== */
.is-main {
  background: $bg-page;
  min-height: calc(100vh - 200px);
  padding-bottom: 30px;
}

.m-listrg {
  width: auto !important;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: $radius-lg !important;
  overflow: hidden;
  box-shadow: $shadow-md;
}

/* ============================================
 * 搜索栏（现代化大圆角设计）
 * ========================================== */
.m-searchtop {
  padding: 32px 40px !important;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  border-bottom: none;
  line-height: 1.6 !important;
}

.u-searchkey {
  > span {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-bottom: 16px;
    letter-spacing: 0.5px;
  }
}

.u-search-form {
  display: flex;
  gap: 12px;
  max-width: 640px;

  input[type="search"] {
    flex: 1;
    height: 52px;
    box-sizing: border-box;
    -webkit-appearance: none;
    appearance: none;
    padding: 0 24px 0 52px;
    border: 2px solid transparent;
    border-radius: $radius-pill;
    font-size: 16px;
    color: $text-primary;
    background: #fff url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238a94a3'><path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/></svg>") 18px center / 20px no-repeat;
    outline: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      border-color: #fff;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.25), 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }

  button {
    height: 52px;
    box-sizing: border-box;
    padding: 0 32px;
    background: #fff;
    color: $primary;
    border: none;
    border-radius: $radius-pill;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    white-space: nowrap;

    &:hover {
      background: $primary-light;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

/* ============================================
 * 搜索结果区域
 * ========================================== */
.m-searchlists {
  padding: 0 40px 40px !important;
}

/* 结果统计信息 */
.u-result-info {
  padding: 24px 0 16px;
  font-size: 14px;
  color: $text-secondary;
  border-bottom: 1px solid $border-color;
  margin-bottom: 8px;

  strong {
    color: $primary;
    font-weight: 600;
    font-size: 16px;
  }
}

.u-keyword {
  color: $primary !important;
}

/* ============================================
 * 搜索结果卡片
 * ========================================== */
.m-searchlists ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.u-search-item {
  display: flex;
  align-items: flex-start;
  padding: 24px 20px !important;
  margin: 12px 0;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: $shadow-sm;

  &:hover {
    border-color: rgba(0, 95, 150, 0.3);
    box-shadow: $shadow-lg;
    transform: translateY(-2px);
  }
}

/* 缩略图 */
.u-item-thumb {
  flex-shrink: 0;
  display: block;
  width: 140px;
  height: 90px;
  margin-right: 20px;
  overflow: hidden;
  background: $primary-light;
  border-radius: $radius-sm;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover img {
    transform: scale(1.08);
  }
}

.u-thumb-placeholder {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, $primary-light 0%, #dce8f3 100%);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 36px;
    height: 36px;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23005f96' opacity='0.4'><path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/></svg>") center / contain no-repeat;
  }
}

/* 结果正文 */
.u-item-body {
  flex: 1;
  min-width: 0;

  .u-tit {
    display: block;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.5;
    color: $text-primary;
    margin-bottom: 8px;
    transition: color 0.2s;

    &:hover {
      color: $primary;
    }
  }

  .u-infos {
    display: flex;
    align-items: center;
    padding: 4px 0 8px;
    font-size: 13px;
    color: $text-tertiary;

    span {
      margin-right: 20px;
      position: relative;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: -10px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: $text-tertiary;
        opacity: 0.5;
      }
    }
  }

  .u-desc {
    margin: 4px 0 8px;
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.7;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .u-url a {
    display: inline-block;
    font-size: 13px;
    color: #4ea63d;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100%;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}

/* 高亮关键词 */
:deep(.u-highlight) {
  color: $primary;
  background: $primary-light;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 600;
}

/* ============================================
 * 加载状态
 * ========================================== */
.u-loading {
  padding: 80px 0;
  text-align: center;

  .loading-text {
    font-size: 15px;
    color: $text-tertiary;
    position: relative;
    display: inline-block;

    &::after {
      content: '...';
      animation: loadingDots 1.4s infinite;
    }
  }
}

@keyframes loadingDots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

/* ============================================
 * 空结果状态
 * ========================================== */
.u-empty {
  padding: 60px 20px;
  text-align: center;

  .u-empty-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12px;

    .u-keyword {
      color: $primary;
    }
  }

  .u-empty-tip {
    font-size: 14px;
    color: $text-tertiary;
    margin-bottom: 24px;
  }

  .u-empty-desc {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .u-empty-tips {
    display: inline-block;
    text-align: left;
    font-size: 13px;
    color: $text-tertiary;
    line-height: 2;
    padding: 16px 24px;
    background: $bg-page;
    border-radius: $radius-md;
  }
}

/* ============================================
 * 推荐文章模块
 * ========================================== */
.u-recommend {
  margin: 32px auto 0;
  max-width: 640px;
  padding: 28px 32px;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  text-align: left;
  box-shadow: $shadow-sm;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: $shadow-md;
  }

  .u-recommend-tit {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: $primary;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid $primary-light;

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 18px;
      background: $primary;
      border-radius: 2px;
      margin-right: 10px;
    }
  }

  .u-recommend-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      padding: 10px 0;
      font-size: 14px;
      line-height: 1.6;
      border-bottom: 1px dashed $border-color;
      transition: padding-left 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        padding-left: 6px;
      }

      &::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: $primary;
        margin-right: 12px;
        flex-shrink: 0;
        opacity: 0.6;
        transition: opacity 0.2s;
      }

      &:hover::before {
        opacity: 1;
      }

      a {
        flex: 1;
        color: $text-primary;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        transition: color 0.2s;

        &:hover {
          color: $primary;
        }
      }

      .u-recommend-date {
        flex-shrink: 0;
        margin-left: 12px;
        color: $text-tertiary;
        font-size: 12px;
      }
    }
  }
}

/* ============================================
 * 无限滚动：加载更多触发器
 * ========================================== */
.u-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0 16px;
  min-height: 60px;
}

.u-loading-more-text {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  color: $text-tertiary;
}

.u-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid $primary-light;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
  to { transform: rotate(360deg); }
}

.u-load-more-hint {
  font-size: 13px;
  color: $text-tertiary;
  opacity: 0.7;
}

/* ============================================
 * 无限滚动：已加载全部
 * ========================================== */
.u-load-end {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0 16px;
  gap: 16px;
}

.u-load-end-line {
  flex: 0 1 80px;
  height: 1px;
  background: linear-gradient(to right, transparent, $border-color, transparent);
}

.u-load-end-text {
  font-size: 13px;
  color: $text-tertiary;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* ============================================
 * 面包屑
 * ========================================== */
.m-location {
  padding: 16px 0 16px 28px !important;
  background-position: left 18px !important;
  margin-bottom: 8px !important;

  a {
    transition: color 0.2s;
  }
}

/* ============================================
 * 响应式适配
 * ========================================== */

/* 平板（≤991px） */
@media (max-width: 991px) {
  .m-searchtop {
    padding: 28px 28px !important;
  }

  .m-searchlists {
    padding: 0 28px 32px !important;
  }

  .u-item-thumb {
    width: 120px;
    height: 80px;
    margin-right: 16px;
  }
}

/* 移动端（≤767px） */
@media (max-width: 767px) {
  .is-main {
    padding-bottom: 20px;
  }

  .m-searchtop {
    padding: 24px 20px !important;
  }

  .m-searchlists {
    padding: 0 16px 24px !important;
  }

  .u-search-form {
    flex-direction: column;
    gap: 12px;

    input[type="search"] {
      max-width: 100%;
      width: 100%;
      height: 48px !important;
      min-height: 48px !important;
      max-height: 48px !important;
      line-height: 48px;
      box-sizing: border-box !important;
      -webkit-appearance: none !important;
      appearance: none !important;
      padding: 0 24px 0 52px !important;
      font-size: 15px;
    }

    button {
      width: 100%;
      height: 48px !important;
      min-height: 48px !important;
      max-height: 48px !important;
      line-height: 48px;
      box-sizing: border-box !important;
    }
  }

  /* 卡片布局调整 */
  .u-search-item {
    padding: 16px 12px !important;
    margin: 10px 0;
  }

  .u-item-thumb {
    width: 96px;
    height: 64px;
    margin-right: 12px;
    border-radius: 6px;
  }

  .u-item-body {
    .u-tit {
      font-size: 15px;
      line-height: 1.45;
      margin-bottom: 6px;
    }

    .u-infos {
      font-size: 12px;
      padding: 2px 0 6px;

      span {
        margin-right: 12px;
      }
    }

    .u-desc {
      font-size: 13px;
      -webkit-line-clamp: 2;
    }

    .u-url {
      display: none;
    }
  }

  /* 推荐模块 */
  .u-recommend {
    margin: 24px 0 0;
    padding: 20px;
  }

  /* 无限滚动提示 */
  .u-load-more,
  .u-load-end {
    padding: 24px 0 12px;
  }

  .u-load-end-line {
    flex-basis: 60px;
  }

  /* 空结果 */
  .u-empty {
    padding: 40px 16px;

    .u-empty-tips {
      padding: 12px 16px;
    }
  }
}

/* 超小屏（≤480px） */
@media (max-width: 480px) {
  .u-search-item {
    padding: 12px 10px !important;
  }

  .u-item-thumb {
    width: 80px;
    height: 56px;
    margin-right: 10px;
  }

  .u-item-body {
    .u-tit {
      font-size: 14px;
    }

    .u-desc {
      display: none;
    }
  }
}
</style>
