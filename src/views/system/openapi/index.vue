<template>
  <div class="page-card">
    <div class="toolbar">
      <h2>Open API 签名工具</h2>
      <el-button type="primary" @click="handleGenerate">生成请求头</el-button>
    </div>
    <el-form :model="form" label-width="110px" class="tool-form">
      <el-form-item label="请求方式">
        <el-select v-model="form.method" style="width: 180px">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="PATCH" value="PATCH" />
          <el-option label="DELETE" value="DELETE" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求路径">
        <el-input v-model="form.path" placeholder="/api/v1/open/devices" />
      </el-form-item>
      <el-form-item label="请求体">
        <el-input
          v-model="form.body"
          type="textarea"
          :rows="10"
          placeholder='{"deviceNo":"DEV001","merchantId":"M1001"}'
        />
      </el-form-item>
    </el-form>

    <div class="result-card">
      <div class="result-card__head">
        <h3>请求头结果</h3>
        <el-button plain @click="copyAll">复制全部</el-button>
      </div>
      <el-table :data="headerRows" border>
        <el-table-column prop="key" label="Header" width="180" />
        <el-table-column prop="value" label="Value" min-width="420" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="copyText(`${row.key}: ${row.value}`)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="helper-text">
        Swagger UI 里把上面的值分别填入对应请求头即可。
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generateOpenAPIHeadersApi } from '@/api/system'

const form = reactive({
  method: 'POST',
  path: '/api/v1/open/devices',
  body: '{\n  "deviceNo": "DEV001",\n  "merchantId": "M1001"\n}'
})

const generatedHeaders = ref({})

const headerRows = computed(() =>
  Object.entries(generatedHeaders.value).map(([key, value]) => ({ key, value }))
)

async function handleGenerate() {
  const res = await generateOpenAPIHeadersApi(form)
  generatedHeaders.value = res.data.headers || {}
  ElMessage.success('请求头已生成')
}

async function copyText(text) {
  await navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

async function copyAll() {
  const content = headerRows.value.map((item) => `${item.key}: ${item.value}`).join('\n')
  if (!content) {
    ElMessage.warning('请先生成请求头')
    return
  }
  await copyText(content)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.tool-form {
  margin-bottom: 24px;
}

.result-card {
  padding: 18px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 18px;
  background: #fafaf8;
}

.result-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.result-card__head h3 {
  margin: 0;
}

.helper-text {
  margin-top: 12px;
  color: #64748b;
}
</style>
