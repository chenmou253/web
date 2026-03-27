<template>
  <div class="login-page">
    <div class="hero">
      <p class="eyebrow">COMPUTING POWER POOL SERVICE PLATFORM</p>
      <h1>网吧管理后台</h1>
      <p class="subtitle">gin + vue + vite </p>
    </div>
    <div class="login-card page-card">
      <h2>登录</h2>
      <el-form :model="form" label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="admin" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="123456" show-password />
        </el-form-item>
        <el-button type="primary" class="submit" @click="handleLogin">进入后台</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { setupDynamicRoutes } from '@/router'

const router = useRouter()
const userStore = useUserStore()
const form = reactive({
  username: 'admin',
  password: '123456'
})

async function handleLogin() {
  try {
    await userStore.login(form)
    setupDynamicRoutes(userStore.menus)
    userStore.routesReady = true
    router.replace('/dashboard')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 1fr);
  padding: 32px;
  gap: 24px;
  align-items: center;
}

.hero {
  padding: 36px;
}

.eyebrow {
  letter-spacing: 0.3em;
  color: var(--color-primary);
}

.hero h1 {
  max-width: 520px;
  font-size: 56px;
  line-height: 1.05;
  margin: 0 0 12px;
}

.subtitle {
  color: #4b5563;
}

.login-card {
  max-width: 420px;
  width: 100%;
  justify-self: start;
  transform: translateX(-40px);
}

.submit {
  width: 100%;
}

.login-card :deep(.el-form) {
  width: 100%;
}

.login-card :deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-weight: 600;
  color: #334155;
}

.login-card :deep(.el-input__wrapper) {
  min-height: 44px;
}

@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 38px;
  }

  .login-card {
    margin: 0;
    transform: none;
  }
}
</style>
