<template>
  <div>
    <!-- 表格标题 -->
    <el-card class="mb-4">
      <h2>Liste des messages de contact</h2>
    </el-card>

    <!-- 数据表格 -->
    <el-table
        :data="messages"
        border
        stripe
        style="width: 75%;margin: 0 auto;"
    >
      <!-- ID 列 -->
      <el-table-column
          prop="id"
          label="ID"
          width="60"
      ></el-table-column>

      <!-- Message 列 -->
      <el-table-column
          prop="message"
          label="Message"
      ></el-table-column>

      <!-- 状态列 -->
      <el-table-column
          prop="status"
          label="Statut"
          width="100"
      >
        <template #default="scope">
          <el-tag type="warning" v-if="scope.row.status === 'pending'">
            En attente
          </el-tag>
          <el-tag type="success" v-else>
            Terminé
          </el-tag>
        </template>
      </el-table-column>

      <!-- Email 卖家邮箱信息 -->
      <el-table-column
          prop="seller.email"
          label="E-mail du vendeur"
      ></el-table-column>

      <!-- 创建时间 -->
      <el-table-column
          prop="createdAt"
          label="Créé le"
      >
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const { $axios } = useNuxtApp()

// 存储消息数据
const messages = ref<any[]>([]);

// 格式化日期的函数（格式：jour/mois/année heures:minutes:secondes）
const formatDate = (date: string): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

// 从 API 获取数据
const fetchMessages = async () => {
  try {
    const { data } = await $axios.get('/api/contact/buyer');
    messages.value = data;
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
  }
};

// 在组件挂载时调用 API
onMounted(() => {
  fetchMessages();
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>