<template>
  <div class="page-card">
    <div class="toolbar">
      <h2>用户管理</h2>
      <el-button v-permission="'user:save'" type="primary" @click="openDialog()">新增用户</el-button>
    </div>
    <el-table :data="users" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column label="角色">
        <template #default="{ row }">
          {{ row.roles?.map((item) => item.name).join(' / ') }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="260">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button v-permission="'user:save'" link type="primary" @click="openDialog(row)">修改</el-button>
            <el-button
              v-if="row.status === 1"
              v-permission="'user:status'"
              link
              type="warning"
              @click="handleStatusChange(row, 0)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              v-permission="'user:status'"
              link
              type="success"
              @click="handleStatusChange(row, 1)"
            >
              启用
            </el-button>
            <el-popconfirm
              title="删除后不可恢复，确认删除该用户？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button v-permission="'user:delete'" link type="danger">删除</el-button>
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
    <el-dialog v-model="visible" title="用户">
      <el-form :model="form" label-width="90px">
        <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleIds" multiple style="width: 100%">
            <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { deleteUserApi, getRolesApi, getUsersApi, saveUserApi, updateUserStatusApi } from '@/api/system'

const users = ref([])
const roles = ref([])
const total = ref(0)
const visible = ref(false)
const query = reactive({ page: 1, pageSize: 10 })
const form = reactive({ id: null, username: '', nickname: '', password: '', roleIds: [], status: 1 })

function resetForm() {
  Object.assign(form, { id: null, username: '', nickname: '', password: '', roleIds: [], status: 1 })
}

function openDialog(row) {
  resetForm()
  if (row) {
    Object.assign(form, row, { roleIds: row.roles?.map((item) => item.id) || [], password: '' })
  }
  visible.value = true
}

async function fetchData() {
  const [userRes, roleRes] = await Promise.all([
    getUsersApi(query),
    getRolesApi({ page: 1, pageSize: 500 })
  ])
  users.value = userRes.data.list
  total.value = userRes.data.total
  roles.value = roleRes.data.list
}

async function submit() {
  await saveUserApi(form)
  ElMessage.success('保存成功')
  visible.value = false
  fetchData()
}

async function handleStatusChange(row, status) {
  await updateUserStatusApi(row.id, status)
  ElMessage.success(status === 1 ? '用户已启用' : '用户已禁用')
  fetchData()
}

async function handleDelete(row) {
  await deleteUserApi(row.id)
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
</style>
