<template>
  <header class="is-header" role="banner">
    <!-- 顶部欢迎条：单一 HTML，由 public.css 媒体查询控制显示 -->
    <div class="m-top">
      <div class="container f-clearfix">
        <div class="u-topl f-fl">
          欢迎访问
          <NuxtLink to="/">{{ siteInfo.name }}</NuxtLink>
        </div>
      </div>
    </div>

    <!-- 主头部：logo + 导航（沿用原 .m-head / .navbar-default / .nav 结构） -->
    <div class="m-head f-lg-ha">
      <div class="container f-clearfix">
        <NuxtLink to="/" class="m-logo f-db f-fl" aria-label="返回首页">
          <img
            v-if="siteInfo.logo"
            :src="siteInfo.logo"
            :alt="`${siteInfo.name || '公司'} logo`"
            class="logo-img"
          >
        </NuxtLink>

        <!-- PC 端导航（≥992px） -->
        <nav class="navbar navbar-default navbar-expand-lg f-fl pc-nav" role="navigation" aria-label="主导航">
          <div class="container-fluid">
            <div class="navbar-header f-fl">
              <NuxtLink to="/" class="navbar-brand">网站首页</NuxtLink>
            </div>

            <div id="mainNav" class="collapse navbar-collapse f-fl">
              <ul class="nav navbar-nav">
                <li
                  v-for="(item, index) in cateList"
                  :key="index"
                  @mouseenter="openSubMenu(index)"
                  @mouseleave="closeSubMenu()"
                >
                  <!-- 无子菜单：直接 NuxtLink -->
                  <NuxtLink
                    v-if="!item.childs || item.childs.length === 0"
                    :to="`/channel/${item.id}`"
                    @click="handleNavigate(item, -1)"
                  >
                    {{ item.name }}
                  </NuxtLink>

                  <!-- 有子菜单：PC 悬停展开 -->
                  <template v-else>
                    <a
                      href="javascript:void(0);"
                      class="dropdown-toggle"
                      role="button"
                      aria-haspopup="true"
                      :aria-expanded="activeSubMenu === index"
                      @click.prevent="toggleSubMenu(index)"
                    >
                      {{ item.name }} <span class="caret" />
                    </a>
                    <dl :class="{ show: activeSubMenu === index }">
                      <dt
                        v-for="(child, childIndex) in item.childs"
                        :key="childIndex"
                        :class="{ 'u-active': isActive(child.id) }"
                      >
                        <NuxtLink
                          :to="`/channel/${item.id}`"
                          @click="handleNavigate(item, childIndex)"
                        >
                          {{ child.name }}
                        </NuxtLink>
                      </dt>
                    </dl>
                  </template>
                </li>

                <li>
                  <NuxtLink to="/about">联系我们</NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- 搜索入口（PC + 移动端通用） -->
        <NuxtLink to="/search" class="header-search-btn" aria-label="站内搜索">
          <span class="search-icon" aria-hidden="true" />
          <span class="search-label">搜索</span>
        </NuxtLink>

        <!-- 移动端汉堡按钮（<992px） -->
        <button
          class="mobile-menu-btn"
          type="button"
          :aria-expanded="isMobileMenuOpen"
          aria-label="打开导航菜单"
          @click="openMobileMenu"
        >
          <span class="sr-only">切换导航</span>
          <span class="menu-btn-inner">
            <span class="icon-bar" />
            <span class="icon-bar" />
            <span class="icon-bar" />
          </span>
          <span class="menu-btn-label">菜单</span>
        </button>
      </div>
    </div>

    <!-- 移动端抽屉式侧滑菜单（<992px） -->
    <Teleport to="body">
      <transition name="drawer-mask">
        <div
          v-if="isMobileMenuOpen"
          class="drawer-mask"
          @click="closeMobileMenu"
        />
      </transition>

      <transition name="drawer-slide">
        <aside
          v-if="isMobileMenuOpen"
          class="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="导航菜单"
        >
          <!-- 抽屉头部 -->
          <div class="drawer-header">
            <NuxtLink to="/" class="drawer-logo" @click="closeMobileMenu">
              <img
                v-if="siteInfo.logo"
                :src="siteInfo.logo"
                :alt="`${siteInfo.name || '公司'} logo`"
                loading="lazy"
              >
            </NuxtLink>
            <button
              class="drawer-close"
              type="button"
              aria-label="关闭菜单"
              @click="closeMobileMenu"
            >
              <span class="close-icon" />
              <span class="close-label">关闭</span>
            </button>
          </div>

          <!-- 引导提示 -->
          <div class="drawer-tip">
            <span class="tip-icon" />
            <span class="tip-text">点击菜单项进入对应栏目</span>
          </div>

          <!-- 抽屉导航列表 -->
          <nav class="drawer-nav" aria-label="移动端导航">
            <ul>
              <!-- 网站首页 -->
              <li class="drawer-item">
                <NuxtLink to="/" class="drawer-link" @click="closeMobileMenu">
                  <span class="drawer-icon icon-home" />
                  <span class="drawer-text">网站首页</span>
                </NuxtLink>
              </li>

              <!-- 站内搜索 -->
              <li class="drawer-item">
                <NuxtLink to="/search" class="drawer-link" @click="closeMobileMenu">
                  <span class="drawer-icon icon-search" />
                  <span class="drawer-text">站内搜索</span>
                </NuxtLink>
              </li>

              <!-- 分类列表 -->
              <li
                v-for="(item, index) in cateList"
                :key="index"
                class="drawer-item"
                :class="{ 'has-child': item.childs && item.childs.length > 0 }"
              >
                <!-- 无子菜单 -->
                <NuxtLink
                  v-if="!item.childs || item.childs.length === 0"
                  :to="`/channel/${item.id}`"
                  class="drawer-link"
                  @click="handleNavigate(item, -1)"
                >
                  <span class="drawer-icon icon-channel" />
                  <span class="drawer-text">{{ item.name }}</span>
                </NuxtLink>

                <!-- 有子菜单：点击展开/收起 -->
                <template v-else>
                  <a
                    href="javascript:void(0);"
                    class="drawer-link"
                    :class="{ expanded: expandedMenus.includes(index) }"
                    @click.prevent="toggleDrawerMenu(index)"
                  >
                    <span class="drawer-icon icon-channel" />
                    <span class="drawer-text">{{ item.name }}</span>
                    <span class="drawer-arrow" />
                  </a>
                  <transition name="submenu">
                    <ul v-if="expandedMenus.includes(index)" class="drawer-submenu">
                      <li
                        v-for="(child, childIndex) in item.childs"
                        :key="childIndex"
                      >
                        <NuxtLink
                          :to="`/channel/${item.id}`"
                          class="submenu-link"
                          @click="handleNavigate(item, childIndex)"
                        >
                          {{ child.name }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </transition>
                </template>
              </li>

              <!-- 联系我们 -->
              <li class="drawer-item">
                <NuxtLink to="/about" class="drawer-link" @click="closeMobileMenu">
                  <span class="drawer-icon icon-contact" />
                  <span class="drawer-text">联系我们</span>
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <!-- 底部引导提示 -->
          <div class="drawer-footer-tip">
            <span class="footer-tip-text">点击 <em class="arrow-hint">›</em> 可展开子分类</span>
          </div>
        </aside>
      </transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
// 顶部导航：PC 端沿用原项目结构，移动端改为抽屉式侧滑菜单
import { useSiteStore } from '~/stores/site'
import { debounce } from '~/utils'

interface Category {
  id: number | string
  name: string
  childs?: Category[]
}

const store = useSiteStore()
const siteInfo = computed(() => store.siteInfo)
const cateList = computed<Category[]>(() => store.cateList)
const activeId = computed(() => store.activeId)

const isMobile = ref(false)
const isMobileMenuOpen = ref(false)
const activeSubMenu = ref<number | null>(null)
const expandedMenus = ref<number[]>([])

// 防抖 resize
const checkMobile = debounce(() => {
  isMobile.value = window.innerWidth < 992
  // 切换到 PC 端时关闭抽屉
  if (!isMobile.value && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}, 200)

// PC 端子菜单
const openSubMenu = (index: number) => {
  if (!isMobile.value) activeSubMenu.value = index
}

const closeSubMenu = () => {
  if (!isMobile.value) activeSubMenu.value = null
}

const toggleSubMenu = (index: number) => {
  if (!isMobile.value) {
    activeSubMenu.value = activeSubMenu.value === index ? null : index
  }
}

// 移动端抽屉
const openMobileMenu = () => {
  isMobileMenuOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  expandedMenus.value = []
  document.body.style.overflow = ''
}

const toggleDrawerMenu = (index: number) => {
  const idx = expandedMenus.value.indexOf(index)
  if (idx > -1) {
    expandedMenus.value.splice(idx, 1)
  } else {
    expandedMenus.value.push(index)
  }
}

const handleNavigate = (item: Category, childIndex: number) => {
  store.setActiveId(item.id)
  store.setActiveIndex(childIndex)
  closeMobileMenu()
}

const isActive = (id: number | string) => {
  return activeId.value === id.toString()
}

// ESC 键关闭抽屉
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// 路由切换时关闭抽屉
const route = useRoute()
watch(() => route.fullPath, () => {
  if (isMobileMenuOpen.value) closeMobileMenu()
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped lang="scss">
/* ============================================
 * PC 端导航样式（≥992px，沿用原项目结构）
 * ========================================== */
:deep(.navbar-nav) {
  flex-direction: column;
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
}

@media (min-width: 992px) {
  :deep(.navbar-nav) {
    flex-direction: row;
  }
  :deep(.navbar-nav > li) {
    float: left;
  }
}

:deep(.nav li dl) {
  display: none;
}

:deep(.nav li dl.show) {
  display: block;
}

/* ============================================
 * 搜索入口按钮（PC + 移动端通用）
 * ========================================== */
.header-search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  float: right;
  height: 40px;
  padding: 0 16px;
  margin: 30px 0 0 12px;
  background-color: transparent;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--brand-primary);
    border-color: var(--brand-primary);
    color: var(--text-on-primary);
    box-shadow: 0 4px 12px rgba(0, 95, 150, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
}

.search-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  background-color: currentColor;
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/></svg>");
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/></svg>");
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

/* ============================================
 * 移动端汉堡按钮（<992px）
 * ========================================== */
.mobile-menu-btn {
  display: none;
}

.icon-bar {
  display: block;
  width: 22px;
  height: 2px;
  border-radius: 1px;
  background-color: var(--text-muted);
  & + .icon-bar {
    margin-top: 4px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 991px) {
  /* 隐藏 PC 导航 */
  .pc-nav {
    display: none !important;
  }

  /* 头部与下方内容（轮播图）之间留出间距 */
  .m-head {
    margin-bottom: 15px;
  }

  /* 汉堡按钮：图标 + 文字标签横向布局，美观大气 */
  .mobile-menu-btn {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    float: right;
    height: 40px;
    min-width: 92px;
    margin-top: 18px;
    padding: 0 18px;
    background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%);
    border: none;
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: 0 2px 8px rgba(0, 95, 150, 0.25);

    &:active {
      transform: translateY(1px);
      box-shadow: 0 1px 4px rgba(0, 95, 150, 0.2);
    }
  }

  /* 搜索按钮：与汉堡按钮同高同宽同风格，统一美观 */
  .header-search-btn {
    height: 40px;
    min-width: 92px;
    margin-top: 18px;
    padding: 0 18px;
    background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%);
    border: none;
    border-radius: var(--radius-pill);
    color: var(--text-on-primary);
    box-shadow: 0 2px 8px rgba(0, 95, 150, 0.25);

    &:hover {
      background: linear-gradient(135deg, var(--brand-primary-light) 0%, var(--brand-primary) 100%);
      color: var(--text-on-primary);
      box-shadow: 0 4px 16px rgba(0, 95, 150, 0.3);
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 1px 4px rgba(0, 95, 150, 0.2);
    }
  }

  .menu-btn-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 8px;
  }

  .menu-btn-label {
    font-size: var(--font-size-sm);
    color: var(--text-on-primary);
    line-height: 1;
    letter-spacing: 1px;
  }

  /* 汉堡图标在深色背景上变白 */
  .icon-bar {
    background-color: var(--text-on-primary);
    width: 20px;
    height: 2px;
    border-radius: 1px;

    & + .icon-bar {
      margin-top: 4px;
    }
  }
}

/* ============================================
 * 移动端抽屉式侧滑菜单（<992px）
 * ========================================== */
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-overlay);
  z-index: 9998;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 320px;
  height: 100%;
  background-color: var(--bg-card);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 抽屉头部 */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--brand-primary-dark) 0%, var(--brand-primary) 100%);
  flex-shrink: 0;
}

.drawer-logo {
  display: block;
  max-width: 160px;

  img {
    height: 40px;
    width: auto;
  }
}

.drawer-close {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 48px; /* 增大触控区域 */
  height: 48px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  cursor: pointer;

  .close-icon {
    position: relative;
    width: 20px;
    height: 20px;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--text-on-primary);
      transform-origin: center;
    }

    &::before {
      transform: translateY(-50%) rotate(45deg);
    }

    &::after {
      transform: translateY(-50%) rotate(-45deg);
    }
  }

  .close-label {
    margin-top: 2px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85); /* 适配深色头部背景 */
    line-height: 1;
  }
}

/* 引导提示条：统一风格、措辞简明，不遮挡主内容 */
.drawer-tip {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background-color: var(--bg-muted);
  border-bottom: 1px solid var(--border-base);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  line-height: 1.5;
  flex-shrink: 0;
}

.tip-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
  background-color: var(--brand-primary);
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z'/></svg>");
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
}

.tip-text {
  flex: 1;
}

/* 抽屉导航列表 */
.drawer-nav {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 0;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
}

.drawer-item {
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
}

.drawer-link {
  display: flex;
  align-items: center;
  min-height: 56px; /* 增大触控区域，符合移动端点击标准 */
  padding: 16px 20px;
  color: var(--text-primary);
  font-size: 17px; /* 增大字体，小屏可读 */
  text-decoration: none;
  transition: background-color var(--transition-fast);

  &:active {
    background-color: var(--brand-primary-lighter);
  }
}

.drawer-icon {
  display: inline-block;
  width: 22px; /* 增大图标尺寸 */
  height: 22px;
  margin-right: 16px; /* 优化图标与文字间距 */
  flex-shrink: 0;
  background-color: var(--brand-primary);
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
}

.icon-home {
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/></svg>");
}

.icon-search {
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/></svg>");
}

.icon-channel {
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4z'/></svg>");
}

.icon-contact {
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/></svg>");
}

.drawer-text {
  flex: 1;
}

/* 展开箭头：增大尺寸便于识别 */
.drawer-arrow {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-right: 2px solid var(--text-muted);
  border-bottom: 2px solid var(--text-muted);
  transform: rotate(-45deg);
  transition: transform var(--transition-slow);
  margin-left: 10px;
  flex-shrink: 0;
}

.drawer-link.expanded .drawer-arrow {
  transform: rotate(45deg);
  border-color: var(--brand-primary);
}

/* 子菜单 */
.drawer-submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: var(--bg-muted);

  li {
    border-bottom: 1px solid var(--border-light);

    &:last-child {
      border-bottom: none;
    }
  }
}

.submenu-link {
  display: block;
  min-height: 52px; /* 增大子菜单触控区域 */
  line-height: 52px;
  padding: 0 20px 0 58px; /* 优化子菜单缩进，与图标对齐 */
  color: var(--text-secondary);
  font-size: var(--font-size-md); /* 增大子菜单字体 */
  text-decoration: none;
  transition: all var(--transition-fast);

  &:active {
    background-color: var(--brand-primary-lighter);
    color: var(--brand-primary);
  }
}

/* 底部引导提示：风格与顶部一致 */
.drawer-footer-tip {
  flex-shrink: 0;
  padding: 12px 20px;
  background-color: var(--bg-muted);
  border-top: 1px solid var(--border-base);
  text-align: center;
}

.footer-tip-text {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  line-height: 1.5;

  .arrow-hint {
    font-style: normal;
    color: var(--brand-primary);
    font-weight: bold;
    margin: 0 2px;
  }
}

/* 小屏适配（≤360px）：缩小间距与字体，保证内容不被挤压 */
@media (max-width: 360px) {
  .drawer-header {
    padding: 12px 16px;
  }

  .drawer-logo img {
    height: 34px;
  }

  .drawer-tip,
  .drawer-footer-tip {
    padding: 10px 16px;
    font-size: 12px;
  }

  .drawer-link {
    min-height: 52px;
    padding: 14px 16px;
    font-size: 16px;
  }

  .drawer-icon {
    width: 20px;
    height: 20px;
    margin-right: 12px;
  }

  .submenu-link {
    min-height: 48px;
    line-height: 48px;
    padding-left: 48px;
    font-size: 15px;
  }

  /* 汉堡按钮小屏适配 */
  .mobile-menu-btn {
    height: 36px;
    min-width: 80px;
    padding: 0 14px;
  }

  /* 搜索按钮小屏适配（与汉堡按钮同步缩小） */
  .header-search-btn {
    height: 36px;
    min-width: 80px;
    padding: 0 14px;
    font-size: 13px;
  }

  .search-icon {
    width: 14px;
    height: 14px;
    margin-right: 4px;
  }

  .menu-btn-label {
    font-size: 13px;
  }

  .icon-bar {
    width: 18px;
  }

  /* 关闭按钮标签适配小屏 */
  .drawer-close {
    min-width: 44px;
    height: 44px;
  }

  .close-label {
    font-size: 10px;
  }
}

/* ============================================
 * 抽屉过渡动画
 * ========================================== */
/* 遮罩层淡入淡出 */
.drawer-mask-enter-active,
.drawer-mask-leave-active {
  transition: opacity var(--transition-slow) ease;
}
.drawer-mask-enter-from,
.drawer-mask-leave-to {
  opacity: 0;
}

/* 抽屉从右侧滑入/滑出 */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

/* 子菜单展开/收起动画 */
.submenu-enter-active,
.submenu-leave-active {
  transition: max-height var(--transition-slow) ease, opacity var(--transition-slow) ease;
  overflow: hidden;
  max-height: 500px;
}
.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
