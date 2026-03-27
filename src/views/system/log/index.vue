<template>
  <div class="page-card">
    <h2>操作日志</h2>
    <el-table :data="logs" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="操作人" />
      <el-table-column prop="method" label="方法" width="100" />
      <el-table-column prop="path" label="路径" />
      <el-table-column prop="statusCode" label="状态码" width="100" />
      <el-table-column prop="latencyMs" label="耗时(ms)" width="100" />
      <el-table-column prop="createdAt" label="时间" width="180" />
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
import { getLogsApi } from '@/api/system'

const logs = ref([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10 })

async function fetchData() {
  const res = await getLogsApi(query)
  logs.value = res.data.list
  total.value = res.data.total
}

onMounted(fetchData)
</script>

<style scoped>
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
