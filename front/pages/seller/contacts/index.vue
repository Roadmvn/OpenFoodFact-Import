<template>
  <div>
    <!-- 表格标题 -->
    <el-card class="mb-4">
      <h2>Messages reçus des acheteurs</h2>
      <p>Vous pouvez consulter et gérer les messages ici.</p>
    </el-card>

    <!-- 数据表格 -->
    <el-table
        :data="messages"
        border
        stripe
        style="width: 100%;"
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

      <!-- 买家邮箱列 -->
      <el-table-column
          prop="buyer.email"
          label="E-mail de l'acheteur"
      ></el-table-column>

      <!-- 创建时间 -->
      <el-table-column
          prop="createdAt"
          label="Reçu le"
      >
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>

      <!-- 状态列 -->
      <el-table-column label="Statut actuel" width="200">
        <template #default="scope">
          <el-tag
              type="warning"
              v-if="scope.row.status === 'pending'"
          >
            En attente
          </el-tag>
          <el-tag
              type="success"
              v-else-if="scope.row.status === 'resolved'"
          >
            Résolu
          </el-tag>
          <el-tag
              type="danger"
              v-else-if="scope.row.status === 'closed'"
          >
            Fermé
          </el-tag>
        </template>
      </el-table-column>

      <!-- 修改状态列 -->
      <el-table-column label="Modifier le statut" width="200">
        <template #default="scope">
          <el-select
              v-model="scope.row.status"
              placeholder="Sélectionnez un statut"
              @change="updateStatus(scope.row)"
          >
            <el-option
                v-for="option in statusOptions"
                :key="option"
                :label="optionLabel(option)"
                :value="option"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>

      <!-- 动作列 -->
      <el-table-column
          label="Actions"
          width="150"
      >
        <template #default="scope">
          <el-button
              type="primary"
              size="small"
              @click="openReplyDrawer(scope.row)"
          >
            Répondre
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 抽屉：回复买家 -->
    <el-drawer
        title="Envoyer une réponse"
        v-model="drawerVisible"
        direction="rtl"
        size="30%"
    >
      <el-form
          :model="replyForm"
          ref="replyFormRef"
          label-width="100px"
      >
        <!-- 消息 -->
        <el-form-item label="Réponse" prop="replyMessage">
          <el-input
              type="textarea"
              v-model="replyForm.replyMessage"
              placeholder="Écrivez votre réponse ici..."
              rows="4"
          />
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitReply">
            Envoyer
          </el-button>
          <el-button @click="drawerVisible = false">
            Annuler
          </el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
const { $axios } = useNuxtApp()

// 消息数据存储
const messages = ref<any[]>([]);

// 抽屉状态
const drawerVisible = ref<boolean>(false);

// 回复表单数据
const replyForm = reactive({
  sellerId: null as number | null, // 卖家 ID
  buyerId: null as number | null,  // 买家 ID
  replyMessage: "",                // 回复内容
});

// 表单引用
const replyFormRef = ref();

const statusOptions = ['pending', 'resolved', 'closed']; // 状态选项

// 格式化日期的函数（jour/mois/année heures:minutes:secondes）
const formatDate = (date: string): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// 加载消息数据
const fetchMessages = async () => {
  try {
    const { data } = await $axios.get("/api/contact/seller");
    messages.value = data;
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
  }
};

// 打开回复抽屉
const openReplyDrawer = (row: any) => {
  replyForm.sellerId = row.sellerId;
  replyForm.buyerId = row.buyerId;
  replyForm.replyMessage = ""; // 清空回复内容
  drawerVisible.value = true;
};

// 更新状态
const updateStatus = async (row: any) => {
  try {
    await $axios.patch(`/api/contact/${row.id}/status`, {
      status: row.status,
    });

    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
  }
};

// 提交回复
const submitReply = async () => {
  try {
    await $axios.post("/api/contact", {
      sellerId: replyForm.sellerId,
      buyerId: replyForm.buyerId,
      message: replyForm.replyMessage,
    });

    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de l'envoi de la réponse :", error);
  }
};

// 将状态选项转换为法语标签
const optionLabel = (status: string): string => {
  switch (status) {
    case "pending":
      return "En attente";
    case "resolved":
      return "Résolu";
    case "closed":
      return "Fermé";
    default:
      return status;
  }
};

// 在组件挂载时加载消息
onMounted(() => {
  fetchMessages();
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>