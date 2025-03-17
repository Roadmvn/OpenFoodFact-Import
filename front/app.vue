<template>
  <NuxtLayout />
</template>
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
console.log('Routes:', router.getRoutes())

</script>
