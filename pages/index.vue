<template>
  <div>
    <!-- H1 标签（修复原首页缺失 H1 的 SEO 问题） -->
    <h1 class="visually-hidden">{{ siteInfo.name }}官方网站 - 专注矿山建设、土木工程、市政工程</h1>

    <!-- Banner 轮播（Vue 驱动自动播放，不依赖 Bootstrap JS） -->
    <section v-if="banner.length > 0" class="container banner-container" aria-label="首页 Banner">
      <div
        class="carousel slide m-banner"
        @mouseenter="pauseBanner"
        @mouseleave="resumeBanner"
      >
        <div class="bd carousel-inner" :style="{ transform: `translateX(-${currentBanner * 100}%)` }">
          <div
            v-for="(item, index) in banner"
            :key="index"
            class="carousel-item"
            :class="{ active: index === currentBanner }"
          >
            <img
              :src="item"
              alt="陕西有色驼城建设有限公司 banner"
              :loading="index === 0 ? 'eager' : 'lazy'"
            >
          </div>
        </div>
        <!-- 左右控制按钮 -->
        <button v-if="banner.length > 1" class="carousel-control-prev" type="button" @click="prevBanner">
          <span class="carousel-control-prev-icon" aria-hidden="true" />
          <span class="visually-hidden">上一张</span>
        </button>
        <button v-if="banner.length > 1" class="carousel-control-next" type="button" @click="nextBanner">
          <span class="carousel-control-next-icon" aria-hidden="true" />
          <span class="visually-hidden">下一张</span>
        </button>
        <!-- 指示器 -->
        <ol v-if="banner.length > 1" class="hd carousel-indicators">
          <li
            v-for="(item, index) in banner"
            :key="index"
            :class="{ on: index === currentBanner }"
            @click="goToBanner(index)"
          />
        </ol>
      </div>
    </section>

    <!-- 主体内容 -->
    <div class="is-main">
      <div class="container">
        <!-- 推荐文章模块（沿用原 .m-work 结构） -->
        <div v-if="recommendArticle.length > 0" class="m-work f-mb20">
          <!-- Sticky on Top：渐变切换显示所有推荐文章标题 -->
          <div
            v-if="recommendArticle.length > 1"
            class="u-workt f-db workt-fade-wrap"
            @mouseenter="pauseTitleScroll"
            @mouseleave="resumeTitleScroll"
          >
            <NuxtLink
              v-for="(item, index) in recommendArticle"
              :key="index"
              :to="`/detail/${item.id}`"
              class="workt-fade-item"
              :class="{ 'is-current': index === currentTitleIndex }"
              target="_blank"
            >
              {{ item.title }}
            </NuxtLink>
          </div>
          <!-- 只有一条推荐文章时，保持原静态标题样式 -->
          <NuxtLink
            v-else
            :to="`/detail/${recommendArticle[0].id}`"
            class="u-workt f-db"
            target="_blank"
          >
            {{ recommendArticle[0].title }}
          </NuxtLink>

          <div class="u-workc row f-clearfix">
            <!-- 左侧推荐文章轮播（Vue 驱动自动播放，不依赖 Bootstrap JS） -->
            <div class="u-workl col-md-6">
              <div
                v-if="recommendArticle.length > 1"
                class="carousel slide bd"
                @mouseenter="pauseCarousel"
                @mouseleave="resumeCarousel"
              >
                <div class="carousel-inner" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                  <div
                    v-for="(item, index) in recommendArticle"
                    :key="index"
                    class="carousel-item"
                    :class="{ active: index === currentSlide }"
                  >
                    <NuxtLink :to="`/detail/${item.id}`" class="f-pr f-db" target="_blank">
                      <img
                        :src="item.header || ''"
                        :alt="item.title"
                        loading="lazy"
                      >
                      <p>{{ item.description }}</p>
                    </NuxtLink>
                  </div>
                </div>
                <!-- 指示器 -->
                <ol v-if="recommendArticle.length > 1" class="carousel-indicators">
                  <li
                    v-for="(item, index) in recommendArticle"
                    :key="index"
                    :class="{ active: index === currentSlide }"
                    @click="goToSlide(index)"
                  />
                </ol>
              </div>
            </div>

            <!-- 右侧推荐分类切换 + 文章列表 -->
            <div
              class="u-workr f-md-ha col-md-6"
              @mouseenter="!isMobile && stopRecommend()"
              @mouseleave="!isMobile && startRecommend()"
            >
              <div class="u-workrt">
                <ul class="f-clearfix">
                  <li
                    v-for="(recommendItem, recommendIndex) in recommendCate.slice(0, 4)"
                    :key="recommendIndex"
                    :class="{ on: recommendIndex === activeRecommendIndex }"
                    @mouseenter="!isMobile && handleRecommend(recommendIndex)"
                    @click="isMobile && handleRecommend(recommendIndex)"
                  >
                    <NuxtLink
                      class="f-db"
                      :to="`/channel/${recommendItem.pid || recommendItem.id}`"
                      target="_blank"
                    >{{ recommendItem.name }}</NuxtLink>
                  </li>
                </ul>
              </div>

              <div class="u-workroutc">
                <div class="u-workrc">
                  <div
                    v-for="(articleItem, articleIndex) in currentArticleList.slice(0, 4)"
                    :key="activeRecommendIndex + '-' + articleItem.id"
                    class="u-workrclist"
                  >
                    <div class="u-time">
                      <p>{{ formDay(articleItem.createTime) }}</p>
                      <p>{{ formDate(articleItem.createTime) }}</p>
                    </div>
                    <div class="u-workrc1">
                      <NuxtLink :to="`/detail/${articleItem.id}`" target="_blank">{{ articleItem.title }}</NuxtLink>
                      <p>{{ articleItem.description }}</p>
                    </div>
                    <div class="u-more">
                      <NuxtLink :to="`/detail/${articleItem.id}`" class="f-db" target="_blank" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 广告位 -->
        <div v-if="false" class="m-adv f-mb20 c-shine f-pr f-oh">
          <img src="~/assets/images/20210108090736.EPUgNvaerTyG.png" alt="" loading="lazy">
        </div>

        <!-- 普通分类列表（偶数情况，全部以 .u-listhome 卡片展示） -->
        <div v-if="parityFlag" class="m-listhome row">
          <div
            v-for="(normalItem, normalIndex) in normalCate"
            :key="normalIndex"
            class="col-md-6 f-mb20"
          >
            <div class="u-listhome f-md-ha">
              <div class="u-listhomet f-mb10">
                <NuxtLink :to="`/channel/${normalItem.id}`" class="u-listhometl" target="_blank">{{ normalItem.name }}</NuxtLink>
                <NuxtLink :to="`/channel/${normalItem.id}`" class="u-listhometr" target="_blank">MORE+</NuxtLink>
              </div>
              <div class="u-listhomec">
                <ul>
                  <li
                    v-for="(articleItem, articleIndex) in normalItem.articleList"
                    :key="articleIndex"
                    class="f-clearfix"
                  >
                    <NuxtLink
                      :title="articleItem.title"
                      class="f-db f-fl"
                      :to="`/detail/${articleItem.id}`"
                      target="_blank"
                    >
                      {{ articleItem.title }}
                    </NuxtLink>
                    <span class="f-fr">{{ formDate(articleItem.createTime) }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 普通分类列表（奇数情况：前 n-1 个用 .u-listhome，最后 1 个用 .m-jianshe 横向滚动） -->
        <div v-if="!parityFlag" class="m-listhome row">
          <div
            v-for="(normalItem, normalIndex) in normalCate.slice(0, normalCate.length - 1)"
            :key="normalIndex"
            class="col-md-6 f-mb20"
          >
            <div class="u-listhome f-md-ha">
              <div class="u-listhomet f-mb10">
                <NuxtLink :to="`/channel/${normalItem.id}`" class="u-listhometl" target="_blank">{{ normalItem.name }}</NuxtLink>
                <NuxtLink :to="`/channel/${normalItem.id}`" class="u-listhometr" target="_blank">MORE+</NuxtLink>
              </div>
              <div class="u-listhomec">
                <ul>
                  <li
                    v-for="(articleItem, articleIndex) in normalItem.articleList"
                    :key="articleIndex"
                    class="f-clearfix"
                  >
                    <NuxtLink
                      :title="articleItem.title"
                      class="f-db f-fl"
                      :to="`/detail/${articleItem.id}`"
                      target="_blank"
                    >
                      {{ articleItem.title }}
                    </NuxtLink>
                    <span class="f-fr">{{ formDate(articleItem.createTime) }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!parityFlag && lastNormalCate" class="m-jianshe f-mb20 f-pr f-oh">
          <div class="u-listhomet f-mb10">
            <NuxtLink :to="`/channel/${lastNormalCate.id}`" class="u-listhometl" target="_blank">{{ lastNormalCate.name }}</NuxtLink>
            <NuxtLink :to="`/channel/${lastNormalCate.id}`" class="u-listhometr" target="_blank">MORE+</NuxtLink>
          </div>
          <div class="u-jianshe">
            <div class="scroll-container">
              <ul class="scroll-content">
                <li
                  v-for="(articleItem, articleIndex) in jiansheScrollList"
                  :key="articleIndex"
                >
                  <NuxtLink
                    :title="lastNormalCate.name"
                    class="f-db"
                    :to="`/detail/${articleItem.id}`"
                    target="_blank"
                  >
                    <div class="u-jiansheimg">
                      <img :src="articleItem.header" :alt="articleItem.title" loading="lazy">
                    </div>
                    <p>{{ articleItem.title }}</p>
                  </NuxtLink>
                </li>
              </ul>
              <!-- 复制一份用于无缝循环 -->
              <ul class="scroll-content" aria-hidden="true">
                <li
                  v-for="(articleItem, articleIndex) in jiansheScrollList"
                  :key="`${articleIndex}-copy`"
                >
                  <NuxtLink
                    :title="lastNormalCate.name"
                    class="f-db"
                    :to="`/detail/${articleItem.id}`"
                    target="_blank"
                  >
                    <div class="u-jiansheimg">
                      <img :src="articleItem.header" :alt="articleItem.title" loading="lazy">
                    </div>
                    <p>{{ articleItem.title }}</p>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 友情链接模块 -->
        <div v-if="friendLinks.length > 0" class="m-friend-links f-mb20">
          <div class="u-listhomet f-clearfix">
            <a class="u-listhometl f-db f-fl">友情链接</a>
          </div>
          <div class="u-friend-links">
            <ul class="f-clearfix">
              <li v-for="(link, index) in friendLinks" :key="index">
                <a :href="link.url" target="_blank" rel="noopener noreferrer" class="f-db">
                  {{ link.name }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Article, Category } from '~/stores/site'
import { debounce } from '~/utils'

const config = useRuntimeConfig()
const store = useSiteStore()
const siteInfo = computed(() => store.siteInfo)

const banner = computed<string[]>(() => (siteInfo.value.banner as string[]) || [])

// 本地状态（仅客户端交互用）
const activeRecommendIndex = ref(0)
const isMobile = ref(false)

// 首页 Banner 轮播状态
const currentBanner = ref(0)
let bannerTimer: ReturnType<typeof setInterval> | null = null

const startBanner = () => {
  if (import.meta.server) return
  if (banner.value.length <= 1) return
  stopBanner()
  bannerTimer = setInterval(() => {
    currentBanner.value = (currentBanner.value + 1) % banner.value.length
  }, 4000)
}

const stopBanner = () => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

const pauseBanner = () => {
  stopBanner()
}

const resumeBanner = () => {
  startBanner()
}

const goToBanner = (index: number) => {
  currentBanner.value = index
  startBanner()
}

const prevBanner = () => {
  currentBanner.value = (currentBanner.value - 1 + banner.value.length) % banner.value.length
  startBanner()
}

const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banner.value.length
  startBanner()
}

// 左侧推荐文章轮播状态
const currentSlide = ref(0)
let carouselTimer: ReturnType<typeof setInterval> | null = null

const startCarousel = () => {
  // 仅在客户端且有多张图片时启动
  if (import.meta.server) return
  if (recommendArticle.value.length <= 1) return
  stopCarousel()
  carouselTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % recommendArticle.value.length
  }, 3000)
}

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

const pauseCarousel = () => {
  stopCarousel()
}

const resumeCarousel = () => {
  startCarousel()
}

const goToSlide = (index: number) => {
  currentSlide.value = index
  // 点击后重新计时，避免立刻跳走
  startCarousel()
}

// 置顶推荐文章标题轮播状态（垂直滚动切换所有标题）
const currentTitleIndex = ref(0)
let titleTimer: ReturnType<typeof setInterval> | null = null

const startTitleScroll = () => {
  if (import.meta.server) return
  if (recommendArticle.value.length <= 1) return
  stopTitleScroll()
  titleTimer = setInterval(() => {
    currentTitleIndex.value = (currentTitleIndex.value + 1) % recommendArticle.value.length
  }, 3000)
}

const stopTitleScroll = () => {
  if (titleTimer) {
    clearInterval(titleTimer)
    titleTimer = null
  }
}

const pauseTitleScroll = () => {
  stopTitleScroll()
}

const resumeTitleScroll = () => {
  startTitleScroll()
}

// SEO：服务端注入 meta
useSeo({
  title: '【有色驼城】-陕西有色驼城建设有限公司',
  description: '陕西有色驼城建设有限公司官方网站 - 专注于矿山建设、土木工程、市政工程等领域，提供专业的工程建设服务与解决方案',
  keywords: '陕西有色驼城建设有限公司,有色驼城,矿山建设,土木工程,市政工程,工程建设',
  url: config.public.siteUrl as string,
  type: 'website'
})

// 服务端获取数据（SSR 友好）
// 关键：使用 useAsyncData 返回的 data 作为数据源，客户端水合时从 payload 恢复
const { fetchIndexData, fetchFriendLinks } = useApi()

const { data: homeData } = await useAsyncData('home-data', async () => {
  const [indexRes, linksRes] = await Promise.all([
    fetchIndexData(config.public.siteId as number),
    fetchFriendLinks(config.public.siteId as number)
  ])
  return { indexRes, linksRes }
})

// 从 homeData 派生响应式数据（SSR 和客户端水合后都能正确访问）
const recommendArticle = computed<Article[]>(() => homeData.value?.indexRes?.recommendArticle || [])
const recommendCate = computed<(Category & { articleList: Article[] })[]>(() => homeData.value?.indexRes?.recommendCate || [])
const normalCate = computed<(Category & { articleList: Article[] })[]>(() => homeData.value?.indexRes?.normalCate || [])
const friendLinks = computed<{ url: string; name: string }[]>(() => homeData.value?.linksRes || [])

// 奇偶判断：奇数时把最后一项单独抽出来用 .m-jianshe 横向滚动展示
const parityFlag = computed(() => {
  return normalCate.value.length === 0 || (normalCate.value.length % 2) === 0
})

const lastNormalCate = computed(() => {
  if (parityFlag.value) return null
  return normalCate.value[normalCate.value.length - 1] || null
})

// 横向滚动文章列表：循环填充确保不出现空白（单份至少 10 条，两份共 20 条覆盖宽屏）
const jiansheScrollList = computed(() => {
  const list = lastNormalCate.value?.articleList || []
  if (list.length === 0) return []
  const minItems = 10
  if (list.length >= minItems) return list
  const result: typeof list = []
  while (result.length < minItems) {
    result.push(...list)
  }
  return result
})

const currentArticleList = computed(() => {
  return recommendCate.value[activeRecommendIndex.value]?.articleList || []
})

// 推荐分类自动切换：5秒切换，hover/点击时暂停
let recommendTimer: ReturnType<typeof setInterval> | null = null

const startRecommend = () => {
  if (import.meta.server) return
  if (recommendCate.value.length <= 1) return
  stopRecommend()
  recommendTimer = setInterval(() => {
    activeRecommendIndex.value = (activeRecommendIndex.value + 1) % recommendCate.value.length
  }, 5000)
}

const stopRecommend = () => {
  if (recommendTimer) {
    clearInterval(recommendTimer)
    recommendTimer = null
  }
}

// 推荐分类切换（手动）：切换后重启定时器
const handleRecommend = (index: number) => {
  activeRecommendIndex.value = index
  startRecommend()
}

// 日期格式化（保持原逻辑）
const formDate = (date: string) => {
  if (!date) return ''
  return date.substr(0, 10)
}

const formDay = (day: string) => {
  if (!day) return ''
  const dt = new Date(day)
  const d = dt.getDate()
  return d < 10 ? '0' + d : '' + d
}

// 防抖 resize
const checkMobile = debounce(() => {
  isMobile.value = window.innerWidth < 768
}, 200)

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile, { passive: true })
  // 启动 Banner 轮播
  startBanner()
  // 启动左侧推荐文章轮播
  startCarousel()
  // 启动置顶推荐文章标题滚动
  startTitleScroll()
  // 启动右侧推荐分类自动切换
  startRecommend()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
  // 清理轮播定时器
  stopBanner()
  stopCarousel()
  stopTitleScroll()
  stopRecommend()
})
</script>

<style scoped lang="scss">
/* Bootstrap 5 carousel-item 默认 display:none，激活时 display:block
   原 home.css 中 .m-banner .bd img 设定了固定高度，这里补充 carousel 必要样式 */

/* ============ Banner 容器：与主体内容宽度一致（复用 Bootstrap .container） ============ */
.banner-container {
  /* 宽度、居中、响应式 padding 均由 Bootstrap .container 类提供 */
  /* 此处仅补充 Banner 特有的外间距 */
  margin-bottom: var(--space-6);
}

.m-banner .carousel-item img {
  width: 100%;
  height: 420px;
  object-fit: cover;
  display: block;
}

.u-workl .carousel-item img {
  width: 100%;
  height: 410px;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.u-workl .carousel-item a:hover img {
  transform: scale(1.04);
}

.u-workl .carousel-item p {
  position: absolute;
  left: 10px;
  bottom: 0;
  width: 75%;
  line-height: 50px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-on-primary);
  z-index: 999;
}

/* ============ 轮播过渡动画（水平滑动） ============ */
/* Banner 轮播：卡片化 —— 圆角 + 阴影 + 标准比例 */
.m-banner.carousel {
  position: relative;
  overflow: hidden;
  height: 420px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-6);
}

/* 左侧推荐文章轮播：圆角 + 阴影，与 Banner 风格统一 */
.u-workl .carousel.slide {
  position: relative;
  overflow: hidden;
  height: 410px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

/* carousel-inner 作为 flex track，整体平移实现滑动 */
/* overflow 必须为 visible，由外层 carousel.slide 负责裁剪 */
.m-banner .carousel-inner,
.u-workl .carousel-inner {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  height: 100%;
  overflow: visible !important;
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
}

.m-banner .carousel-item,
.u-workl .carousel-item {
  display: block;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  /* 覆盖 Bootstrap 5 默认的 float:left + margin-right:-100%
     这两个属性会导致所有 carousel-item 叠加在同一位置 */
  float: none !important;
  margin-right: 0 !important;
}

/* 左侧推荐文章：p 文字绝对定位到 slide 底部（覆盖 home.css 中缺失 position 的规则） */
.u-workl .carousel-item a {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

.u-workl .carousel-item p {
  position: absolute !important;
  left: 0;
  bottom: 0;
  width: 100%;
  line-height: 50px;
  margin: 0;
  padding: 0 var(--space-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-on-primary);
  font-size: var(--font-size-md);
  z-index: 999;
  /* 渐变遮罩，增强文字可读性，更现代 */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 70%, transparent 100%);
}

/* ============ Banner 控制按钮（左右箭头）：圆形品牌色按钮 ============ */
/* 覆盖 Bootstrap 5 默认的全高透明按钮，改为精致的圆形按钮 */
.m-banner .carousel-control-prev,
.m-banner .carousel-control-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: var(--shadow-md);
  opacity: 0;
  z-index: 10;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition-base), background-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
}

.m-banner:hover .carousel-control-prev,
.m-banner:hover .carousel-control-next {
  opacity: 1;
}

.m-banner .carousel-control-prev {
  left: 20px;
}

.m-banner .carousel-control-next {
  right: 20px;
}

.m-banner .carousel-control-prev:hover,
.m-banner .carousel-control-next:hover {
  background-color: var(--brand-primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-50%) scale(1.08);
}

.m-banner .carousel-control-prev:active,
.m-banner .carousel-control-next:active {
  transform: translateY(-50%) scale(0.96);
}

/* 箭头图标：使用 SVG 雪碧图，颜色随按钮状态切换 */
.m-banner .carousel-control-prev-icon,
.m-banner .carousel-control-next-icon {
  width: 20px;
  height: 20px;
  background-color: var(--text-primary);
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  transition: background-color var(--transition-base);
}

.m-banner .carousel-control-prev-icon {
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/></svg>");
}

.m-banner .carousel-control-next-icon {
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/></svg>");
}

/* 悬停时图标变白 */
.m-banner .carousel-control-prev:hover .carousel-control-prev-icon,
.m-banner .carousel-control-next:hover .carousel-control-next-icon {
  background-color: var(--text-on-primary);
}

/* ============ Banner 指示器（优化后：胶囊形态，激活时拉长） ============ */
.m-banner .carousel-indicators {
  position: absolute;
  left: 50%;
  bottom: var(--space-5);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-2) var(--space-3);
  list-style: none;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.35);
  border-radius: var(--radius-pill);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.m-banner .carousel-indicators li {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  cursor: pointer;
  border: 0;
  text-indent: -9999em;
  overflow: hidden;
  transition: all var(--transition-slow);
}

.m-banner .carousel-indicators li:hover {
  background: rgba(255, 255, 255, 0.9);
}

.m-banner .carousel-indicators li.on {
  width: 28px;
  border-radius: var(--radius-sm);
  background: var(--text-on-primary);
}

/* ============ 左侧推荐文章轮播指示器 ============ */
.u-workl .carousel-indicators {
  position: absolute;
  right: var(--space-3);
  bottom: 60px;
  left: auto;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-1) var(--space-2);
  list-style: none;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-pill);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.u-workl .carousel-indicators li {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border: 0;
  text-indent: -9999em;
  overflow: hidden;
  transition: all var(--transition-slow);
}

.u-workl .carousel-indicators li:hover {
  background-color: rgba(255, 255, 255, 0.85);
}

.u-workl .carousel-indicators li.active {
  width: 22px;
  border-radius: var(--radius-sm);
  background-color: var(--text-on-primary);
}

/* ============ 置顶推荐文章标题：渐变切换（淡入淡出） ============ */
/* .u-workt 已提供 padding:30px / line-height:36px / font-size:30px / color / text-align
   所有标题项绝对定位重叠在同一位置，通过 opacity 切换显示 */
.workt-fade-wrap {
  position: relative;
  height: 96px; /* 30px(padding-top) + 36px(line-height) + 30px(padding-bottom) */
}

.workt-fade-item {
  position: absolute;
  top: 30px; /* 对应 .u-workt 的 padding-top */
  left: 0;
  right: 0;
  display: block;
  width: 100%;
  height: 36px;
  line-height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--brand-accent);
  text-align: center;
  text-decoration: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.6s ease, visibility 0.6s ease, color var(--transition-base);
  will-change: opacity;
}

.workt-fade-item.is-current {
  opacity: 1;
  visibility: visible;
}

.workt-fade-item:hover {
  color: var(--brand-accent);
  filter: brightness(0.85);
  text-decoration: none;
}

/* 移动端：沿用 home.css 中 .u-workt 在 638px 下的字号调整（padding 与 line-height 同步调整） */
@media (max-width: 638px) {
  .workt-fade-wrap {
    height: 56px; /* 10px(padding-top) + 36px(line-height) + 10px(padding-bottom) */
  }
  .workt-fade-item {
    top: 10px;
    font-size: 25px;
  }
}

/* 横向滚动容器（沿用原 .u-jianshe 无缝循环滚动，CSS animation 实现） */
.scroll-container {
  display: inline-flex;
  /* inline-flex 让容器根据内容撑开，translateX(-50%) 才等于一份 ul 的宽度，实现无缝衔接 */
  animation: scrollContent 60s linear infinite;
}

.scroll-container .scroll-content {
  display: flex;
  flex-shrink: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

.scroll-content li {
  flex-shrink: 0;
  width: 300px;
  margin-right: 20px;
}

@keyframes scrollContent {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 鼠标悬停暂停滚动 */
.m-jianshe:hover .scroll-container {
  animation-play-state: paused;
}

/* ============ 响应式：各屏幕尺寸轮播比例优化 ============ */
/* 平板端 (768-991px)：Banner 300px，保持 ~4:1 比例 */
@media (max-width: 991px) {
  .m-banner.carousel {
    height: 300px;
    margin-bottom: var(--space-5);
  }
  .m-banner .carousel-item img {
    height: 300px;
  }

  /* 平板端控制按钮始终可见（无 hover） */
  .m-banner .carousel-control-prev,
  .m-banner .carousel-control-next {
    width: 44px;
    height: 44px;
    opacity: 0.9;
  }
  .m-banner .carousel-control-prev {
    left: var(--space-3);
  }
  .m-banner .carousel-control-next {
    right: var(--space-3);
  }
}

/* 手机端 (≤767px)：Banner 220px，推荐文章 280px */
@media (max-width: 767px) {
  .m-banner.carousel {
    height: 220px;
    border-radius: var(--radius-md);
  }
  .m-banner .carousel-item img {
    height: 220px;
  }

  /* 指示器下移避开圆角 */
  .m-banner .carousel-indicators {
    bottom: var(--space-3);
    padding: var(--space-1) var(--space-2);
  }

  .m-banner .carousel-control-prev,
  .m-banner .carousel-control-next {
    width: 40px;
    height: 40px;
  }

  .u-workl .carousel.slide {
    height: 280px;
    border-radius: var(--radius-md);
  }
  .u-workl .carousel-item img {
    height: 280px;
  }
}

/* 小屏手机 (≤638px)：紧凑布局 */
@media (max-width: 638px) {
  .m-banner.carousel {
    height: 180px;
  }
  .m-banner .carousel-item img {
    height: 180px;
  }

  .u-workl .carousel.slide {
    height: 220px;
  }
  .u-workl .carousel-item img {
    height: 220px;
  }
  .u-workl .carousel-item p {
    width: 65%;
    font-size: var(--font-size-sm);
    line-height: 40px;
  }
  /* 指示器上移避开文字 */
  .u-workl .carousel-indicators {
    bottom: 50px;
  }
}

/* 友情链接样式（与其他模块整体风格保持一致） */
.m-friend-links {
  background-color: var(--bg-card);
  padding: 0 20px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.m-friend-links .u-listhomet {
  margin-bottom: 0;
}

.u-friend-links {
  padding: 20px 0;
}

.u-friend-links ul li {
  float: left;
  margin-right: 12px;
  margin-bottom: 12px;
}

.u-friend-links ul li:nth-child(4n) {
  margin-right: 0;
}

.u-friend-links ul li a {
  display: block;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  padding: 8px 18px;
  background-color: var(--bg-muted);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.u-friend-links ul li a:hover {
  color: var(--text-on-primary);
  background-color: var(--brand-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 95, 150, 0.2);
}
</style>
