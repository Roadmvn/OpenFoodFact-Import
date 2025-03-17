<template>
  <div class="flex h-screen">
    <!-- Menu部分，占比3 -->
    <div class="basis-3/12 bg-gray-200 p-4">
      <MenuComponent />
    </div>

    <!-- Contenu部分，占比7 -->
    <div class="basis-9/12 p-4 grid grid-cols-1 gap-4" style="max-height: 95vh; overflow-y: scroll;">
      <div class="flex flex-row justify-between">
        <h1>Products</h1>
        <el-button @click="to_route('/seller/products/create')">Create</el-button>
      </div>
      <ProductsBlockComponent></ProductsBlockComponent>
    </div>
  </div>
</template>

<script setup lang="ts">

import MenuComponent from "~/components/SellerPage/MenuComponent.vue";
import ProductsBlockComponent from "~/components/SellerPage/ProductsBlockComponent.vue";
// import ChartComponent from "~/components/SellerPage/ChartComponent.vue";

const user = useUserStore().user;

onMounted(() => {
  check_user_role()
})

const check_user_role = () => {
  if (!user){
    navigateTo('/401');
  }

  if (user?.role !== 'seller'){
    navigateTo('/401')
  }
}

const to_route = (route: string) => {
  window.location.href = route;
}

</script>