<template>
  <el-dialog
    v-model="visible"
    title="批量导入项目"
    width="700px"
    @close="handleClose"
  >
    <div class="import-content">
      <el-alert
        title="批量导入说明"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <p><strong>⚠️ 重要提示</strong></p>
          <p>• 选中的文件夹将被<strong>移动到工作区</strong></p>
          <p>• 适合管理过去做过的项目</p>
          <p>• 导入的项目会显示为<strong>灰色（历史项目）</strong></p>
          <p>• 可以稍后再编辑项目详情</p>
        </template>
      </el-alert>
      
      <div class="import-actions">
        <el-button type="primary" size="large" @click="handleSelectFolders" :loading="selecting">
          <el-icon><FolderAdd /></el-icon>
          选择文件夹（可多选）
        </el-button>
      </div>
      
      <div v-if="selectedFolders.length > 0" class="selected-folders">
        <div class="folders-header">
          <span>已选择 {{ selectedFolders.length }} 个项目</span>
          <el-button text type="danger" @click="selectedFolders = []">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
        
        <div class="folders-list">
          <div v-for="(folder, index) in selectedFolders" :key="folder.path" class="folder-item">
            <div class="folder-info">
              <el-icon class="folder-icon"><Folder /></el-icon>
              <div class="folder-details">
                <div class="folder-name">{{ folder.name }}</div>
                <div class="folder-path">{{ folder.path }}</div>
              </div>
            </div>
            <el-button 
              type="danger" 
              :icon="Delete" 
              circle 
              size="small"
              @click="selectedFolders.splice(index, 1)"
            />
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <el-icon :size="60"><FolderOpened /></el-icon>
        <p>还未选择任何项目</p>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleClose" size="large">取消</el-button>
      <el-button 
        type="primary" 
        size="large" 
        @click="handleImport"
        :disabled="selectedFolders.length === 0"
        :loading="importing"
      >
        <el-icon><Check /></el-icon>
        导入 {{ selectedFolders.length }} 个项目
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { FolderAdd, Folder, FolderOpened, Delete, Check } from '@element-plus/icons-vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'import'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedFolders = ref<Array<{ path: string; name: string; created: number; modified: number }>>([])
const selecting = ref(false)
const importing = ref(false)

const handleSelectFolders = async () => {
  selecting.value = true
  try {
    const folders = await window.electronAPI.selectFolders()
    if (folders && folders.length > 0) {
      // 去重
      const existingPaths = new Set(selectedFolders.value.map(f => f.path))
      const newFolders = folders.filter(f => !existingPaths.has(f.path))
      
      selectedFolders.value.push(...newFolders)
      ElMessage.success(`已选择 ${newFolders.length} 个文件夹`)
    }
  } catch (error) {
    ElMessage.error('选择文件夹失败')
  } finally {
    selecting.value = false
  }
}

const handleImport = async () => {
  if (selectedFolders.value.length === 0) {
    ElMessage.warning('请先选择要导入的项目')
    return
  }
  
  importing.value = true
  try {
    emit('import', selectedFolders.value)
    selectedFolders.value = []
    visible.value = false
  } catch (error) {
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}

const handleClose = () => {
  selectedFolders.value = []
  visible.value = false
}
</script>

<style scoped>
.import-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.import-actions {
  display: flex;
  justify-content: center;
}

.selected-folders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.folders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg-tertiary);
  border-radius: 8px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.folders-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.folder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.folder-item:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-primary);
}

.folder-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.folder-icon {
  font-size: 24px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.folder-details {
  flex: 1;
  min-width: 0;
}

.folder-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.folder-path {
  font-size: 12px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-text-tertiary);
}

.empty-state p {
  margin: 16px 0 0 0;
  font-size: 14px;
}
</style>

