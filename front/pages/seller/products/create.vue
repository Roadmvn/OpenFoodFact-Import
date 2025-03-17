<template>
  <div class="max-w-2xl mx-auto mt-10">
    <el-card class="shadow-lg">
      <h3 class="text-lg font-bold mb-4">Créer un Produit Interne</h3>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" label-width="100px" class="space-y-4">
        <div class="flex flex-row-reverse justify-between items-center gap-2">
          <el-button type="primary" class="mt-3" @click="search_products">Search</el-button>
          <el-button type="primary" class="mt-3">Add a Product</el-button>
          <!-- 品牌选择框 -->
          <el-form-item label="Brands" prop="brand" class="w-25">
            <el-select
                ref="brandSelect"
                v-model="form.brand"
                placeholder="Choisissez une marque"
                filterable
                :loading="isLoadingBrands"
                :filter-method="handleSearch"
                style="width: 240px"
                @visible-change="handleVisibleChange"
            >
              <!-- 渲染品牌选项 -->
              <el-option
                  v-for="brand in listBrands"
                  :key="brand"
                  :label="brand"
                  :value="brand"
              />
              <!-- 没有数据时显示 -->
              <div v-if="listBrands.length === 0 && !isLoadingBrands" class="text-center p-2 text-gray-500">
                <span>没有匹配的品牌</span>
              </div>
              <!-- 加载中提示 -->
              <div v-if="isLoadingBrands" class="text-center p-2 text-gray-500">
                <span>正在加载中...</span>
              </div>
            </el-select>
          </el-form-item>

          <el-form-item label="Produit" class="w-75">
            <el-input v-model="product_name" placeholder="Produit Name" type="text" />
          </el-form-item>
        </div>

        <div v-if="res_products.length > 0" class="flex flex-col gap-4 py-2" style="max-height: 400px; overflow-y: auto; cursor: pointer;">
          <el-card
              v-for="product in res_products"
              :key="product.id"
              style="width: 100%; min-height: 70px;"
              shadow="hover"
              class="flex flex-row justify-between items-center gap-2"
              @click="add_product(product.id)"
          >
            <el-image :src="product.image_url" style="width: 55px;height: 55px;"></el-image>
            <el-text tag="b" style="font-size: 16px; line-height: 24px;">{{ product.name + ' - (' + product.code + ')'}}</el-text>
            <el-tag>{{ product.price }}</el-tag>
          </el-card>
        </div>

        <el-form-item label="Product Name" prop="product_name">
          <el-input v-model="form.product_name" placeholder="Entrez le nom du produit" type="text" disabled/>
        </el-form-item>

        <el-form-item label="Product Img" v-if="form.product_img">
          <el-image :src="form.product_img"></el-image>
        </el-form-item>

        <!-- Price -->
        <el-form-item label="Prix (€)" prop="price">
          <el-input v-model="form.price" placeholder="Entrez le prix" type="number" />
        </el-form-item>

        <!-- Quantity -->
        <el-form-item label="Quantité" prop="quantity">
          <el-input v-model="form.quantity" placeholder="Entrez la quantité" type="number" />
        </el-form-item>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <el-button @click="handleSubmit" type="primary" size="large">Créer</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from "vue";
import { ElMessage } from "element-plus";
import debounce from "lodash/debounce"; // 引入 debounce

// 初始化 Nuxt Axios
const { $axios } = useNuxtApp();

const res_products = ref<any[]>([]);

// 品牌数据管理
const listBrands = ref<string[]>([]); // 当前显示的品牌列表
const isLoadingBrands = ref(false); // 是否正在加载品牌数据
const hasMoreBrands = ref(true); // 是否还有更多品牌数据可以加载
const searchQuery = ref(""); // 当前搜索关键字
const currentPage = ref(1); // 当前页码，用于分页加载
const product_name = ref("");

// 用于表单组件的 ref
const formRef = ref(null);

// 表单数据
const form = reactive({
  sellerId: null as number | null,
  productId: null as number | null,
  price: null as number | null,
  quantity: null as number | null,
  brand: "", // 当前选择的品牌
  product_name: "",
  product_img: "",
});

const add_product = async (product_id: any) => {
  form.productId = product_id;
  form.product_name = res_products.value.find((product: any) => product.id === product_id)?.name;
  form.product_img = res_products.value.find((product: any) => product.id === product_id)?.image_url;
  listBrands.value = [];
  res_products.value = [];
}

// 表单规则
const rules = {
  productId: [
    { required: true, message: "L'ID produit est obligatoire", trigger: "blur" },
    { type: "number", message: "Doit être un ID valide", trigger: "change" },
  ],
  price: [
    { required: true, message: "Le prix est obligatoire", trigger: "blur" },
    {
      validator: (rule: any, value: number, callback: Function) => {
        if (!value || isNaN(value)) callback(new Error("Le prix doit être un nombre valide (ex: 19.99)"));
        else if (value <= 0) callback(new Error("Le prix doit être supérieur à 0"));
        else callback();
      },
      trigger: "change",
    },
  ],
  quantity: [
    { required: true, message: "La quantité est obligatoire", trigger: "blur" },
  ],
  brand: [
    { required: false, message: "Veuillez sélectionner une marque", trigger: "change" },
  ],
  product_name: [
    { required: true, message: "Le nom du produit est obligatoire", trigger: "blur" },
  ]
};

// 动态加载品牌数据（支持分页加载）
const loadBrands = async (query = "", page = 1) => {
  // 防止重复加载
  if (isLoadingBrands.value || (!hasMoreBrands.value && query === searchQuery.value)) return;

  isLoadingBrands.value = true;
  try {
    const response = await $axios.get("/api/products/products/getBrands", {
      params: { query, page, limit: 20 },
    });

    if (response.status === 200) {
      const brands = response.data?.brands || [];
      if (page === 1) {
        // 重置品牌列表
        listBrands.value = brands;
      } else {
        // 分页加载：追加品牌
        listBrands.value = [...listBrands.value, ...brands];
      }

      // 如果返回的品牌数量不足说明没有更多数据
      hasMoreBrands.value = brands.length >= 20;
      currentPage.value = page; // 更新页码
    } else {
      ElMessage.error("加载品牌失败！");
    }
  } catch (error) {
    ElMessage.error("加载品牌时出错！");
    listBrands.value = [];
  } finally {
    isLoadingBrands.value = false;
    searchQuery.value = query; // 更新搜索查询
  }
};

// 搜索处理（防抖触发搜索）
const handleSearch = debounce(async (query: string) => {
  searchQuery.value = query; // 保存搜索关键字
  currentPage.value = 1; // 搜索时重置页码
  hasMoreBrands.value = true; // 恢复分页可加载状态
  await loadBrands(query, 1); // 加载搜索数据
}, 300); // 防抖延迟 300ms

// 处理弹窗显示
const handleVisibleChange = async (isVisible: boolean) => {
  if (isVisible) {
    console.log("下拉框打开...");
    if (listBrands.value.length === 0) {
      await loadBrands(""); // 首次加载数据
    }

    await nextTick(() => {
      // 绑定滚动事件
      const dropdown = document.querySelector(".el-select-dropdown__wrap");
      if (dropdown) {
        dropdown.addEventListener("scroll", handleScroll);
      }
    });
  }
};

// 滚动处理：分页加载
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
    console.log("滚动到底部，加载下一页数据...");
    await loadBrands(searchQuery.value, currentPage.value);
  }
};

const search_products = async () => {
  try{
    const response = await $axios.get("/api/products/products/searchProducts", {
      params: {
        q: product_name.value,
        brand: form.brand,
      },
    });

    res_products.value = response.data?.products;
  }catch(error){
    ElMessage.error("Error: ");
  }
}

// 提交表单处理
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    const response = await $axios.post("/api/internal-products", {
      sellerId: form.sellerId,
      productId: form.productId,
      price: form.price,
      quantity: form.quantity,
      brand: form.brand,
    });

    if (response.status === 201 || response.status === 200) {
      ElMessage.success("Produit créé avec succès !");
      window.location.href = "/seller/products";
    } else {
      throw new Error(response.data?.message || "创建产品失败");
    }
  } catch (error) {
    console.error("提交失败：", error);
    ElMessage.error("提交失败，请稍后重试...");
  }
};
</script>