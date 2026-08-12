<template>
  <div id="app">
    <a href="#main-content" class="visually-hidden-focusable skip-link">跳到主要内容</a>
    <AppHeader />
    <main id="main-content" role="main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// 默认布局：header / main / footer 三段式 landmark 结构
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px 16px;
  background: #005f96;
  color: #fff;
  z-index: 10000;
  transform: translateY(-100%);
  transition: transform 0.2s;
}

.skip-link:focus {
  transform: translateY(0);
}
</style>
