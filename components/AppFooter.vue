<template>
  <footer class="is-footer" role="contentinfo">
    <div class="container">
      <div class="m-footer-grid">
        <!-- 左侧：公司信息 -->
        <div class="m-footer-info">
          <NuxtLink to="/" class="m-footer-logo" aria-label="返回首页">
            <img
              v-if="siteInfo.logo"
              :src="siteInfo.logo"
              :alt="`${siteInfo.name || '公司'} logo`"
              loading="lazy"
            >
          </NuxtLink>
          <h2 class="m-footer-company">{{ siteInfo.name }}</h2>
          <p class="m-footer-desc">{{ siteInfo.description }}</p>
        </div>

        <!-- 中间：联系方式 -->
        <div class="m-footer-contact">
          <h3 class="m-footer-title">联系我们</h3>
          <ul>
            <li>
              <span class="u-icon u-icon-addr" />
              <span>{{ siteInfo.address }}</span>
            </li>
            <li>
              <span class="u-icon u-icon-phone" />
              <a :href="`tel:${siteInfo.phone}`">{{ siteInfo.phone }}</a>
            </li>
            <li v-if="siteInfo.email">
              <span class="u-icon u-icon-mail" />
              <a :href="`mailto:${siteInfo.email}`">{{ siteInfo.email }}</a>
            </li>
          </ul>
        </div>

        <!-- 右侧：快速导航 -->
        <div class="m-footer-nav">
          <h3 class="m-footer-title">快速导航</h3>
          <ul>
            <li v-for="(item, index) in cateList.slice(0, 6)" :key="index">
              <NuxtLink :to="`/channel/${item.id}`">{{ item.name }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- 底部版权栏 -->
      <div class="m-footer-bottom">
        <p>
          <span class="u-copyright">版权所有 © {{ new Date().getFullYear() }} {{ siteInfo.name }}</span>
          <span class="u-powered">
            Powered by
            <a href="https://www.zhidongliang.asia" target="_blank" rel="noopener noreferrer">咖啡豆</a>
          </span>
          <a class="u-beian" :href="'https://beian.miit.gov.cn/'" target="_blank" rel="noopener noreferrer">
            {{ siteInfo.beian }}
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 页脚：现代化多栏布局
import { useSiteStore } from '~/stores/site'

interface Category {
  id: number | string
  name: string
  childs?: Category[]
}

const store = useSiteStore()
const siteInfo = computed(() => store.siteInfo)
const cateList = computed<Category[]>(() => store.cateList)
</script>

<style scoped lang="scss">
.is-footer {
  background: linear-gradient(135deg, var(--brand-primary-dark) 0%, var(--brand-primary) 100%);
  color: var(--text-on-primary);
  padding: 50px 0 0;
  margin-top: 40px;
}

.m-footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 40px;
}

/* 左侧公司信息 */
.m-footer-info {
  .m-footer-logo {
    display: inline-block;
    margin-bottom: 16px;

    img {
      height: 48px;
      width: auto;
      opacity: 0.95;
      transition: opacity var(--transition-base);
    }

    &:hover img {
      opacity: 1;
    }
  }

  .m-footer-company {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin: 0 0 12px;
    color: var(--text-on-primary);
  }

  .m-footer-desc {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-loose);
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
    max-width: 380px;
  }
}

/* 中间 + 右侧标题 */
.m-footer-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-on-primary);
  margin: 0 0 20px;
  position: relative;
  padding-bottom: 10px;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 30px;
    height: 2px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 1px;
  }
}

/* 联系方式 */
.m-footer-contact ul,
.m-footer-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 14px;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    color: rgba(255, 255, 255, 0.75);

    a {
      color: rgba(255, 255, 255, 0.75);
      transition: color var(--transition-base);

      &:hover {
        color: var(--text-on-primary);
        text-decoration: underline;
      }
    }
  }
}

/* 联系方式图标 */
.u-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 10px;
  margin-top: 2px;
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.6);
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  transition: background-color var(--transition-base);
}

.m-footer-contact li:hover .u-icon {
  background-color: var(--text-on-primary);
}

.u-icon-addr {
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z'/></svg>");
}

.u-icon-phone {
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/></svg>");
}

.u-icon-mail {
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/></svg>");
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/></svg>");
}

/* 底部版权栏 */
.m-footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding: 18px 0;

  p {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0;
    font-size: var(--font-size-sm);
    color: rgba(255, 255, 255, 0.6);

    a {
      color: rgba(255, 255, 255, 0.6);
      transition: color var(--transition-base);

      &:hover {
        color: var(--text-on-primary);
      }
    }
  }
}

/* 响应式：平板两栏 */
@media (max-width: 991px) {
  .m-footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  .m-footer-info {
    grid-column: 1 / -1;
  }
}

/* 响应式：手机单栏 */
@media (max-width: 575px) {
  .is-footer {
    padding: 30px 0 0;
  }

  .m-footer-grid {
    grid-template-columns: 1fr;
    gap: 25px;
    padding-bottom: 25px;
  }

  .m-footer-bottom p {
    justify-content: center;
    text-align: center;
  }
}
</style>
