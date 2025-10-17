<template>
  <!-- 安装引导 -->
  <InstallGuide 
    v-if="!isInstalled"
    @complete="handleInstallComplete"
  />
  
  <!-- 主应用 -->
  <div v-else class="app-layout">
    <!-- 左侧边栏 -->
    <Sidebar 
      @add-project="handleAddProject"
      @change-workspace="showWorkspaceDialog = true"
      @batch-import="showBatchImport = true"
      @open-settings="showSettings = true"
      @navigate="handleNavigate"
    />
    
    <!-- 右侧内容区 -->
    <div class="main-area">
      <!-- 顶部栏 -->
      <TopBar :workspace="projectStore.workspacePath" />
      
      <!-- 内容区 -->
      <main class="content-area">
        <!-- 仪表盘视图 -->
        <Dashboard 
          v-if="currentView === 'dashboard'"
          :selected-count="selectedProjectIds.length"
          :selection-mode="selectionMode"
          :selected-ids="selectedProjectIds"
          @edit="handleEdit"
          @manage-files="handleManageFiles"
          @batch-update="handleShowBatchUpdate"
          @toggle-selection="toggleSelectionMode"
          @clear-selection="clearSelection"
          @toggle-select="toggleProjectSelection"
        />
        
        <!-- 项目列表视图 -->
        <ProjectListView
          v-else-if="currentView === 'projects'"
          @add-project="handleAddProject"
          @edit="handleEdit"
          @manage-files="handleManageFiles"
        />
      </main>
    </div>
    
    <!-- 工作区选择对话框 -->
    <WorkspaceDialog
      v-model="showWorkspaceDialog"
      :initial-workspace="projectStore.workspacePath"
      @confirm="handleWorkspaceConfirm"
    />
    
    <!-- 批量导入对话框 -->
    <BatchImportDialog
      v-model="showBatchImport"
      @import="handleBatchImport"
    />
    
    <!-- 项目编辑对话框 -->
    <ProjectDialog 
      v-model="showEditDialog" 
      :project="currentProject"
      @save="handleSaveProject"
    />
    
    <!-- 文件管理器对话框 -->
    <FileManagerDialog 
      v-model="showFileManager" 
      :project-path="currentProjectPath"
    />
    
    <!-- 设置对话框 -->
    <SettingsDialog
      v-model="showSettings"
      @change-workspace="showWorkspaceDialog = true"
    />
    
    <!-- 批量更新对话框 -->
    <BatchUpdateDialog
      v-model="showBatchUpdate"
      :selected-ids="selectedProjectIds"
      @confirm="handleBatchUpdateConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { useProjectStore } from './stores/project'
import InstallGuide from './views/InstallGuide.vue'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import Dashboard from './views/Dashboard.vue'
import ProjectListView from './views/ProjectListView.vue'
import ProjectDialog from './components/ProjectDialog.vue'
import FileManagerDialog from './components/FileManagerDialog.vue'
import WorkspaceDialog from './components/WorkspaceDialog.vue'
import BatchImportDialog from './components/BatchImportDialog.vue'
import SettingsDialog from './components/SettingsDialog.vue'
import BatchUpdateDialog from './components/BatchUpdateDialog.vue'
import type { Project } from './stores/project'

const projectStore = useProjectStore()
const isInstalled = ref(false)
const currentView = ref('dashboard')
const showEditDialog = ref(false)
const showFileManager = ref(false)
const showWorkspaceDialog = ref(false)
const showBatchImport = ref(false)
const showSettings = ref(false)
const showBatchUpdate = ref(false)
const currentProject = ref<Project | null>(null)
const currentProjectPath = ref('')
const selectedProjectIds = ref<string[]>([])
const selectionMode = ref(false)

onMounted(async () => {
  // 检查是否已安装（设置了数据目录）
  isInstalled.value = await window.electronAPI.checkInstalled()
  
  if (isInstalled.value) {
    // 已安装，加载数据
    await initializeApp()
  }
})

const initializeApp = async () => {
  await projectStore.loadProjects()
  
  setTimeout(async () => {
    if (projectStore.workspacePath) {
      const exists = await window.electronAPI.checkPathExists(projectStore.workspacePath)
      if (!exists) {
        await projectStore.setWorkspace('')
        ElMessage.warning('工作区文件夹已被移动或删除，请重新选择')
        showWorkspaceDialog.value = true
      }
    } else {
      showWorkspaceDialog.value = true
    }
  }, 100)
}

const handleInstallComplete = async (dataDirectory: string) => {
  ElMessage.success('安装完成！')
  isInstalled.value = true
  
  await projectStore.setWorkspace(dataDirectory)
  await projectStore.loadProjects()
}

const handleWorkspaceConfirm = async (path: string) => {
  await projectStore.setWorkspace(path)
  ElMessage.success('工作区已设置')
}

const handleAddProject = async () => {
  // 检查是否有工作区
  if (!projectStore.workspacePath) {
    ElMessage.warning('请先设置工作区')
    showWorkspaceDialog.value = true
    return
  }
  
  try {
    // 直接在工作区创建新文件夹
    const { value } = await ElMessageBox.prompt('请输入项目名称', '新建项目', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /^[^\\/:*?"<>|]+$/,
      inputErrorMessage: '项目名称不能包含特殊字符'
    })
    
    if (value) {
      const result = await window.electronAPI.createProjectFolder(projectStore.workspacePath, value)
      if (result.success && result.path && result.name && result.created && result.modified) {
        const project: Project = {
          id: `${result.path}_${Date.now()}`,
          path: result.path,
          name: result.name,
          created: result.created,
          modified: result.modified,
          client: '',
          phase: '待做',
          priority: '中',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: '',
          isHistorical: false,
          attachments: []
        }
        
        projectStore.projects.push(project)
        const saved = await projectStore.saveProjects()
        
        if (saved) {
          console.log('新项目已创建并保存:', project.name)
          // 打开编辑对话框
          currentProject.value = project
          showEditDialog.value = true
          ElMessage.success('项目创建成功')
        } else {
          ElMessage.error('项目保存失败')
        }
      } else {
        ElMessage.error(result.error || '创建失败')
      }
    }
  } catch (error) {
    // 用户取消
  }
}

const handleBatchImport = async (folders: Array<{ path: string; name: string; created: number; modified: number }>) => {
  if (!projectStore.workspacePath) {
    ElMessage.warning('请先设置工作区')
    return
  }
  
  try {
    const loading = ElLoading.service({ text: '正在导入项目...', background: 'rgba(0, 0, 0, 0.7)' })
    
    const newProjects = await projectStore.batchAddProjects(folders, projectStore.workspacePath)
    
    loading.close()
    
    if (newProjects.length > 0) {
      ElMessage.success(`成功导入 ${newProjects.length} 个项目`)
    } else {
      ElMessage.warning('没有导入任何项目')
    }
    } catch (error) {
      console.error('Failed to batch import:', error)
    ElMessage.error('导入失败')
  }
}

const handleEdit = (project: Project) => {
  currentProject.value = project
  showEditDialog.value = true
}

const handleSaveProject = async (data: Partial<Project>) => {
  try {
    if (currentProject.value) {
      await projectStore.updateProject(currentProject.value.id, data)
      ElMessage.success('项目保存成功')
    }
    showEditDialog.value = false
    currentProject.value = null
  } catch (error) {
    ElMessage.error('保存项目失败')
  }
}

const handleManageFiles = (project: Project) => {
  currentProjectPath.value = project.path
  showFileManager.value = true
}

const handleNavigate = (view: string) => {
  currentView.value = view
  // 切换视图时清除选择
  if (selectionMode.value) {
    selectionMode.value = false
    selectedProjectIds.value = []
  }
}

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedProjectIds.value = []
  }
}

const clearSelection = () => {
  selectedProjectIds.value = []
}

const toggleProjectSelection = (id: string) => {
  const index = selectedProjectIds.value.indexOf(id)
  if (index > -1) {
    selectedProjectIds.value.splice(index, 1)
  } else {
    selectedProjectIds.value.push(id)
  }
}

const handleShowBatchUpdate = () => {
  if (selectedProjectIds.value.length === 0) {
    ElMessage.warning('请先选择要更新的项目')
    return
  }
  showBatchUpdate.value = true
}

const handleBatchUpdateConfirm = async (newPhase: '待做' | '已交付' | '需修改') => {
  const success = await projectStore.batchUpdatePhase(selectedProjectIds.value, newPhase)
  if (success) {
    ElMessage.success(`已将 ${selectedProjectIds.value.length} 个项目更新为 ${newPhase}`)
    selectedProjectIds.value = []
    selectionMode.value = false
  } else {
    ElMessage.error('批量更新失败')
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow: hidden;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
