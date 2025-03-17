<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-semibold mb-6 text-center">Your Profile</h1>

    <div v-if="loading" class="flex justify-center items-center h-96">
      <el-icon loading class="text-gray-500"></el-icon>
      <p class="ml-2 text-gray-500">Loading...</p>
    </div>

    <div v-else class="max-w-3xl mx-auto">
      <!-- Profile Card -->
      <div class="rounded-lg shadow-md bg-white p-6">
        <h2 class="text-xl font-bold mb-4 text-gray-700">Update Your Information</h2>

        <el-form
            :model="form"
            :rules="rules"
            ref="formRef"
            label-position="top"
            label-width="auto"
            class="space-y-5"
        >
          <!-- First Name -->
          <el-form-item label="First Name" prop="firstName">
            <el-input
                v-model="form.firstName"
                placeholder="Enter your first name"
                clearable
                class="rounded-md"
            />
          </el-form-item>

          <!-- Last Name -->
          <el-form-item label="Last Name" prop="lastName">
            <el-input
                v-model="form.lastName"
                placeholder="Enter your last name"
                clearable
                class="rounded-md"
            />
          </el-form-item>

          <!-- Phone -->
          <el-form-item label="Phone" prop="phone">
            <el-input
                v-model="form.phone"
                placeholder="Enter your phone number"
                clearable
                class="rounded-md"
            />
          </el-form-item>

          <!-- Address -->
          <el-form-item label="Address" prop="address">
            <el-input
                v-model="form.address"
                placeholder="Enter your address"
                clearable
                class="rounded-md"
            />
          </el-form-item>

          <!-- Zip Code -->
          <el-form-item label="Zip Code" prop="zipCode">
            <el-input
                v-model="form.zipCode"
                placeholder="Enter your zip code"
                clearable
                class="rounded-md"
            />
          </el-form-item>

          <!-- City -->
          <el-form-item label="City" prop="city">
            <el-input
                v-model="form.city"
                placeholder="Enter your city"
                clearable
                class="rounded-md"
            />
          </el-form-item>

          <!-- Country -->
          <el-form-item label="Country" prop="country">
            <el-input
                v-model="form.country"
                placeholder="Enter your country"
                clearable
                class="rounded-md"
            />
          </el-form-item>

          <!-- Submit Button -->
          <div class="text-center">
            <el-button
                type="primary"
                @click="onSubmit"
                :loading="submitting"
                size="large"
                class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Save Changes
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus"; // 使用 Element Plus 消息提示

const { $axios } = useNuxtApp()

// 表单数据
const form = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  zipCode: "",
  city: "",
  country: "",
});

// 表单验证规则
const rules = {
  firstName: [{ required: true, message: "First Name is required", trigger: "blur" }],
  lastName: [{ required: true, message: "Last Name is required", trigger: "blur" }],
  phone: [{ required: true, message: "Phone is required", trigger: "blur" }],
  address: [{ required: true, message: "Address is required", trigger: "blur" }],
  zipCode: [{ required: true, message: "Zip Code is required", trigger: "blur" }],
  city: [{ required: true, message: "City is required", trigger: "blur" }],
  country: [{ required: true, message: "Country is required", trigger: "blur" }],
};

// 加载状态
const loading = ref(false);
const submitting = ref(false);

// 表单引用
const formRef = ref(null);

// 获取用户信息
const getUserProfile = async () => {
  try {
    loading.value = true;
    const response = await $axios.get("/auth/me"); // 替换为真实接口
    const user = response.data.user;

    // 填充表单数据
    form.firstName = user.firstName || "";
    form.lastName = user.lastName || "";
    form.phone = user.phone || "";
    form.address = user.address || "";
    form.zipCode = user.zipCode || "";
    form.city = user.city || "";
    form.country = user.country || "";
  } catch (error) {
    window.location.href = "/401";
    console.error("Error retrieving profile:", error);
    ElMessage.error("Failed to load profile data");
  } finally {
    loading.value = false;
  }
};

// 提交表单
const onSubmit = async () => {
  try {
    submitting.value = true;

    // 验证表单
    await formRef.value.validate();

    await $axios.get('/api/user/csrf-token').then(res => {

      const csrf_token = res.data.csrfToken

      $axios.put("/api/user/update_user", form,{
        headers: {
          'X-CSRF-Token': csrf_token
        }
      });
      ElMessage.success("Profile updated successfully");
    })

  } catch (error) {
    console.error("Error updating profile:", error);
    ElMessage.error("Failed to update profile");
  } finally {
    submitting.value = false;
  }
};

// 页面挂载时加载用户信息
onMounted(() => {
  getUserProfile();
});
</script>

<style scoped>
.container {
  max-width: 1000px;
}

h1 {
  color: #334155; /* 深灰色标题 */
}

.el-form-item label {
  font-weight: 500; /* 加粗标签文字 */
}

.el-input__inner {
  border-radius: 8px;
  padding: 10px;
}

.el-button {
  padding: 10px 20px;
}
</style>