<template>
  <header class="top-bar">
    <div class="left-section">
      <h1 class="title">项目管理系统</h1>
      <span class="workspace-path" v-if="workspace">
        <el-icon><Folder /></el-icon>
        {{ workspaceDisplay }}
      </span>
    </div>
    
    <div class="right-section">
      <div class="time-display">
        <el-icon><Clock /></el-icon>
        <span>{{ currentTime }}</span>
      </div>
      <div class="user-avatar">
        <el-icon :size="20"><User /></el-icon>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Clock, User, Folder } from '@element-plus/icons-vue'

interface Props {
  workspace?: string
}

const props = defineProps<Props>()

const currentTime = ref('')
let timer: number

const workspaceDisplay = computed(() => {
  if (!props.workspace) return ''
  const parts = props.workspace.split('\\')
  return parts[parts.length - 1]
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.top-bar {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.workspace-path {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--color-bg-tertiary);
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.workspace-path .el-icon {
  font-size: 14px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-bg-tertiary);
  border-radius: 20px;
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.time-display .el-icon {
  font-size: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style>

