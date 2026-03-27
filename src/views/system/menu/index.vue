<template>
  <div class="page-card">
    <div class="toolbar">
      <h2>菜单管理</h2>
      <el-button v-permission="'menu:save'" type="primary" @click="openDialog()">新增菜单</el-button>
    </div>
    <el-table
      :data="menuTree"
      border
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column prop="path" label="路径" min-width="180" />
      <el-table-column prop="component" label="组件" min-width="180" />
      <el-table-column prop="permission" label="权限标识" min-width="140" />
      <el-table-column label="下属权限点" min-width="300">
        <template #default="{ row }">
          <div v-if="getRelatedPermissions(row).length" class="permission-tags">
            <el-tag
              v-for="item in getRelatedPermissions(row)"
              :key="item.id"
              size="small"
              type="success"
              effect="plain"
            >
              {{ item.name }} ({{ item.code }})
            </el-tag>
          </div>
          <span v-else class="permission-empty">无</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button v-permission="'menu:save'" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button v-permission="'menu:save'" link type="success" @click="openPermissionDialog(row)">权限点</el-button>
            <el-popconfirm
              title="删除前请先移除子菜单，确认删除该菜单？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button v-permission="'menu:save'" link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="visible" title="菜单">
      <el-form :model="form" label-width="100px">
        <el-form-item label="父级">
          <el-select v-model="form.parentId" style="width: 100%">
            <el-option :value="0" label="根菜单" />
            <el-option v-for="item in parentOptions" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="Name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="Path"><el-input v-model="form.path" /></el-form-item>
        <el-form-item label="Component"><el-input v-model="form.component" /></el-form-item>
        <el-form-item label="权限"><el-input v-model="form.permission" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="permissionVisible" :title="`${permissionMenuTitle} · 权限点`" width="720px">
      <div class="permission-toolbar">
        <div class="permission-toolbar__hint">模块：{{ currentPermissionModule || '未配置' }}</div>
        <el-button type="primary" @click="openPermissionEditor()">新增权限点</el-button>
      </div>
      <el-table :data="currentPermissions" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="code" label="编码" min-width="220" />
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="openPermissionEditor(row)">编辑</el-button>
              <el-popconfirm title="确认删除该权限点？" @confirm="handlePermissionDelete(row)">
                <template #reference>
                  <el-button link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog v-model="permissionEditorVisible" title="权限点" width="480px">
      <el-form :model="permissionForm" label-width="90px">
        <el-form-item label="名称"><el-input v-model="permissionForm.name" /></el-form-item>
        <el-form-item label="编码"><el-input v-model="permissionForm.code" /></el-form-item>
        <el-form-item label="模块"><el-input v-model="permissionForm.module" disabled /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permissionEditorVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPermission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { deleteMenuApi, deletePermissionApi, getMenusApi, getPermissionsApi, saveMenuApi, savePermissionApi } from '@/api/system'

const menus = ref([])
const permissions = ref([])
const visible = ref(false)
const permissionVisible = ref(false)
const permissionEditorVisible = ref(false)
const currentPermissionModule = ref('')
const permissionMenuTitle = ref('')
const form = reactive({
  id: null,
  parentId: 0,
  title: '',
  name: '',
  path: '',
  component: '',
  icon: '',
  permission: '',
  sort: 0,
  menuType: 'menu',
  status: 1
})
const permissionForm = reactive({
  id: null,
  name: '',
  code: '',
  module: ''
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
  map.forEach((menu) => {
    menu.children.sort((a, b) => a.sort - b.sort)
  })
  return roots.sort((a, b) => a.sort - b.sort)
})

const parentOptions = computed(() => menus.value.filter((item) => item.id !== form.id))
const currentPermissions = computed(() => permissions.value.filter((item) => item.module === currentPermissionModule.value))

function resetForm() {
  Object.assign(form, {
    id: null,
    parentId: 0,
    title: '',
    name: '',
    path: '',
    component: '',
    icon: '',
    permission: '',
    sort: 0,
    menuType: 'menu',
    status: 1
  })
}

function openDialog(row) {
  resetForm()
  if (row) {
    Object.assign(form, row)
  }
  visible.value = true
}

function resetPermissionForm() {
  Object.assign(permissionForm, { id: null, name: '', code: '', module: currentPermissionModule.value })
}

function openPermissionDialog(row) {
  const module = row.permission?.split(':')?.[0]
  if (!module) {
    ElMessage.warning('请先给该菜单配置权限标识，例如 user:list')
    return
  }
  currentPermissionModule.value = module
  permissionMenuTitle.value = row.title
  permissionVisible.value = true
}

function openPermissionEditor(row) {
  resetPermissionForm()
  if (row) {
    Object.assign(permissionForm, row)
  }
  permissionForm.module = currentPermissionModule.value
  permissionEditorVisible.value = true
}

async function fetchData() {
  const [menuRes, permissionRes] = await Promise.all([
    getMenusApi({ page: 1, pageSize: 500 }),
    getPermissionsApi()
  ])
  menus.value = menuRes.data.list
  permissions.value = permissionRes.data
}

function getRelatedPermissions(menu) {
  const module = menu.permission?.split(':')?.[0]
  if (!module) {
    return []
  }
  return permissions.value.filter((item) => item.module === module)
}

async function submit() {
  await saveMenuApi(form)
  ElMessage.success('保存成功')
  visible.value = false
  fetchData()
}

async function submitPermission() {
  await savePermissionApi(permissionForm)
  ElMessage.success('权限点保存成功')
  permissionEditorVisible.value = false
  fetchData()
}

async function handleDelete(row) {
  await deleteMenuApi(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handlePermissionDelete(row) {
  await deletePermissionApi(row.id)
  ElMessage.success('权限点删除成功')
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

.permission-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.permission-toolbar__hint {
  color: #64748b;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-empty {
  color: #94a3b8;
}
</style>
