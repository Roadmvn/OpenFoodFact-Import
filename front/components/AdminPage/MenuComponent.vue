<template>
  <el-row class="tac">
    <el-col :span="12">
      <el-menu
          default-active="3"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
      >
        <el-menu-item index="3" @click="to_route('/admin')">
          <el-icon><icon-menu /></el-icon>
          <span>Tableau de bord</span>
        </el-menu-item>
        <el-sub-menu index="1">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>Clients</span>
          </template>
          <el-menu-item index="1-1" @click="to_route('/admin/clients')">Clients</el-menu-item>
          <el-menu-item index="1-2" @click="to_route('/admin/factures')">Factures</el-menu-item>
          <el-menu-item index="1-3" @click="to_route('/admin/commandes')">Commandes</el-menu-item>
          <el-menu-item index="1-4" @click="to_route('/admin/contacts')">Contacts</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="2" @click="to_route('/admin/products')">
          <el-icon><icon-menu /></el-icon>
          <span>Products</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import {
  Document,
  Menu as IconMenu,
  UserFilled,
  Setting,
} from '@element-plus/icons-vue'
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const to_route = (path) => {
  window.location.href = path;
}
</script>
<style scoped>
.el-col-12{
  max-width: 100%;
}

.el-row{
  display: block;
}
</style>