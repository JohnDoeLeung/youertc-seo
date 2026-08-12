<template>
  <ClientOnly>
    <transition name="backtop-fade">
      <button
        v-show="visible"
        class="back-to-top"
        type="button"
        aria-label="返回顶部"
        @click="scrollToTop"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
        </svg>
      </button>
    </transition>
  </ClientOnly>
</template>

<script setup lang="ts">
// 返回顶部组件：替代原 v-back-top 指令，更直观、可样式化
const visible = ref(false)
const duration = 600

const handleScroll = () => {
  visible.value = window.scrollY > 400
}

const scrollToTop = () => {
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
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%);
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 95, 150, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 95, 150, 0.4);
  background: linear-gradient(135deg, var(--brand-primary-light) 0%, var(--brand-primary) 100%);
}

.back-to-top:active {
  transform: translateY(-2px);
}

/* 过渡动画 */
.backtop-fade-enter-active,
.backtop-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.backtop-fade-enter-from,
.backtop-fade-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.8);
}

/* 移动端 */
@media (max-width: 767px) {
  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
  }
}
</style>
