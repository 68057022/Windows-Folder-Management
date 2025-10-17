<template>
  <div class="project-list-view">
    <div class="view-header">
      <div class="header-left">
        <h1>项目列表</h1>
        <el-badge :value="projectStore.projects.length" type="primary" />
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="$emit('add-project')">
          新建项目
        </el-button>
      </div>
    </div>
    
    <div class="filter-section">
      <el-radio-group v-model="activePhase" size="large">
        <el-radio-button label="all">全部 ({{ projectStore.projects.length }})</el-radio-button>
        <el-radio-button label="待做">待做 ({{ getPhaseCount('待做') }})</el-radio-button>
        <el-radio-button label="已交付">已交付 ({{ getPhaseCount('已交付') }})</el-radio-button>
        <el-radio-button label="需修改">需修改 ({{ getPhaseCount('需修改') }})</el-radio-button>
      </el-radio-group>
      
      <el-input 
        v-model="searchQuery"
        placeholder="搜索项目名称、客户..."
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
    </div>
    
    <div class="table-container">
      <el-table 
        :data="filteredProjects" 
        stripe
        style="width: 100%"
        :height="tableHeight"
        @row-click="handleRowClick"
      >
        <el-table-column type="index" width="60" label="#" />
        
        <el-table-column prop="name" label="项目名称" min-width="200">
          <template #default="{ row }">
            <div class="project-name-cell">
              <el-icon class="project-icon" :style="{ color: getPhaseColor(row.phase) }">
                <Folder />
              </el-icon>
              <span>{{ row.name }}</span>
              <el-tag v-if="row.isHistorical" type="info" size="small">历史</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="client" label="客户" width="150">
          <template #default="{ row }">
            <span class="client-text">{{ row.client || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="phase" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getPhaseTagType(row.phase)">{{ row.phase }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)" effect="plain">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="deadline" label="截止日期" width="130">
          <template #default="{ row }">
            <div class="deadline-cell">
              <el-icon><Calendar /></el-icon>
              <span>{{ row.deadline }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="modified" label="最后修改" width="170">
          <template #default="{ row }">
            {{ formatDate(row.modified) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" :icon="FolderOpened" @click.stop="openProject(row)">
                打开
              </el-button>
              <el-button size="small" :icon="Files" @click.stop="manageFiles(row)">
                文件
              </el-button>
              <el-button size="small" :icon="Edit" @click.stop="editProject(row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" :icon="Delete" @click.stop="deleteProject(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Search, Folder, FolderOpened, Files, Edit, Delete, Calendar 
} from '@element-plus/icons-vue'
import { useProjectStore, type Project } from '@/stores/project'

const emit = defineEmits(['add-project', 'edit', 'manage-files'])

const projectStore = useProjectStore()
const activePhase = ref('all')
const searchQuery = ref('')
const tableHeight = ref(600)

const filteredProjects = computed(() => {
  let result = projectStore.projects
  
  // 状态筛选
  if (activePhase.value !== 'all') {
    result = result.filter(p => p.phase === activePhase.value)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.client.toLowerCase().includes(query)
    )
  }
  
  return result
})

const getPhaseCount = (phase: string) => {
  return projectStore.projects.filter(p => p.phase === phase).length
}

const getPhaseColor = (phase: string) => {
  const colors: Record<string, string> = {
    '待做': '#3b82f6',
    '已交付': '#10b981',
    '需修改': '#f59e0b'
  }
  return colors[phase] || '#6b7280'
}

const getPhaseTagType = (phase: string) => {
  const types: Record<string, any> = {
    '待做': 'primary',
    '已交付': 'success',
    '需修改': 'warning'
  }
  return types[phase] || ''
}

const getPriorityTagType = (priority: string) => {
  const types: Record<string, any> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[priority] || ''
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleRowClick = (row: Project) => {
  console.log('选中项目:', row.name)
}

const openProject = async (project: Project) => {
  await window.electronAPI.openFolder(project.path)
}

const manageFiles = (project: Project) => {
  emit('manage-files', project)
}

const editProject = (project: Project) => {
  emit('edit', project)
}

const deleteProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.name}" 吗？注意：这只会从列表中移除，不会删除实际文件夹。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await projectStore.deleteProject(project.id)
    ElMessage.success('项目已删除')
  } catch {
    // 用户取消
  }
}

const updateTableHeight = () => {
  const headerHeight = 180
  tableHeight.value = window.innerHeight - headerHeight
}

onMounted(() => {
  updateTableHeight()
  window.addEventListener('resize', updateTableHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateTableHeight)
})
</script>

<style scoped>
.project-list-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  padding: 24px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.search-input {
  max-width: 300px;
}

.table-container {
  flex: 1;
  overflow: hidden;
}

.project-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-icon {
  font-size: 18px;
}

.client-text {
  color: var(--color-text-secondary);
}

.deadline-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: var(--color-bg-tertiary);
}
</style>

