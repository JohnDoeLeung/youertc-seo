/**
 * 自定义指令 plugin（客户端专用，文件名 .client.ts 确保仅在浏览器执行）
 *
 * 改造点：
 * 1. v-lazy → 改用 @nuxt/image 的 <NuxtImg>，本指令保留作为兼容备用
 * 2. v-back-top → 改为 BackToTop 组件，本指令保留作为兼容备用
 * 3. v-safe-html → 改用 utils/sanitize.ts + v-html，本指令保留作为兼容备用
 * 4. 钩子名迁移：bind → beforeMount, update → updated, unbind → unmounted
 */
import type { Directive } from 'vue'

// v-lazy 指令（IntersectionObserver）
const LazyDirective: Directive = {
  beforeMount(el: HTMLElement, binding) {
    const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    const src = typeof binding.value === 'string' ? binding.value : binding.value?.src

    if ('IntersectionObserver' in window && src) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.src = src
            observer.unobserve(el)
          }
        })
      }, { rootMargin: '200px 0px', threshold: 0.01 })

      ;(el as HTMLImageElement).src = placeholder
      observer.observe(el)
    } else {
      ;(el as HTMLImageElement).src = src || placeholder
    }
  }
}

// v-back-top 指令
const BackTopDirective: Directive = {
  beforeMount(el: HTMLElement, binding) {
    const duration = (binding.value && binding.value.duration) || 600
    el.addEventListener('click', () => {
      const target = document.documentElement.scrollTop ? document.documentElement : document.body
      const start = target.scrollTop
      const startTime = Date.now()

      const scroll = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2
        target.scrollTop = start * (1 - ease)
        if (progress < 1) requestAnimationFrame(scroll)
      }
      requestAnimationFrame(scroll)
    })
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('lazy', LazyDirective)
  nuxtApp.vueApp.directive('back-top', BackTopDirective)
})
