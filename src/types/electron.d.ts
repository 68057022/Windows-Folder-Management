export interface ElectronAPI {
  // 安装和配置
  checkInstalled: () => Promise<boolean>
  selectInstallDirectory: () => Promise<string | null>
  getQuickPath: (type: string) => Promise<string>
  initializeDataDirectory: (path: string) => Promise<boolean>
  getDataDirectory: () => Promise<string | null>
  updateDataDirectory: (path: string) => Promise<boolean>
  getWorkspacePath: () => Promise<string | null>
  setWorkspacePath: (path: string) => Promise<boolean>
  
  // 项目管理
  getProjects: () => Promise<any[]>
  saveProjects: (projects: any[]) => Promise<boolean>
  selectFolder: () => Promise<{ path: string; name: string; created: number; modified: number } | null>
  selectFolders: () => Promise<Array<{ path: string; name: string; created: number; modified: number }> | null>
  createProjectFolder: (parentPath: string, folderName: string) => Promise<{ success: boolean; path?: string; name?: string; created?: number; modified?: number; error?: string }>
  moveFolder: (sourcePath: string, targetParentPath: string) => Promise<{ success: boolean; path?: string; name?: string; created?: number; modified?: number; error?: string }>
  isFolderInside: (folderPath: string, parentPath: string) => Promise<boolean>
  openFolder: (path: string) => Promise<boolean>
  getFolderContents: (path: string) => Promise<any[]>
  renameItem: (oldPath: string, newName: string) => Promise<{ success: boolean; newPath?: string; error?: string }>
  deleteItem: (path: string) => Promise<{ success: boolean; error?: string }>
  createFolder: (parentPath: string, folderName: string) => Promise<{ success: boolean; path?: string; error?: string }>
  getAppFolder: () => Promise<string>
  checkPathExists: (path: string) => Promise<boolean>
  saveAttachment: (projectId: string, filePath: string) => Promise<{ success: boolean; path?: string; name?: string; size?: number; error?: string }>
  saveClipboardImage: (projectId: string, imageBuffer: ArrayBuffer) => Promise<{ success: boolean; path?: string; name?: string; size?: number; error?: string }>
  selectFile: () => Promise<string[] | null>
  openAttachment: (filePath: string) => Promise<boolean>
  deleteAttachment: (filePath: string) => Promise<{ success: boolean; error?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

