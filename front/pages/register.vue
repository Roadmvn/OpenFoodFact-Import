<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const billingDetails = ref({
  address: '',
  zip_code: '',
  city: '',
  country: '',
})

// 提交注册表单
const handleRegister = async () => {
  // 检查数据完整性
  if (
      !email.value ||
      !password.value ||
      !confirmPassword.value ||
      !firstName.value ||
      !lastName.value ||
      !phone.value ||
      !billingDetails.value.address ||
      !billingDetails.value.zip_code ||
      !billingDetails.value.city ||
      !billingDetails.value.country
  ) {
    ElMessage.error('Veuillez remplir tous les champs requis.') // 提示用户填写所有字段
    return
  }

  // 检查两次密码是否一致
  if (password.value !== confirmPassword.value) {
    ElMessage.error('Les deux mots de passe ne correspondent pas.') // 提示密码不一致
    return
  }

  const { $axios } = useNuxtApp()
  try {
    // 调用后端注册接口
    await $axios.post('/auth/register', {
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      phone: phone.value,
      address: billingDetails.value.address,
      zip_code: billingDetails.value.zip_code,
      city: billingDetails.value.city,
      country: billingDetails.value.country,
    })

    // 显示成功提示
    ElMessage.success('Inscription réussie ! Veuillez vous connecter.')
    // 清空表单
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    firstName.value = ''
    lastName.value = ''
    phone.value = ''
    billingDetails.value = {
      address: '',
      zip_code: '',
      city: '',
      country: '',
    }
    navigateTo('/login')
  } catch (err) {
    ElMessage.error("Échec de l'inscription. Veuillez vérifier vos informations.")
  }
}
</script>

<template>
  <div class="flex items-center justify-center bg-gray-100 h-screen p-4">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
      <h2 class="text-2xl font-semibold text-center mb-6">Inscription</h2>
      <el-form class="space-y-4">

        <!-- 邮箱 -->
        <el-form-item>
          <el-input
              v-model="email"
              placeholder="Adresse e-mail"
              size="large"
              type="email"
              :clearable="true"
              prefix-icon="el-icon-message"
              class="w-full"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item>
          <el-input
              v-model="password"
              placeholder="Mot de passe"
              size="large"
              type="password"
              :clearable="true"
              prefix-icon="el-icon-lock"
              class="w-full"
          />
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item>
          <el-input
              v-model="confirmPassword"
              placeholder="Confirmer le mot de passe"
              size="large"
              type="password"
              :clearable="true"
              prefix-icon="el-icon-lock"
              class="w-full"
          />
        </el-form-item>

        <!-- 姓名 -->
        <div class="flex space-x-2">
          <el-form-item class="flex-1">
            <el-input
                v-model="firstName"
                placeholder="Prénom"
                size="large"
                :clearable="true"
                class="w-full"
            />
          </el-form-item>

          <el-form-item class="flex-1">
            <el-input
                v-model="lastName"
                placeholder="Nom"
                size="large"
                :clearable="true"
                class="w-full"
            />
          </el-form-item>
        </div>

        <!-- 电话号码 -->
        <el-form-item>
          <el-input
              v-model="phone"
              placeholder="Numéro de téléphone"
              size="large"
              :clearable="true"
              prefix-icon="el-icon-phone"
              class="w-full"
          />
        </el-form-item>

        <!-- 地址 -->
        <el-form-item>
          <el-input
              v-model="billingDetails.address"
              placeholder="Adresse"
              size="large"
              :clearable="true"
              class="w-full"
          />
        </el-form-item>

        <!-- 邮编和城市 -->
        <div class="flex space-x-2">
          <el-form-item class="flex-1">
            <el-input
                v-model="billingDetails.city"
                placeholder="Ville"
                size="large"
                :clearable="true"
                class="w-full"
            />
          </el-form-item>

          <el-form-item class="flex-1">
            <el-input
                v-model="billingDetails.zip_code"
                placeholder="Code Postal"
                size="large"
                :clearable="true"
                class="w-full"
            />
          </el-form-item>
        </div>

        <!-- 国家 -->
        <el-form-item>
          <el-input
              v-model="billingDetails.country"
              placeholder="Pays"
              size="large"
              :clearable="true"
              class="w-full"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
              type="primary"
              size="large"
              class="w-full"
              @click.prevent="handleRegister"
          >
            S'inscrire
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.el-input {
  border-width: 2px;
  border-radius: 0.5rem;
}
.el-button {
  font-weight: bold;
  border-radius: 0.5rem;
}
</style>