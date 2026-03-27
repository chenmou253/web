import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { componentMap } from './modules'

const staticRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: []
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes
})

function toRouteRecord(menu) {
  const component = componentMap[menu.component]
  if (!component || menu.hidden) {
    return null
  }
  return {
    path: menu.path,
    name: menu.name,
    component,
    meta: {
      title: menu.title,
      icon: menu.icon,
      permission: menu.permission
    }
  }
}

export function setupDynamicRoutes(menus) {
  menus
    .filter((item) => item.menuType === 'menu')
    .forEach((menu) => {
      const record = toRouteRecord(menu)
      if (record && !router.hasRoute(record.name)) {
        router.addRoute('Layout', record)
      }
    })
}

router.beforeEach(async (to) => {
  const userStore = useUserStore()
  if (to.path === '/login') {
    return true
  }
  if (!userStore.accessToken) {
    return '/login'
  }
  if (!userStore.routesReady) {
    try {
      await userStore.fetchProfile()
      setupDynamicRoutes(userStore.menus)
      userStore.routesReady = true
      return to.fullPath
    } catch (_) {
      if (!userStore.accessToken) {
        return '/login'
      }
      return false
    }
  }
  return true
})

export default router
