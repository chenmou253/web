<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <p class="brand__eyebrow">Control Center</p>
        <h1>GO ADMIN</h1>
        <p class="brand__subline">Gin + Vue3 backstage workspace</p>
      </div>
      <div class="nav-shell">
        <div class="nav-shell__label">Navigation</div>
        <el-menu :default-active="route.path" router class="menu-panel">
          <template v-for="menu in treeMenus" :key="menu.id">
            <el-sub-menu v-if="menu.children?.length" :index="menu.path">
              <template #title>{{ menu.title }}</template>
              <el-menu-item v-for="child in menu.children" :key="child.id" :index="child.path">
                {{ child.title }}
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="menu.path">{{ menu.title }}</el-menu-item>
          </template>
        </el-menu>
      </div>
    </aside>
    <main class="main">
      <header class="topbar page-card">
        <div>
          <strong>{{ userStore.userInfo?.nickname || '后台管理' }}</strong>
          <span>{{ route.meta.title }}</span>
        </div>
        <el-button type="primary" plain @click="handleLogout">退出</el-button>
      </header>
      <section class="content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const treeMenus = computed(() => {
  const map = new Map()
  const roots = []
  userStore.menus.forEach((menu) => map.set(menu.id, { ...menu, children: [] }))
  map.forEach((menu) => {
    if (menu.parentId && map.has(menu.parentId)) {
      map.get(menu.parentId).children.push(menu)
    } else {
      roots.push(menu)
    }
  })
  return roots.sort((a, b) => a.sort - b.sort)
})

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}
</script>

<style scoped lang="scss">
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

.sidebar {
  padding: 28px 18px 24px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.28), transparent 36%),
    linear-gradient(180deg, #dbe7df 0%, #bfd1c5 52%, #aec4b8 100%);
  color: #24473c;
  font-family: 'Avenir Next', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  border-right: 1px solid rgba(56, 93, 79, 0.08);
}

.brand {
  padding: 20px 18px 18px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(70, 110, 94, 0.78), rgba(54, 93, 78, 0.72));
  margin-bottom: 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 14px 32px rgba(82, 115, 101, 0.16);
}

.brand h1,
.brand p {
  margin: 0;
}

.brand__eyebrow {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(245, 239, 228, 0.78);
}

.brand h1 {
  margin-top: 8px;
  font-size: 30px;
  line-height: 1;
  letter-spacing: 0.04em;
  color: #fffaf2;
}

.brand__subline {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(245, 239, 228, 0.86);
}

.nav-shell {
  padding: 16px 12px 14px;
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.995), rgba(251, 253, 251, 0.97));
  border: 1px solid rgba(116, 146, 132, 0.1);
  box-shadow:
    0 18px 32px rgba(90, 122, 107, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.nav-shell__label {
  padding: 4px 10px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6b796f;
}

.menu-panel {
  border: 0;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: #29463c;
  --el-menu-hover-bg-color: rgba(36, 81, 66, 0.08);
  --el-menu-active-color: #173c31;
}

.menu-panel :deep(.el-menu) {
  border-right: 0;
  background: transparent;
}

.menu-panel :deep(.el-menu-item),
.menu-panel :deep(.el-sub-menu__title) {
  height: 46px;
  margin: 4px 0;
  border-radius: 18px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.menu-panel :deep(.el-menu-item) {
  color: #29463c;
}

.menu-panel :deep(.el-sub-menu__title) {
  color: #335549;
}

.menu-panel :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #4f7f6d, #5f907d);
  color: #fff7ea;
  box-shadow: 0 12px 24px rgba(86, 124, 108, 0.18);
}

.menu-panel :deep(.el-sub-menu .el-menu-item) {
  margin-left: 10px;
  width: calc(100% - 10px);
  color: #51665d;
}

.menu-panel :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  background: rgba(36, 81, 66, 0.08);
  color: #183d32;
}

.menu-panel :deep(.el-menu-item:hover),
.menu-panel :deep(.el-sub-menu__title:hover) {
  color: #183d32;
}

.main {
  padding: 24px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.topbar span {
  margin-left: 12px;
  color: #6b7280;
}

.content {
  min-height: calc(100vh - 120px);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
