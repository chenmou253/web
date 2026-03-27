import { useUserStore } from '@/store/user'

export function setupPermissionDirective(app) {
  app.directive('permission', {
    mounted(el, binding) {
      const userStore = useUserStore()
      const permission = binding.value
      if (permission && !userStore.permissions.includes(permission)) {
        el.parentNode?.removeChild(el)
      }
    }
  })
}
