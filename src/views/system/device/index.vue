<template>
  <div class="page-card">
    <div class="toolbar">
      <h2>设备管理</h2>
    </div>
    <el-table :data="devices" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="deviceNo" label="设备号" min-width="180" />
      <el-table-column prop="merchantId" label="商户标识" min-width="160" />
      <el-table-column prop="ip" label="IP" min-width="150" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '接单中' : '待机/禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatTimestamp(row.createT) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="220">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button
              v-if="row.status === 1"
              v-permission="'device:status'"
              link
              type="warning"
              @click="handleStatusChange(row, 0)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              v-permission="'device:status'"
              link
              type="success"
              @click="handleStatusChange(row, 1)"
            >
              启用
            </el-button>
            <el-popconfirm
              title="确认删除该设备记录？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button v-permission="'device:delete'" link type="danger">删除</el-button>
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
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { deleteDeviceApi, getDevicesApi, updateDeviceStatusApi } from '@/api/system'

const devices = ref([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10 })

async function fetchData() {
  const res = await getDevicesApi(query)
  devices.value = res.data.list
  total.value = res.data.total
}

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return '-'
  }
  return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN', { hour12: false })
}

async function handleStatusChange(row, status) {
  await updateDeviceStatusApi(row.id, status)
  ElMessage.success(status === 1 ? '设备已启用' : '设备已禁用')
  fetchData()
}

async function handleDelete(row) {
  await deleteDeviceApi(row.id)
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
