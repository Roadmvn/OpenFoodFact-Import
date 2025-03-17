<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header（顶部固定的导航条） -->
    <Header />

    <!-- 主内容区域（页面内容） -->
    <main class="flex-grow">
      <NuxtPage />
    </main>

    <!-- Footer（底部的版权信息） -->
    <Footer />
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
</script>