<template>
  <div class="page-card">
    <div class="toolbar">
      <h2>角色管理</h2>
      <el-button v-permission="'role:save'" type="primary" @click="openDialog()">新增角色</el-button>
    </div>
    <el-table :data="roles" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="角色名" />
      <el-table-column prop="code" label="编码" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="240">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button v-permission="'role:save'" link type="primary" @click="openDialog(row)">修改</el-button>
            <el-button
              v-if="row.status === 1"
              v-permission="'role:status'"
              link
              type="warning"
              @click="handleStatusChange(row, 0)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              v-permission="'role:status'"
              link
              type="success"
              @click="handleStatusChange(row, 1)"
            >
              启用
            </el-button>
            <el-popconfirm
              title="删除后不可恢复，确认删除该角色？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button v-permission="'role:delete'" link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        background
        layout="total, sizes, prev, pager, next"
        @change="fetchData"
      />
    </div>
    <el-dialog v-model="visible" title="角色">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="编码"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="菜单">
          <el-tree-select
            :model-value="form.menuIds"
            :data="menuTree"
            :props="{ label: 'title', children: 'children', value: 'id' }"
            @update:model-value="handleMenuChange"
            check-strictly
            collapse-tags
            collapse-tags-tooltip
            filterable
            multiple
            node-key="id"
            show-checkbox
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="权限点">
          <div class="permission-panel">
            <template v-if="permissionGroups.length">
              <section v-for="group in permissionGroups" :key="group.module" class="permission-group">
                <div class="permission-group__title">{{ group.label }}</div>
                <el-checkbox-group :model-value="form.permissionIds" @change="handlePermissionChange">
                  <el-checkbox v-for="item in group.items" :key="item.id" :label="item.id">
                    {{ item.name }} ({{ item.code }})
                  </el-checkbox>
                </el-checkbox-group>
              </section>
            </template>
            <el-empty v-else description="先选择菜单，再勾选对应权限点" :image-size="72" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { deleteRoleApi, getMenusApi, getPermissionsApi, getRolesApi, saveRoleApi, updateRoleStatusApi } from '@/api/system'

const roles = ref([])
const permissions = ref([])
const menus = ref([])
const total = ref(0)
const visible = ref(false)
const query = reactive({ page: 1, pageSize: 10 })
const form = reactive({ id: null, name: '', code: '', description: '', permissionIds: [], menuIds: [], status: 1 })
let syncingSource = ''

const menuMap = computed(() => {
  const map = new Map()
  menus.value.forEach((menu) => map.set(menu.id, menu))
  return map
})

const menuChildrenMap = computed(() => {
  const map = new Map()
  menus.value.forEach((menu) => {
    if (!map.has(menu.parentId)) {
      map.set(menu.parentId, [])
    }
    map.get(menu.parentId).push(menu.id)
  })
  return map
})

const permissionMap = computed(() => {
  const map = new Map()
  permissions.value.forEach((item) => map.set(item.id, item))
  return map
})

const menuTree = computed(() => {
  const map = new Map()
  const roots = []
  menus.value.forEach((menu) => map.set(menu.id, { ...menu, children: [] }))
  map.forEach((menu) => {
    if (menu.parentId && map.has(menu.parentId)) {
      map.get(menu.parentId).children.push(menu)
      return
    }
    roots.push(menu)
  })
  return roots.sort((a, b) => a.sort - b.sort)
})

const activeModules = computed(() => getModulesByMenuIds(form.menuIds))

const permissionGroups = computed(() => {
  const groups = new Map()
  permissions.value.forEach((item) => {
    if (!activeModules.value.has(item.module)) {
      return
    }
    if (!groups.has(item.module)) {
      groups.set(item.module, {
        module: item.module,
        label: getModuleLabel(item.module),
        items: []
      })
    }
    groups.get(item.module).items.push(item)
  })
  return Array.from(groups.values())
})

function resetForm() {
  Object.assign(form, { id: null, name: '', code: '', description: '', permissionIds: [], menuIds: [], status: 1 })
}

function openDialog(row) {
  resetForm()
  if (row) {
    Object.assign(form, {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      permissionIds: row.permissions?.map((item) => item.id) || [],
      menuIds: row.menus?.map((item) => item.id) || []
    })
  }
  visible.value = true
}

async function fetchData() {
  const [roleRes, permissionRes, menuRes] = await Promise.all([
    getRolesApi(query),
    getPermissionsApi(),
    getMenusApi({ page: 1, pageSize: 500 })
  ])
  roles.value = roleRes.data.list
  total.value = roleRes.data.total
  permissions.value = permissionRes.data
  menus.value = menuRes.data.list
}

function getModuleLabel(module) {
  const matchedMenu = menus.value.find((item) => item.permission?.startsWith(`${module}:`))
  return matchedMenu?.title || module
}

function getMenuModule(menu) {
  const [module] = menu?.permission?.split(':') || []
  return module || ''
}

function getModulesByMenuIds(menuIds) {
  const modules = new Set()
  menuIds.forEach((id) => {
    const module = getMenuModule(menuMap.value.get(id))
    if (module) {
      modules.add(module)
    }
  })
  return modules
}

function filterPermissionIdsByMenuIds(menuIds, permissionIds) {
  const modules = getModulesByMenuIds(menuIds)
  return permissionIds.filter((id) => modules.has(permissionMap.value.get(id)?.module))
}

function syncMenuIdsByPermissionIds(menuIds, permissionIds) {
  const selectedModules = new Set(permissionIds.map((id) => permissionMap.value.get(id)?.module).filter(Boolean))
  const selectedMenuIds = new Set(menuIds)
  const keptMenuIds = new Set()

  menuIds.forEach((id) => {
    const menu = menuMap.value.get(id)
    if (!menu) {
      return
    }
    const module = getMenuModule(menu)
    if (module) {
      if (selectedModules.has(module)) {
        keptMenuIds.add(id)
      }
      return
    }
    const childIds = menuChildrenMap.value.get(id) || []
    if (childIds.length === 0) {
      keptMenuIds.add(id)
    }
  })

  let changed = true
  while (changed) {
    changed = false
    Array.from(keptMenuIds).forEach((id) => {
      const parentId = menuMap.value.get(id)?.parentId
      if (parentId && selectedMenuIds.has(parentId) && !keptMenuIds.has(parentId)) {
        keptMenuIds.add(parentId)
        changed = true
      }
    })
  }

  return menuIds.filter((id) => keptMenuIds.has(id))
}

function isSameIdList(a, b) {
  if (a.length !== b.length) {
    return false
  }
  return a.every((item, index) => item === b[index])
}

function setMenuIds(nextMenuIds) {
  if (!isSameIdList(form.menuIds, nextMenuIds)) {
    form.menuIds = nextMenuIds
  }
}

function setPermissionIds(nextPermissionIds) {
  if (!isSameIdList(form.permissionIds, nextPermissionIds)) {
    form.permissionIds = nextPermissionIds
  }
}

function handleMenuChange(value) {
  if (syncingSource === 'permission') {
    setMenuIds(Array.isArray(value) ? value : [])
    return
  }
  syncingSource = 'menu'
  const nextMenuIds = Array.isArray(value) ? value : []
  setMenuIds(nextMenuIds)
  setPermissionIds(filterPermissionIdsByMenuIds(nextMenuIds, form.permissionIds))
  syncingSource = ''
}

function handlePermissionChange(value) {
  if (syncingSource === 'menu') {
    setPermissionIds(Array.isArray(value) ? value : [])
    return
  }
  syncingSource = 'permission'
  const nextPermissionIds = Array.isArray(value) ? value : []
  setPermissionIds(nextPermissionIds)
  setMenuIds(syncMenuIdsByPermissionIds(form.menuIds, nextPermissionIds))
  syncingSource = ''
}

async function submit() {
  await saveRoleApi(form)
  ElMessage.success('保存成功')
  visible.value = false
  fetchData()
}

async function handleStatusChange(row, status) {
  await updateRoleStatusApi(row.id, status)
  ElMessage.success(status === 1 ? '角色已启用' : '角色已禁用')
  fetchData()
}

async function handleDelete(row) {
  await deleteRoleApi(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.permission-panel {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  background: #fafaf5;
}

.permission-group + .permission-group {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--el-border-color-light);
}

.permission-group__title {
  margin-bottom: 10px;
  font-weight: 600;
  color: #234034;
}
</style>
