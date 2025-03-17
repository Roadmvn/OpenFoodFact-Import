<template>
  <div class="max-w-7xl mx-auto mt-10 p-4">
    <!-- 表格标题 -->
    <h1 class="text-2xl font-semibold mb-4">Liste des Utilisateurs</h1>

    <!-- 用户数据表格 -->
    <el-table
        :data="users"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
        empty-text="Aucune donnée disponible"
    >
      <!-- 用户ID列 -->
      <el-table-column
          prop="id"
          label="ID"
          width="60"
      ></el-table-column>

      <!-- 用户名列 -->
      <el-table-column
          label="Nom complet"
      >
        <template #default="{ row }">
          <span>{{ row.firstName }} {{ row.lastName }}</span>
        </template>
      </el-table-column>

      <!-- 角色 -->
      <el-table-column
          prop="role"
          label="Rôle"
          width="100"
      ></el-table-column>

      <!-- 电话 -->
      <el-table-column
          prop="phone"
          label="Téléphone"
          width="120"
      ></el-table-column>

      <!-- 邮箱 -->
      <el-table-column
          prop="email"
          label="Email"
      ></el-table-column>

      <!-- 创建日期 -->
      <el-table-column
          prop="createdAt"
          label="Date de création"
          width="180"
      >
        <template #default="{ row }">
          <span>{{ formatDate(row.createdAt) }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
          label="Actions"
          width="120"
      >
        <template #default="{ row }">
          <el-button
              size="mini"
              type="primary"
              @click="to_editUser(row.id)"
          >
            Modifier
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const users = ref([]); // 保存用户数据
const loading = ref(false); // 加载状态

const { $axios } = useNuxtApp()

// 格式化日期函数
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 获取用户数据
const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await $axios.get("/api/user/users");
    users.value = response.data.users;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
  } finally {
    loading.value = false;
  }
};

// 点击“Modifier”按钮
const to_editUser = (id) => {
  window.location.href = `/admin/clients/client/${id}`;
};

// 初始加载用户数据
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.max-w-7xl {
  margin: auto;
  padding: 16px;
}
.text-2xl {
  margin-bottom: 12px;
  font-weight: bold;
  text-align: center;
}
</style>