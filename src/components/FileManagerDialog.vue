<template>
  <el-dialog
    v-model="visible"
    title="文件管理器"
    width="900px"
    @open="loadContents"
    center
  >
    <div class="file-manager">
      <div class="toolbar">
        <el-button type="primary" @click="handleCreateFolder">
          <el-icon><FolderAdd /></el-icon>
          新建文件夹
        </el-button>
        <el-button @click="loadContents">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <p>加载中...</p>
      </div>
      
      <el-table v-else :data="contents" style="width: 100%" :height="450" stripe>
        <el-table-column label="类型" width="70" align="center">
          <template #default="{ row }">
            <el-icon :size="24" :color="row.isDirectory ? '#3b82f6' : '#94a3b8'">
              <component :is="row.isDirectory ? Folder : Document" />
            </el-icon>
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="名称" min-width="250">
          <template #default="{ row }">
            <span style="font-weight: 500">{{ row.name }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="大小" width="120" align="right">
          <template #default="{ row }">
            <span v-if="!row.isDirectory" style="color: var(--color-text-secondary)">
              {{ formatSize(row.size) }}
            </span>
            <span v-else style="color: var(--color-text-tertiary)">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="修改时间" width="160">
          <template #default="{ row }">
            <span style="color: var(--color-text-secondary)">{{ formatDate(row.modified) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.isDirectory"
              type="primary" 
              size="small"
              link
              @click="handleOpenItem(row)"
            >
              <el-icon><FolderOpened /></el-icon>
              打开
            </el-button>
            <el-button type="warning" size="small" link @click="handleRename(row)">
              <el-icon><Edit /></el-icon>
              重命名
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  FolderAdd, Refresh, Loading, Folder, Document, 
  FolderOpened, Edit, Delete 
} from '@element-plus/icons-vue'

interface Props {
  modelValue: boolean
  projectPath: string
}

interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modified: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const contents = ref<FileItem[]>([])

const loadContents = async () => {
  if (!props.projectPath) return
  
  loading.value = true
  try {
    const data = await window.electronAPI.getFolderContents(props.projectPath)
    contents.value = data
  } catch (error) {
    ElMessage.error('加载文件列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreateFolder = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /^[^\\/:*?"<>|]+$/,
      inputErrorMessage: '文件夹名称不能包含特殊字符',
      center: true
    })
    
    if (value) {
      const result = await window.electronAPI.createFolder(props.projectPath, value)
      if (result.success) {
        ElMessage.success('文件夹创建成功')
        await loadContents()
      } else {
        ElMessage.error(result.error || '创建失败')
      }
    }
  } catch (error) {
    // 用户取消
  }
}

const handleOpenItem = async (item: FileItem) => {
  await window.electronAPI.openFolder(item.path)
}

const handleRename = async (item: FileItem) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新名称', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.name,
      inputPattern: /^[^\\/:*?"<>|]+$/,
      inputErrorMessage: '名称不能包含特殊字符',
      center: true
    })
    
    if (value && value !== item.name) {
      const result = await window.electronAPI.renameItem(item.path, value)
      if (result.success) {
        ElMessage.success('重命名成功')
        await loadContents()
      } else {
        ElMessage.error(result.error || '重命名失败')
      }
    }
  } catch (error) {
    // 用户取消
  }
}

const handleDelete = async (item: FileItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${item.name}" 吗？\n\n警告：此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        center: true
      }
    )
    
    const result = await window.electronAPI.deleteItem(item.path)
    if (result.success) {
      ElMessage.success('删除成功')
      await loadContents()
    } else {
      ElMessage.error(result.error || '删除失败')
    }
  } catch (error) {
    // 用户取消
  }
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.file-manager {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar {
  display: flex;
  gap: 12px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 450px;
  color: var(--color-text-secondary);
  gap: 12px;
}
</style>
