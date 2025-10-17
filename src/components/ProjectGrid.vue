<template>
  <div class="project-grid-container">
    <div v-if="projectStore.loading" class="loading-state">
      <el-icon class="is-loading" :size="50"><Loading /></el-icon>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="projectStore.filteredProjects.length === 0" class="empty-state">
      <el-icon :size="80" class="empty-icon"><FolderOpened /></el-icon>
      <h3>暂无项目</h3>
      <p>点击右上角 "新建项目" 开始管理您的项目</p>
    </div>
    
    <div v-else class="project-grid">
      <ProjectCard 
        v-for="project in projectStore.filteredProjects" 
        :key="project.id"
        :project="project"
        :selection-mode="selectionMode"
        :selected="selectedIds.includes(project.id)"
        @edit="handleEdit"
        @delete="handleDelete"
        @open="handleOpen"
        @manage-files="handleManageFiles"
        @toggle-select="$emit('toggle-select', project.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { Loading, FolderOpened } from '@element-plus/icons-vue'
import { useProjectStore } from '../stores/project'
import ProjectCard from './ProjectCard.vue'
import type { Project } from '../stores/project'

interface Props {
  selectionMode: boolean
  selectedIds: string[]
}

defineProps<Props>()

const projectStore = useProjectStore()
const emit = defineEmits(['edit', 'manage-files', 'toggle-select'])

const handleEdit = (project: Project) => {
  emit('edit', project)
}

const handleDelete = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.name}" 吗？注意：这只会从列表中移除，不会删除实际文件夹。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )
    
    await projectStore.deleteProject(project.id)
    ElMessage.success('项目已删除')
  } catch (error) {
    // 用户取消
  }
}

const handleOpen = async (project: Project) => {
  const exists = await window.electronAPI.checkPathExists(project.path)
  if (!exists) {
    ElMessage.error('文件夹不存在，可能已被移动或删除')
    return
  }
  
  await window.electronAPI.openFolder(project.path)
}

const handleManageFiles = (project: Project) => {
  emit('manage-files', project)
}
</script>

<style scoped>
.project-grid-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  gap: 16px;
}

.empty-icon {
  color: var(--color-text-tertiary);
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin: 0;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
  padding-bottom: 24px;
}

@media (max-width: 1400px) {
  .project-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
</style>
