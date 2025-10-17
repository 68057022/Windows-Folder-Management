<template>
  <el-dialog
    v-model="visible"
    title="选择项目管理文件夹"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="hasWorkspace"
  >
    <div class="workspace-content">
      <div class="workspace-icon">
        <el-icon :size="80"><FolderOpened /></el-icon>
      </div>
      
      <h3 class="workspace-title">设置项目管理工作区</h3>
      <p class="workspace-desc">
        选择一个文件夹作为您的项目管理工作区<br>
        所有项目都将在此文件夹中管理
      </p>
      
      <div v-if="currentWorkspace" class="current-workspace">
        <el-icon><Folder /></el-icon>
        <span>{{ currentWorkspace }}</span>
      </div>
      
      <div class="workspace-actions">
        <el-button type="primary" size="large" @click="handleSelectWorkspace" :loading="selecting">
          <el-icon><FolderOpened /></el-icon>
          {{ currentWorkspace ? '更换工作区' : '选择文件夹' }}
        </el-button>
        <el-button v-if="hasWorkspace" size="large" @click="handleConfirm">
          确定
        </el-button>
      </div>
      
      <div class="workspace-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>建议：在桌面或文档中创建一个专门的文件夹用于管理项目</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { FolderOpened, Folder, InfoFilled } from '@element-plus/icons-vue'

interface Props {
  modelValue: boolean
  initialWorkspace?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => {
    // 如果有工作区才允许关闭
    if (hasWorkspace.value) {
      emit('update:modelValue', val)
    }
  }
})

const currentWorkspace = ref(props.initialWorkspace || '')
const selecting = ref(false)

const hasWorkspace = computed(() => !!currentWorkspace.value)

const handleSelectWorkspace = async () => {
  selecting.value = true
  try {
    const folder = await window.electronAPI.selectFolder()
    if (folder) {
      currentWorkspace.value = folder.path
      ElMessage.success('工作区已设置')
    }
  } catch (error) {
    ElMessage.error('选择文件夹失败')
  } finally {
    selecting.value = false
  }
}

const handleConfirm = () => {
  if (currentWorkspace.value) {
    emit('confirm', currentWorkspace.value)
    visible.value = false
  } else {
    ElMessage.warning('请先选择工作区文件夹')
  }
}
</script>

<style scoped>
.workspace-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
}

.workspace-icon {
  color: var(--color-primary);
  margin-bottom: 20px;
}

.workspace-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px 0;
}

.workspace-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.current-workspace {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--color-bg-tertiary);
  border-radius: 8px;
  margin-bottom: 24px;
  max-width: 100%;
  word-break: break-all;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.workspace-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.workspace-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #eff6ff;
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-primary);
  border: 1px solid #dbeafe;
}
</style>

