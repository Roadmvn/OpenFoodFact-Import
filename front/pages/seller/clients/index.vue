<template>
  <div class="flex h-screen">
    <!-- Menu部分，占比3 -->
    <div class="basis-3/12 bg-gray-200 p-4">
      <MenuComponent />
    </div>

    <!-- Contenu部分，占比7 -->
    <div class="basis-9/12 p-4 grid gap-4" style="max-height: 95vh; overflow-y: scroll;">
      <!-- ChartComponents 等分，2列 -->
      <div class="container mx-auto p-6">
        <!-- 标题 -->
        <h1 class="text-xl font-bold text-center mb-6">Liste des utilisateurs associés</h1>

        <!-- 表格 -->
        <el-table
            v-if="users && users.length > 0"
            :data="users"
            style="width: 100%;"
            class="shadow-md"
            border
        >
          <!-- 表头：ID -->
          <el-table-column
              prop="id"
              label="ID"
              align="center"
              width="80"
          >
          </el-table-column>

          <!-- 表头：Prénom -->
          <el-table-column
              prop="firstName"
              label="Prénom"
              align="center"
          >
          </el-table-column>

          <!-- 表头：Nom -->
          <el-table-column
              prop="lastName"
              label="Nom"
              align="center"
          >
          </el-table-column>

          <!-- 表头：Email -->
          <el-table-column
              prop="email"
              label="E-mail"
              align="center"
          >
          </el-table-column>
        </el-table>

        <!-- 如果没有用户，显示占位信息 -->
        <div v-else class="text-center text-gray-500 mt-6">
          Aucun utilisateur associé trouvé.
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
// 导入 Vue 的必要功能
import { ref, onMounted } from "vue";
import axios from "axios";
import MenuComponent from "~/components/SellerPage/MenuComponent.vue"; // AJAX 请求库

// 定义用户列表
const users = ref([]);

const { $axios } = useNuxtApp();

// 获取用户的函数
const fetchUsers = async () => {
  try {
    // 向指定 API 发送请求以获取用户数据
    const response = await $axios.get("/api/orders/seller/users");
    users.value = response.data; // 将响应数据存储到 `users` 中
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    // 根据需要，可以在此处处理错误，例如显示用户友好的消息
  }
};

// 组件挂载时调用获取用户的函数
onMounted(fetchUsers);
</script>

<style scoped>
/* 自定义样式 */
.container {
  max-width: 100%;
}
</style>