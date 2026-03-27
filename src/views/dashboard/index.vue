<template>
  <div class="page-card">
    <h2>工作台</h2>
    <el-row :gutter="16">
      <el-col :md="8" :xs="24">
        <el-statistic title="当前用户" :value="userStore.userInfo?.nickname || '-'" />
      </el-col>
      <el-col :md="8" :xs="24">
        <el-statistic title="角色数量" :value="userStore.userInfo?.roles?.length || 0" />
      </el-col>
      <el-col :md="8" :xs="24">
        <el-statistic title="权限点" :value="userStore.permissions.length" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
</script>
