import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Project {
  id: string
  path: string
  name: string
  created: number
  modified: number
  client: string
  phase: '待做' | '已交付' | '需修改'
  priority: '高' | '中' | '低'
  deadline: string
  description: string
  isHistorical: boolean  // 是否为历史项目（做过的项目）
  attachments: Array<{
    name: string
    path: string
    type: 'image' | 'file'
    size: number
  }>
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const phaseFilter = ref<string>('全部')
  const priorityFilter = ref<string>('全部')
  const sortBy = ref<string>('修改时间')
  const workspacePath = ref<string>('')

  // 加载项目
  const loadProjects = async () => {
    loading.value = true
    try {
      const savedWorkspace = await window.electronAPI.getWorkspacePath()
      if (savedWorkspace) {
        workspacePath.value = savedWorkspace
      }
      
      const data = await window.electronAPI.getProjects()
      
      projects.value = data.map(p => ({
        ...p,
        id: p.id || `${p.path}_${Date.now()}`,
        attachments: p.attachments || [],
        isHistorical: p.isHistorical || false,
        phase: p.phase || '待做',
        priority: p.priority || '中',
        deadline: p.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: p.description || '',
        client: p.client || ''
      }))
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      loading.value = false
    }
  }
  
  const setWorkspace = async (path: string) => {
    if (path) {
      const success = await window.electronAPI.setWorkspacePath(path)
      if (success) {
        workspacePath.value = path
      }
    } else {
      workspacePath.value = ''
    }
  }

  // 保存项目
  const saveProjects = async () => {
    try {
      // 清理项目数据，移除可能无法克隆的属性
      const cleanProjects = projects.value.map(p => ({
        id: p.id,
        path: p.path,
        name: p.name,
        created: p.created,
        modified: p.modified,
        client: p.client,
        phase: p.phase,
        priority: p.priority,
        deadline: p.deadline,
        description: p.description,
        isHistorical: p.isHistorical,
        attachments: p.attachments.map(a => ({
          name: a.name,
          path: a.path,
          type: a.type,
          size: a.size
        }))
      }))
      
      return await window.electronAPI.saveProjects(cleanProjects)
    } catch (error) {
      console.error('Failed to save projects:', error)
      return false
    }
  }

  // 添加项目
  const addProject = async () => {
    const folderInfo = await window.electronAPI.selectFolder()
    if (!folderInfo) return null

    const newProject: Project = {
      id: `${folderInfo.path}_${Date.now()}`,
      path: folderInfo.path,
      name: folderInfo.name || '',
      created: folderInfo.created,
      modified: folderInfo.modified,
      client: '',
      phase: '待做',
      priority: '中',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      isHistorical: false,
      attachments: []
    }

    projects.value.push(newProject)
    await saveProjects()
    return newProject
  }

  // 更新项目
  const updateProject = async (id: string, data: Partial<Project>) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...data }
      await saveProjects()
    }
  }

  // 删除项目
  const deleteProject = async (id: string) => {
    projects.value = projects.value.filter(p => p.id !== id)
    await saveProjects()
  }

  // 筛选后的项目
  const filteredProjects = computed(() => {
    let result = projects.value

    // 搜索
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.client.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    }

    // 阶段筛选
    if (phaseFilter.value !== '全部') {
      result = result.filter(p => p.phase === phaseFilter.value)
    }

    // 优先级筛选
    if (priorityFilter.value !== '全部') {
      result = result.filter(p => p.priority === priorityFilter.value)
    }

    // 排序
    result = [...result].sort((a, b) => {
      switch (sortBy.value) {
        case '创建时间':
          return b.created - a.created
        case '修改时间':
          return b.modified - a.modified
        case '截止日期':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        default:
          return 0
      }
    })

    return result
  })

  // 统计数据
  const statistics = computed(() => {
    const total = projects.value.length
    const todo = projects.value.filter(p => p.phase === '待做').length
    const delivered = projects.value.filter(p => p.phase === '已交付').length
    const toModify = projects.value.filter(p => p.phase === '需修改').length
    
    // 紧急项目（3天内到期）
    const now = Date.now()
    const urgent = projects.value.filter(p => {
      const deadline = new Date(p.deadline).getTime()
      const daysLeft = (deadline - now) / (1000 * 60 * 60 * 24)
      return daysLeft >= 0 && daysLeft <= 3
    }).length

    return { total, todo, delivered, toModify, urgent }
  })

  // 批量添加项目（历史项目）
  const batchAddProjects = async (folders: Array<{ path: string; name: string; created: number; modified: number }>, workspace: string) => {
    const newProjects: Project[] = []
    
    for (const folder of folders) {
      try {
        // 检查是否已在工作区内
        const isInside = await window.electronAPI.isFolderInside(folder.path, workspace)
        
        let finalPath = folder.path
        let finalName = folder.name
        
        if (!isInside) {
          // 移动到工作区
          const result = await window.electronAPI.moveFolder(folder.path, workspace)
          if (result.success && result.path && result.name) {
            finalPath = result.path
            finalName = result.name
          }
        }
        
        // 创建一个简单的、可序列化的项目对象
        const project: Project = {
          id: `${finalPath}_${Date.now()}_${Math.random()}`,
          path: String(finalPath),
          name: String(finalName),
          created: Number(folder.created),
          modified: Number(folder.modified),
          client: '',
          phase: '已交付',
          priority: '中',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: '',
          isHistorical: true,
          attachments: []
        }
        
        newProjects.push(project)
      } catch (error) {
        console.error('Failed to move folder:', error)
      }
    }
    
    newProjects.forEach(p => projects.value.push(p))
    
    try {
      await saveProjects()
    } catch (error) {
      console.error('Failed to save batch projects:', error)
    }
    
    return newProjects
  }

  // 批量更新项目状态
  const batchUpdatePhase = async (projectIds: string[], phase: '待做' | '已交付' | '需修改') => {
    try {
      projectIds.forEach(id => {
        const project = projects.value.find(p => p.id === id)
        if (project) {
          project.phase = phase
        }
      })
      await saveProjects()
      return true
    } catch (error) {
      console.error('Failed to batch update:', error)
      return false
    }
  }

  return {
    projects,
    loading,
    searchQuery,
    phaseFilter,
    priorityFilter,
    sortBy,
    workspacePath,
    filteredProjects,
    statistics,
    loadProjects,
    saveProjects,
    addProject,
    updateProject,
    deleteProject,
    batchAddProjects,
    setWorkspace,
    batchUpdatePhase
  }
})

