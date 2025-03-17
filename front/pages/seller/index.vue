<template>
  <div class="flex h-screen">
    <!-- Menu部分，占比3 -->
    <div class="basis-3/12 bg-gray-200 p-4">
      <MenuComponent />
    </div>

    <!-- Contenu部分，占比7 -->
    <div class="basis-9/12 p-4 grid grid-cols-2 gap-4" style="max-height: 95vh; overflow-y: scroll;">
      <!-- ChartComponents 等分，2列 -->
      <div class="h-1/2">
<!--        <ChartComponent></ChartComponent>-->
      </div>
      <div class="h-1/2">
        Chart 2
      </div>
      <div class="h-1/2">
        Chart 3
      </div>
      <div class="h-1/2">
        Chart 4
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import MenuComponent from "~/components/SellerPage/MenuComponent.vue";
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

</script>