<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <!-- 使用 Element Plus 的图标 -->
    <el-icon class="text-red-500 text-6xl mb-4">
      <i class="el-icon-warning"></i>
    </el-icon>
    <h1 class="text-4xl font-bold text-gray-800 mb-2">401</h1>
    <p class="text-lg text-gray-600 mb-6">Vous n'avez pas la permission d'accéder à cette page</p>
    <!-- 返回按钮 -->
    <el-button type="primary" @click="goBack" class="px-6 py-2">
      Retour à l'accueil
    </el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

// 导航回到首页
const router = useRouter()
const goBack = () => {
  router.push('/') // 重定向到主页或其他页面
}
</script>