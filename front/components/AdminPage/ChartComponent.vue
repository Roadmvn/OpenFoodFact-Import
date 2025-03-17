<template>
  <div class="p-6 flex flex-col items-center">
    <h1 class="text-2xl font-bold mb-6">Enregistrements des Utilisateurs</h1>
    <div v-if="loading" class="text-xl">Chargement des données...</div>
    <canvas v-show="!loading" id="userChart" class="w-full max-w-4xl"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import Chart from "chart.js/auto"; // Chart.js 自动加载支持
import axios from "axios";

const { $axios } = useNuxtApp();

// 定义用户接口类型
interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email: string;
  role: string;
  googleId?: string | null;
  createdAt: string; // 日期字符串
  updatedAt: string;
}

// 定义按日期分组的数据接口
interface GroupedData {
  [date: string]: {
    [role: string]: number; // 每个角色的数量
  };
}

// 状态变量
const loading = ref(true); // 数据加载状态
const usersByDate = ref<GroupedData>({}); // 按日期分组的用户数据

// Axios API 基地址
const apiUrl = "/api/user/users";

// 函数：转换数据为图表所需格式
const processData = (users: User[]): GroupedData => {
  const groupedData: GroupedData = {};

  // 遍历用户，按日期和角色分组
  users.forEach((user) => {
    const date = new Date(user.createdAt).toISOString().split("T")[0]; // 提取日期部分
    const role = user.role;

    if (!groupedData[date]) {
      groupedData[date] = {}; // 初始化日期分组
    }
    groupedData[date][role] = (groupedData[date][role] || 0) + 1; // 累加角色数量
  });

  return groupedData;
};

// 函数：绘制折线图
const renderChart = () => {
  const canvasElem = document.getElementById("userChart") as HTMLCanvasElement;
  const ctx = canvasElem?.getContext("2d");

  if (!ctx) {
    console.error("无法获取 canvas 的上下文，请检查 DOM 元素");
    return;
  }

  const labels = Object.keys(usersByDate.value); // 按日期作为图表的 X 轴标签

  // 准备角色数据
  const adminData = labels.map((date) => usersByDate.value[date].admin || 0); // Admin 数据
  const buyerData = labels.map((date) => usersByDate.value[date].buyer || 0); // Buyer 数据
  const sellerData = labels.map((date) => usersByDate.value[date].seller || 0); // Seller 数据

  // Chart.js 配置
  new Chart(ctx, {
    type: "line",
    data: {
      labels, // 横轴标签
      datasets: [
        {
          label: "Admin",
          data: adminData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Buyer",
          data: buyerData,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Seller",
          data: sellerData,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Nombre d'utilisateurs",
          },
          beginAtZero: true,
        },
      },
    },
  });
};

// 生命周期：挂载时获取数据并渲染图表
onMounted(async () => {
  try {
    // 使用 Axios 请求数据
    const response = await $axios.get(apiUrl);

    // 获取用户列表并进行类型断言
    const users: User[] = response.data.users;

    // 转换数据为按日期分组格式
    usersByDate.value = processData(users);

    // 确保 DOM 完整渲染后再绘制图表
    await nextTick();

    // 数据加载完毕后绘制图表
    renderChart();
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
  } finally {
    loading.value = false; // 设置加载状态为完成
  }
});
</script>

<style scoped>
canvas {
  max-width: 600px;
  margin-top: 2rem;
}
</style>