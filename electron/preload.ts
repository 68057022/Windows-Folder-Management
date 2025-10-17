import { contextBridge, ipcRenderer } from 'electron'

// 暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 安装和配置
  checkInstalled: () => ipcRenderer.invoke('check-installed'),
  selectInstallDirectory: () => ipcRenderer.invoke('select-install-directory'),
  getQuickPath: (type: string) => ipcRenderer.invoke('get-quick-path', type),
  initializeDataDirectory: (path: string) => ipcRenderer.invoke('initialize-data-directory', path),
  getDataDirectory: () => ipcRenderer.invoke('get-data-directory'),
  updateDataDirectory: (path: string) => ipcRenderer.invoke('update-data-directory', path),
  getWorkspacePath: () => ipcRenderer.invoke('get-workspace-path'),
  setWorkspacePath: (path: string) => ipcRenderer.invoke('set-workspace-path', path),
  
  // 项目管理
  getProjects: () => ipcRenderer.invoke('get-projects'),
  saveProjects: (projects: any[]) => ipcRenderer.invoke('save-projects', projects),
  
  // 文件夹操作
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFolders: () => ipcRenderer.invoke('select-folders'),
  createProjectFolder: (parentPath: string, folderName: string) => ipcRenderer.invoke('create-project-folder', parentPath, folderName),
  moveFolder: (sourcePath: string, targetParentPath: string) => ipcRenderer.invoke('move-folder', sourcePath, targetParentPath),
  isFolderInside: (folderPath: string, parentPath: string) => ipcRenderer.invoke('is-folder-inside', folderPath, parentPath),
  openFolder: (path: string) => ipcRenderer.invoke('open-folder', path),
  getFolderContents: (path: string) => ipcRenderer.invoke('get-folder-contents', path),
  
  // 文件系统操作
  renameItem: (oldPath: string, newName: string) => ipcRenderer.invoke('rename-item', oldPath, newName),
  deleteItem: (path: string) => ipcRenderer.invoke('delete-item', path),
  createFolder: (parentPath: string, folderName: string) => ipcRenderer.invoke('create-folder', parentPath, folderName),
  
  // 应用配置
  getAppFolder: () => ipcRenderer.invoke('get-app-folder'),
  checkPathExists: (path: string) => ipcRenderer.invoke('check-path-exists', path),
  
  // 附件管理
  saveAttachment: (projectId: string, filePath: string) => ipcRenderer.invoke('save-attachment', projectId, filePath),
  saveClipboardImage: (projectId: string, imageBuffer: ArrayBuffer) => ipcRenderer.invoke('save-clipboard-image', projectId, Buffer.from(imageBuffer)),
  selectFile: () => ipcRenderer.invoke('select-file'),
  openAttachment: (filePath: string) => ipcRenderer.invoke('open-attachment', filePath),
  deleteAttachment: (filePath: string) => ipcRenderer.invoke('delete-attachment', filePath)
})

// 类型声明
export interface ElectronAPI {
  getProjects: () => Promise<any[]>
  saveProjects: (projects: any[]) => Promise<boolean>
  selectFolder: () => Promise<{ path: string; name: string; created: number; modified: number } | null>
  openFolder: (path: string) => Promise<boolean>
  getFolderContents: (path: string) => Promise<any[]>
  renameItem: (oldPath: string, newName: string) => Promise<{ success: boolean; newPath?: string; error?: string }>
  deleteItem: (path: string) => Promise<{ success: boolean; error?: string }>
  createFolder: (parentPath: string, folderName: string) => Promise<{ success: boolean; path?: string; error?: string }>
  getAppFolder: () => Promise<string>
  checkPathExists: (path: string) => Promise<boolean>
}

