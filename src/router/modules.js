import DashboardPage from '@/views/dashboard/index.vue'
import UserPage from '@/views/system/user/index.vue'
import RolePage from '@/views/system/role/index.vue'
import MenuPage from '@/views/system/menu/index.vue'
import LogPage from '@/views/system/log/index.vue'
import DevicePage from '@/views/system/device/index.vue'
import OpenAPIToolPage from '@/views/system/openapi/index.vue'

export const componentMap = {
  'dashboard/index': DashboardPage,
  'system/user/index': UserPage,
  'system/role/index': RolePage,
  'system/menu/index': MenuPage,
  'system/device/index': DevicePage,
  'system/openapi/index': OpenAPIToolPage,
  'system/log/index': LogPage,
  'layout/router-view': () => import('@/layout/RouterView.vue')
}
