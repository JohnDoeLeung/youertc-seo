<template>
  <div class="not-found full-height">
    <div class="not-found-content">
      <div class="not-found-code">404</div>
      <h1 class="not-found-title">页面未找到</h1>
      <p class="not-found-desc">抱歉，您访问的页面不存在或已被移除</p>
      <div class="not-found-actions">
        <NuxtLink to="/" class="not-found-btn">
          <span class="btn-icon" aria-hidden="true" />
          <span>返回首页</span>
        </NuxtLink>
      </div>
    </div>
    <!-- 装饰性背景圆 -->
    <div class="not-found-decorations" aria-hidden="true">
      <span class="deco-circle deco-circle-1" />
      <span class="deco-circle deco-circle-2" />
      <span class="deco-circle deco-circle-3" />
    </div>
  </div>
</template>

<script setup lang="ts">
// P3-30: 使用 .full-height 类（100dvh，降级 100vh），修复 iOS Safari 地址栏遮挡问题
useSeo({
  title: '404 - 页面未找到 - 陕西有色驼城建设有限公司',
  description: '页面不存在',
  url: ''
})
</script>

<style scoped lang="scss">
.not-found {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-page) 0%, #e8f1f8 100%);
  overflow: hidden;
}

.not-found-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px 20px;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 404 大数字：流式字体 */
.not-found-code {
  font-size: clamp(5rem, 20vw, 8rem);
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  margin-bottom: 16px;
  letter-spacing: -2px;
  text-shadow: 0 4px 24px rgba(0, 95, 150, 0.1);
}

.not-found-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px;
  line-height: var(--line-height-snug);
}

.not-found-desc {
  font-size: var(--font-size-md);
  color: var(--text-tertiary);
  margin: 0 0 32px;
  line-height: var(--line-height-relaxed);
}

.not-found-actions {
  display: flex;
  justify-content: center;
}

/* 主按钮：渐变背景 + 悬停动效 */
.not-found-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%);
  color: var(--text-on-primary);
  font-size: var(--font-size-md);
  font-weight: 500;
  text-decoration: none;
  border-radius: var(--radius-pill);
  box-shadow: 0 4px 16px rgba(0, 95, 150, 0.25);
  transition: all var(--transition-base);

  &:hover {
    background: linear-gradient(135deg, var(--brand-primary-light) 0%, var(--brand-primary) 100%);
    color: var(--text-on-primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 95, 150, 0.35);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 95, 150, 0.2);
  }
}

/* 按钮图标：房子形状 */
.btn-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: currentColor;
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/></svg>");
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/></svg>");
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}

/* 装饰性背景圆 */
.not-found-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 95, 150, 0.08) 0%, rgba(0, 116, 176, 0.04) 100%);
  animation: float 8s ease-in-out infinite;
}

.deco-circle-1 {
  width: 280px;
  height: 280px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.deco-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 15%;
  right: 8%;
  animation-delay: 2s;
}

.deco-circle-3 {
  width: 140px;
  height: 140px;
  top: 50%;
  right: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) scale(1.05);
    opacity: 0.8;
  }
}

/* 响应式：移动端 */
@media (max-width: 767px) {
  .not-found-content {
    padding: 20px 16px;
  }

  .not-found-btn {
    padding: 10px 24px;
    font-size: var(--font-size-base);
  }

  .deco-circle-1 {
    width: 180px;
    height: 180px;
  }

  .deco-circle-2 {
    width: 140px;
    height: 140px;
  }

  .deco-circle-3 {
    width: 100px;
    height: 100px;
  }
}
</style>
