import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import * as os from 'os'
import Store from 'electron-store'

let mainWindow: BrowserWindow | null = null

const CONFIG_STORE_KEY = 'appConfig'
const PROJECTS_FILE = 'projects.json'

const configStore = new Store({
  name: 'config'
})

function getDataDirectory(): string | null {
  return configStore.get('dataDirectory') as string | null
}

function setDataDirectory(path: string) {
  configStore.set('dataDirectory', path)
}

function getWorkspacePath(): string | null {
  return configStore.get('workspacePath') as string | null
}

function setWorkspacePath(path: string) {
  configStore.set('workspacePath', path)
}

function isInstalled(): boolean {
  const dataDir = getDataDirectory()
  return !!dataDir
}

async function migrateOldData() {
  try {
    const oldProjects = configStore.get('projects') as any[]
    if (oldProjects && oldProjects.length > 0) {
      const dataDir = getDataDirectory()
      if (dataDir) {
        const projectsPath = join(dataDir, PROJECTS_FILE)
        
        try {
          await fs.access(projectsPath)
        } catch {
          await fs.writeFile(projectsPath, JSON.stringify(oldProjects, null, 2))
          console.log('[Electron] Data migration completed:', oldProjects.length, 'projects')
        }
        
        configStore.delete('projects')
      }
    }
  } catch (error) {
    console.error('[Electron] Data migration failed:', error)
  }
}

function getDesktopPath(): string {
  return join(os.homedir(), 'Desktop')
}

function getAppFolder(): string {
  return join(getDesktopPath(), '项目管理系统数据')
}

async function initAppFolder(): Promise<string> {
  const appFolder = getAppFolder()
  try {
    await fs.access(appFolder)
  } catch {
    await fs.mkdir(appFolder, { recursive: true })
  }
  return appFolder
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: join(__dirname, '../public/icon.png')
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  await initAppFolder()
  await migrateOldData()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers

ipcMain.handle('check-installed', () => {
  return isInstalled()
})
ipcMain.handle('select-install-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: '选择数据存储目录'
  })
  
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  
  const selectedPath = result.filePaths[0]
  const dataPath = join(selectedPath, '项目管理系统')
  
  return dataPath
})
ipcMain.handle('get-quick-path', (_, type: string) => {
  let basePath = ''
  
  switch (type) {
    case 'Desktop':
      basePath = join(os.homedir(), 'Desktop')
      break
    case 'Documents':
      basePath = join(os.homedir(), 'Documents')
      break
    case 'D':
      basePath = 'D:\\'
      break
    default:
      basePath = os.homedir()
  }
  
  return join(basePath, '项目管理系统')
})

ipcMain.handle('initialize-data-directory', async (_, path: string) => {
  try {
    await fs.mkdir(path, { recursive: true })
    await fs.mkdir(join(path, 'attachments'), { recursive: true })
    
    const projectsPath = join(path, PROJECTS_FILE)
    await fs.writeFile(projectsPath, JSON.stringify([], null, 2))
    
    setDataDirectory(path)
    return true
  } catch (error) {
    console.error('[Electron] Failed to initialize data directory:', error)
    return false
  }
})

// 获取数据目录
ipcMain.handle('get-data-directory', () => {
  return getDataDirectory()
})

ipcMain.handle('update-data-directory', async (_, newPath: string) => {
  try {
    await fs.access(newPath)
    setDataDirectory(newPath)
    return true
  } catch (error) {
    console.error('[Electron] Failed to update data directory:', error)
    return false
  }
})

ipcMain.handle('get-workspace-path', () => {
  return getWorkspacePath()
})

ipcMain.handle('set-workspace-path', async (_, path: string) => {
  try {
    await fs.access(path)
    setWorkspacePath(path)
    return true
  } catch (error) {
    console.error('[Electron] Failed to save workspace path:', error)
    return false
  }
})

ipcMain.handle('get-projects', async () => {
  try {
    const dataDir = getDataDirectory()
    if (!dataDir) {
      return []
    }
    
    const projectsPath = join(dataDir, PROJECTS_FILE)
    
    try {
      const data = await fs.readFile(projectsPath, 'utf-8')
      return JSON.parse(data)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(projectsPath, JSON.stringify([], null, 2))
        return []
      }
      throw error
    }
  } catch (error) {
    console.error('[Electron] Failed to load projects:', error)
    return []
  }
})

ipcMain.handle('save-projects', async (_, projects) => {
  try {
    const dataDir = getDataDirectory()
    if (!dataDir) {
      console.error('[Electron] Data directory not set')
      return false
    }
    
    const projectsPath = join(dataDir, PROJECTS_FILE)
    const dataStr = JSON.stringify(projects, null, 2)
    await fs.writeFile(projectsPath, dataStr, 'utf-8')
    
    return true
  } catch (error) {
    console.error('[Electron] Failed to save projects:', error)
    return false
  }
})

// 选择文件夹
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  
  const folderPath = result.filePaths[0]
  
  // 获取文件夹信息
  try {
    const stats = await fs.stat(folderPath)
    return {
      path: folderPath,
      name: folderPath.split('\\').pop() || folderPath.split('/').pop(),
      created: stats.birthtimeMs,
      modified: stats.mtimeMs
    }
  } catch (error) {
    console.error('Error reading folder:', error)
    return null
  }
})

// 批量选择文件夹
ipcMain.handle('select-folders', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'multiSelections']
  })
  
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  
  // 获取所有文件夹信息
  try {
    const folders = await Promise.all(
      result.filePaths.map(async (folderPath) => {
        const stats = await fs.stat(folderPath)
        return {
          path: folderPath,
          name: folderPath.split('\\').pop() || folderPath.split('/').pop(),
          created: stats.birthtimeMs,
          modified: stats.mtimeMs
        }
      })
    )
    return folders
  } catch (error) {
    console.error('Error reading folders:', error)
    return null
  }
})

// 在指定路径创建新文件夹
ipcMain.handle('create-project-folder', async (_, parentPath: string, folderName: string) => {
  try {
    const newPath = join(parentPath, folderName)
    await fs.mkdir(newPath, { recursive: true })
    
    const stats = await fs.stat(newPath)
    return {
      success: true,
      path: newPath,
      name: folderName,
      created: stats.birthtimeMs,
      modified: stats.mtimeMs
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 移动文件夹到工作区
ipcMain.handle('move-folder', async (_, sourcePath: string, targetParentPath: string) => {
  try {
    const folderName = sourcePath.split('\\').pop() || sourcePath.split('/').pop() || 'folder'
    let targetPath = join(targetParentPath, folderName)
    
    // 如果目标路径已存在，添加时间戳
    try {
      await fs.access(targetPath)
      // 路径存在，添加时间戳
      const timestamp = Date.now()
      targetPath = join(targetParentPath, `${folderName}_${timestamp}`)
    } catch {
      // 路径不存在，可以使用
    }
    
    // 移动文件夹
    await fs.rename(sourcePath, targetPath)
    
    const stats = await fs.stat(targetPath)
    return {
      success: true,
      path: targetPath,
      name: targetPath.split('\\').pop() || targetPath.split('/').pop(),
      created: stats.birthtimeMs,
      modified: stats.mtimeMs
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 检查文件夹是否在工作区内
ipcMain.handle('is-folder-inside', (_, folderPath: string, parentPath: string) => {
  const normalizedFolder = folderPath.toLowerCase().replace(/\\/g, '/')
  const normalizedParent = parentPath.toLowerCase().replace(/\\/g, '/')
  return normalizedFolder.startsWith(normalizedParent + '/')
})

// 打开文件夹
ipcMain.handle('open-folder', async (_, folderPath: string) => {
  try {
    await shell.openPath(folderPath)
    return true
  } catch (error) {
    console.error('Error opening folder:', error)
    return false
  }
})

// 获取文件夹内容
ipcMain.handle('get-folder-contents', async (_, folderPath: string) => {
  try {
    const items = await fs.readdir(folderPath, { withFileTypes: true })
    
    const contents = await Promise.all(
      items.map(async (item) => {
        const fullPath = join(folderPath, item.name)
        const stats = await fs.stat(fullPath)
        
        return {
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          size: stats.size,
          modified: stats.mtimeMs
        }
      })
    )
    
    return contents
  } catch (error) {
    console.error('Error reading folder contents:', error)
    return []
  }
})

// 重命名文件/文件夹
ipcMain.handle('rename-item', async (_, oldPath: string, newName: string) => {
  try {
    const dir = join(oldPath, '..')
    const newPath = join(dir, newName)
    await fs.rename(oldPath, newPath)
    return { success: true, newPath }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 删除文件/文件夹
ipcMain.handle('delete-item', async (_, path: string) => {
  try {
    const stats = await fs.stat(path)
    if (stats.isDirectory()) {
      await fs.rm(path, { recursive: true, force: true })
    } else {
      await fs.unlink(path)
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 创建文件夹
ipcMain.handle('create-folder', async (_, parentPath: string, folderName: string) => {
  try {
    const newPath = join(parentPath, folderName)
    await fs.mkdir(newPath)
    return { success: true, path: newPath }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 获取应用文件夹路径
ipcMain.handle('get-app-folder', async () => {
  return getAppFolder()
})

// 检查路径是否存在
ipcMain.handle('check-path-exists', async (_, path: string) => {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
})

// 保存附件文件
ipcMain.handle('save-attachment', async (_, projectId: string, filePath: string) => {
  try {
    const appFolder = getAppFolder()
    const attachmentsFolder = join(appFolder, 'attachments', projectId)
    
    // 创建附件文件夹
    await fs.mkdir(attachmentsFolder, { recursive: true })
    
    // 获取文件信息
    const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'file'
    
    // 如果文件名已存在，添加时间戳
    let targetPath = join(attachmentsFolder, fileName)
    try {
      await fs.access(targetPath)
      // 文件存在，添加时间戳
      const ext = fileName.split('.').pop()
      const nameWithoutExt = fileName.replace(`.${ext}`, '')
      const timestamp = Date.now()
      targetPath = join(attachmentsFolder, `${nameWithoutExt}_${timestamp}.${ext}`)
    } catch {
      // 文件不存在，使用原名称
    }
    
    // 复制文件
    await fs.copyFile(filePath, targetPath)
    
    // 获取文件大小
    const stats = await fs.stat(targetPath)
    
    return {
      success: true,
      path: targetPath,
      name: targetPath.split('\\').pop() || targetPath.split('/').pop(),
      size: stats.size
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 保存剪贴板图片
ipcMain.handle('save-clipboard-image', async (_, projectId: string, imageBuffer: Buffer) => {
  try {
    const appFolder = getAppFolder()
    const attachmentsFolder = join(appFolder, 'attachments', projectId)
    
    // 创建附件文件夹
    await fs.mkdir(attachmentsFolder, { recursive: true })
    
    // 生成文件名
    const timestamp = Date.now()
    const fileName = `pasted-image-${timestamp}.png`
    const targetPath = join(attachmentsFolder, fileName)
    
    // 保存文件
    await fs.writeFile(targetPath, imageBuffer)
    
    // 获取文件大小
    const stats = await fs.stat(targetPath)
    
    return {
      success: true,
      path: targetPath,
      name: fileName,
      size: stats.size
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 选择文件
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '所有文件', extensions: ['*'] },
      { name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
      { name: '文档', extensions: ['doc', 'docx', 'pdf', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'] }
    ]
  })
  
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  
  return result.filePaths
})

// 打开附件
ipcMain.handle('open-attachment', async (_, filePath: string) => {
  try {
    await shell.openPath(filePath)
    return true
  } catch (error) {
    console.error('Error opening attachment:', error)
    return false
  }
})

// 删除附件
ipcMain.handle('delete-attachment', async (_, filePath: string) => {
  try {
    await fs.unlink(filePath)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

