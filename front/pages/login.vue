<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '~/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const handleLogin = async () => {
  if (!email.value || !password.value) {
    ElMessage.error('Veuillez renseigner tous les champs.') // 提示错误信息
    return
  }

  try {
    await userStore.login(email.value, password.value)
    ElMessage.success('Connexion réussie !') // 提示成功信息
    window.location.href = '/'
  } catch (err) {
    ElMessage.error("Échec de la connexion. Veuillez vérifier vos informations.") // 登录失败提示
  }
}

const loginWithGoogle = () => {
  // 跳转到后端 Google OAuth 登录路由
  window.location.href = 'http://localhost:8001/auth/google';
}

</script>
<template>
  <div class="flex items-center justify-center h-screen bg-gray-100 p-4">
    <div class="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
      <h1 class="text-xl font-bold text-center text-gray-700 mb-6">Connexion</h1>

      <el-form class="space-y-4">
        <el-form-item>
          <el-input
              v-model="email"
              placeholder="Adresse e-mail"
              size="large"
              type="email"
              :clearable="true"
              class="w-full"
          />
        </el-form-item>

        <el-form-item>
          <el-input
              v-model="password"
              placeholder="Mot de passe"
              size="large"
              type="password"
              :clearable="true"
              class="w-full"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              class="w-full"
              @click.prevent="handleLogin"
          >
            Se connecter
          </el-button>
        </el-form-item>
        <el-button type="success"
                   size="large"
                   class="w-full" @click="loginWithGoogle"> Se connecter avec Google</el-button>
      </el-form>

      <p class="text-center text-gray-500 mt-4">
        Pas encore de compte ?
        <a href="/register" class="text-blue-500 hover:underline">Créer un compte</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.el-input {
  border-width: 2px;
  border-radius: 0.5rem;
}
</style>