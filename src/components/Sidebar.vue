<template>
  <aside class="sidebar">
    <div class="logo-section">
      <div class="logo-icon">
        <el-icon :size="32"><Briefcase /></el-icon>
      </div>
    </div>
    
    <nav class="nav-menu">
      <el-tooltip content="仪表盘" placement="right" effect="light">
        <div 
          class="nav-item" 
          :class="{ active: activeMenu === 'dashboard' }"
          @click="handleMenuClick('dashboard')"
        >
          <el-icon :size="24"><DataBoard /></el-icon>
        </div>
      </el-tooltip>
      
      <el-tooltip content="项目列表" placement="right" effect="light">
        <div 
          class="nav-item" 
          :class="{ active: activeMenu === 'projects' }"
          @click="handleMenuClick('projects')"
        >
          <el-icon :size="24"><List /></el-icon>
        </div>
      </el-tooltip>
      
      <el-tooltip content="工作区" placement="right" effect="light">
        <div 
          class="nav-item"
          :class="{ active: activeMenu === 'workspace' }"
          @click="handleWorkspace"
        >
          <el-icon :size="24"><Folder /></el-icon>
        </div>
      </el-tooltip>
      
      <el-tooltip content="批量导入" placement="right" effect="light">
        <div 
          class="nav-item"
          :class="{ active: activeMenu === 'import' }"
          @click="handleBatchImport"
        >
          <el-icon :size="24"><Upload /></el-icon>
        </div>
      </el-tooltip>
      
      <el-tooltip content="设置" placement="right" effect="light">
        <div 
          class="nav-item"
          :class="{ active: activeMenu === 'settings' }"
          @click="handleSettings"
        >
          <el-icon :size="24"><Setting /></el-icon>
        </div>
      </el-tooltip>
    </nav>
    
    <div class="sidebar-footer">
      <el-tooltip content="新建项目" placement="right" effect="light">
        <div class="add-button" @click="$emit('add-project')">
          <el-icon :size="28"><Plus /></el-icon>
        </div>
      </el-tooltip>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Briefcase, DataBoard, List, Folder, Upload, Setting, Plus } from '@element-plus/icons-vue'

const emit = defineEmits(['add-project', 'change-workspace', 'batch-import', 'open-settings', 'navigate'])

const activeMenu = ref('dashboard')

const handleMenuClick = (menu: string) => {
  activeMenu.value = menu
  emit('navigate', menu)
}

const handleWorkspace = () => {
  activeMenu.value = 'workspace'
  emit('change-workspace')
}

const handleBatchImport = () => {
  activeMenu.value = 'import'
  emit('batch-import')
}

const handleSettings = () => {
  activeMenu.value = 'settings'
  emit('open-settings')
}
</script>

<style scoped>
.sidebar {
  width: 80px;
  height: 100vh;
  background: linear-gradient(180deg, #2e3192 0%, #1a1f5e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.logo-section {
  margin-bottom: 40px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-icon:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  align-items: center;
}

.nav-item {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: -20px;
  width: 4px;
  height: 0;
  background: white;
  border-radius: 0 4px 4px 0;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.nav-item.active::before {
  height: 32px;
}

.sidebar-footer {
  margin-top: auto;
}

.add-button {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2e3192;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.add-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.add-button:active {
  transform: translateY(-2px);
}
</style>

