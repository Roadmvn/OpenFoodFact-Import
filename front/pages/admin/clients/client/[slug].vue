<template>
  <div class="p-4 flex flex-col items-center">
    <!-- 标题 -->
    <h1 class="text-2xl font-bold mb-6">Modifier les informations de l'utilisateur</h1>

    <!-- 加载状态 -->
    <div v-if="chargement" class="text-center text-xl">
      Chargement en cours...
    </div>

    <!-- 表单开始 -->
    <el-form
        v-else
        :model="userForm"
        :rules="rules"
        label-width="150px"
        class="w-full max-w-4xl"
    >
      <!-- 姓 -->
      <el-form-item label="Prénom" prop="firstName">
        <el-input v-model="userForm.firstName" placeholder="Entrez le prénom" />
      </el-form-item>

      <!-- 名 -->
      <el-form-item label="Nom" prop="lastName">
        <el-input v-model="userForm.lastName" placeholder="Entrez le nom" />
      </el-form-item>

      <!-- 电话 -->
      <el-form-item label="Téléphone">
        <el-input v-model="userForm.phone" placeholder="Entrez le numéro de téléphone" />
      </el-form-item>

      <!-- 住址 -->
      <el-form-item label="Adresse">
        <el-input v-model="userForm.address" placeholder="Entrez l'adresse" />
      </el-form-item>

      <!-- 邮政编码 -->
      <el-form-item label="Code postal">
        <el-input v-model="userForm.zipCode" placeholder="Entrez le code postal" />
      </el-form-item>

      <!-- 城市 -->
      <el-form-item label="Ville">
        <el-input v-model="userForm.city" placeholder="Entrez la ville" />
      </el-form-item>

      <!-- 国家 -->
      <el-form-item label="Pays">
        <el-input v-model="userForm.country" placeholder="Entrez le pays" />
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item label="Email" prop="email">
        <el-input v-model="userForm.email" placeholder="Entrez l'email" />
      </el-form-item>

      <!-- 角色 -->
      <el-form-item label="Rôle">
        <el-select v-model="userForm.role" placeholder="Choisissez un rôle">
          <el-option label="Administrateur" value="admin" />
          <el-option label="Acheteur" value="buyer" />
          <el-option label="Vendeur" value="seller" />
        </el-select>
      </el-form-item>

      <!-- 按钮 -->
      <el-form-item>
        <el-button
            type="primary"
            @click="updateUser"
            :loading="enCoursDeMiseAJour"
        >
          Mettre à jour
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";

const { $axios } = useNuxtApp();
const route = useRoute();

const chargement = ref(true); // 当前加载状态
const enCoursDeMiseAJour = ref(false); // 当前更新状态

// 用户表单绑定数据
const userForm = ref({
  id: null,
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  zipCode: "",
  city: "",
  country: "",
  email: "",
  role: "",
});

// 验证规则
const rules = {
  firstName: [{ required: true, message: "Veuillez entrer le prénom", trigger: "blur" }],
  lastName: [{ required: true, message: "Veuillez entrer le nom", trigger: "blur" }],
  email: [
    { type: "email", message: "Veuillez entrer une adresse email valide", trigger: "blur" },
    { required: true, message: "Veuillez entrer l'email", trigger: "blur" },
  ],
};

// 获取用户信息
const fetchUser = async () => {
  try {
    chargement.value = true;

    // API 请求用户信息
    const userId = route.params.slug;
    const response = await $axios.get(`/api/user/user/${userId}`);

    // 将用户数据绑定到表单
    Object.assign(userForm.value, response.data.user);
  } catch (error) {
    ElMessage.error("Impossible de charger les informations de l'utilisateur !");
    console.error("Erreur de chargement:", error);
  } finally {
    chargement.value = false;
  }
};

// 更新用户信息
const updateUser = async () => {
  try {
    enCoursDeMiseAJour.value = true;

    // API 请求更新用户信息
    const userId = userForm.value.id;
    const response = await $axios.put(
        `/api/user/updateUserByAdmin/${userId}`,
        userForm.value
    );

    if (response.status === 200) {
      ElMessage.success("Informations de l'utilisateur mises à jour avec succès !");
      await fetchUser(); // 更新完成后重新加载用户数据
    } else {
      ElMessage.error("Erreur lors de la mise à jour de l'utilisateur !");
    }
  } catch (error) {
    ElMessage.error("Impossible de mettre à jour l'utilisateur !");
    console.error("Erreur de mise à jour:", error);
  } finally {
    enCoursDeMiseAJour.value = false;
  }
};

// 当组件挂载时加载数据
onMounted(() => {
  fetchUser();
});
</script>