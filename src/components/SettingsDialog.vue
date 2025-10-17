<template>
  <el-dialog
    v-model="visible"
    title="设置"
    width="600px"
    @close="handleClose"
  >
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 常规设置 -->
      <el-tab-pane label="常规" name="general">
        <div class="settings-section">
          <h3>工作区</h3>
          <el-form label-width="120px">
            <el-form-item label="当前工作区">
              <el-input v-model="workspace" readonly>
                <template #append>
                  <el-button @click="$emit('change-workspace')">更改</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="settings-section">
          <h3>显示设置</h3>
          <el-form label-width="120px">
            <el-form-item label="项目排序">
              <el-radio-group v-model="localSortBy" @change="handleSortChange">
                <el-radio label="修改时间">修改时间</el-radio>
                <el-radio label="创建时间">创建时间</el-radio>
                <el-radio label="截止日期">截止日期</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      
      <!-- 数据管理 -->
      <el-tab-pane label="数据管理" name="data">
        <div class="settings-section">
          <h3>项目数据</h3>
          <div class="data-actions">
            <el-button type="primary" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出项目数据
            </el-button>
            <el-button type="warning" @click="handleImport">
              <el-icon><Upload /></el-icon>
              导入项目数据
            </el-button>
            <el-button type="danger" @click="handleClearAll">
              <el-icon><Delete /></el-icon>
              清空所有数据
            </el-button>
          </div>
          
          <div class="data-info">
            <p>当前项目数量：<strong>{{ projectCount }}</strong></p>
            <p>工作区路径：<strong>{{ workspace || '未设置' }}</strong></p>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 关于 -->
      <el-tab-pane label="关于" name="about">
        <div class="settings-section about-section">
          <div class="app-info">
            <el-icon class="app-icon" :size="64"><Briefcase /></el-icon>
            <h2>企业项目管理系统</h2>
            <p class="version">版本 1.0.0</p>
            <p class="description">一款专为个人订单开发者打造的项目管理工具</p>
          </div>
          
          <div class="features">
            <h3>核心功能</h3>
            <ul>
              <li>项目文件夹管理</li>
              <li>项目状态追踪</li>
              <li>附件管理</li>
              <li>客户备注</li>
              <li>截止日期提醒</li>
              <li>批量导入历史项目</li>
            </ul>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, Delete, Briefcase } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/project'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change-workspace'])

const projectStore = useProjectStore()
const activeTab = ref('general')
const localSortBy = ref(projectStore.sortBy)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const workspace = computed(() => projectStore.workspacePath)
const projectCount = computed(() => projectStore.projects.length)

const handleSortChange = (value: string) => {
  projectStore.sortBy = value
  ElMessage.success('排序方式已更新')
}

const handleExport = async () => {
  try {
    const dataStr = JSON.stringify(projectStore.projects, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有项目数据吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    projectStore.projects = []
    await projectStore.saveProjects()
    ElMessage.success('数据已清空')
  } catch {
    // 用户取消
  }
}

const handleClose = () => {
  visible.value = false
}

watch(() => projectStore.sortBy, (newVal) => {
  localSortBy.value = newVal
})
</script>

<style scoped>
.settings-tabs {
  min-height: 400px;
}

.settings-section {
  margin-bottom: 30px;
}

.settings-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-border);
}

.data-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.data-info {
  background: var(--color-bg-tertiary);
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.data-info p {
  margin: 8px 0;
  color: var(--color-text-secondary);
}

.data-info strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.about-section {
  text-align: center;
}

.app-info {
  padding: 30px 0;
}

.app-icon {
  color: #667eea;
  margin-bottom: 20px;
}

.app-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 10px 0;
}

.version {
  color: var(--color-text-tertiary);
  font-size: 14px;
  margin: 10px 0;
}

.description {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 20px 0;
}

.features {
  text-align: left;
  max-width: 400px;
  margin: 30px auto;
  padding: 20px;
  background: var(--color-bg-tertiary);
  border-radius: 12px;
}

.features h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 15px;
}

.features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features li {
  padding: 8px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>

