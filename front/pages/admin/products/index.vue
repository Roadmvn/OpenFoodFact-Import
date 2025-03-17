<template>
  <div class="flex h-screen">
    <!-- Menu部分，占比3 -->
    <div class="basis-3/12 bg-gray-200 p-4">
      <MenuComponent />
    </div>

    <!-- Contenu部分，占比7 -->
    <div class="basis-9/12 p-4" style="max-height: 95vh; overflow-y: scroll;">
      <ProductsBlock />
    </div>
  </div>
</template>

<script setup lang="ts">

import MenuComponent from "~/components/AdminPage/MenuComponent.vue";
import ProductsBlock from "~/components/IndexPage/ProductsBlock.vue";

const user = useUserStore().user;

onMounted(() => {
  check_user_role()
})

const check_user_role = () => {
  if (!user){
    navigateTo('/401');
  }

  if (user?.role !== 'admin'){
    navigateTo('/401')
  }
}

</script>