<template>
  <div class="install-guide">
    <div class="guide-container">
      <div class="guide-header">
        <el-icon class="logo-icon" :size="80"><FolderAdd /></el-icon>
        <h1>欢迎使用企业项目管理系统</h1>
        <p class="subtitle">请选择数据存储目录以开始使用</p>
      </div>
      
      <div class="guide-content">
        <el-steps :active="currentStep" align-center>
          <el-step title="选择目录" icon="FolderAdd" />
          <el-step title="确认信息" icon="Check" />
          <el-step title="完成安装" icon="CircleCheck" />
        </el-steps>
        
        <div class="step-content">
          <!-- 步骤1: 选择目录 -->
          <div v-if="currentStep === 0" class="step-panel">
            <h3>选择数据存储位置</h3>
            <p class="step-desc">所有项目数据、附件和配置文件都将保存在此目录中</p>
            
            <el-alert
              title="建议"
              type="info"
              :closable="false"
              show-icon
            >
              <p>• 选择一个容易记住的位置（如 D:\项目管理系统）</p>
              <p>• 确保该位置有足够的存储空间</p>
              <p>• 建议定期备份此目录</p>
            </el-alert>
            
            <div class="path-selector">
              <el-input 
                v-model="selectedPath" 
                placeholder="点击选择数据存储目录"
                readonly
                size="large"
              >
                <template #prepend>
                  <el-icon><Folder /></el-icon>
                </template>
              </el-input>
              <el-button 
                type="primary" 
                size="large"
                :icon="FolderOpened"
                @click="selectDirectory"
              >
                选择目录
              </el-button>
            </div>
            
            <div class="quick-options">
              <p>快速选择：</p>
              <el-button-group>
                <el-button @click="selectQuickPath('Desktop')">桌面</el-button>
                <el-button @click="selectQuickPath('Documents')">我的文档</el-button>
                <el-button @click="selectQuickPath('D')">D盘根目录</el-button>
              </el-button-group>
            </div>
          </div>
          
          <!-- 步骤2: 确认信息 -->
          <div v-else-if="currentStep === 1" class="step-panel">
            <h3>确认安装信息</h3>
            
            <div class="info-card">
              <div class="info-item">
                <label>数据存储目录：</label>
                <span class="info-value">{{ selectedPath }}</span>
              </div>
              <div class="info-item">
                <label>预计占用空间：</label>
                <span class="info-value">约 10 MB（初始）</span>
              </div>
              <div class="info-item">
                <label>将创建的文件：</label>
                <div class="file-list">
                  <p>📁 项目管理系统/</p>
                  <p>　├─ 📄 config.json（配置文件）</p>
                  <p>　├─ 📄 projects.json（项目数据）</p>
                  <p>　└─ 📁 attachments/（附件文件夹）</p>
                </div>
              </div>
            </div>
            
            <el-alert
              title="重要提示"
              type="warning"
              :closable="false"
              show-icon
            >
              <p>• 安装完成后，请勿手动删除或移动此目录</p>
              <p>• 如需更换目录，请在设置中重新配置</p>
              <p>• 建议定期备份数据目录</p>
            </el-alert>
          </div>
          
          <!-- 步骤3: 完成 -->
          <div v-else-if="currentStep === 2" class="step-panel">
            <div class="success-panel">
              <el-icon class="success-icon" :size="100" color="#67C23A">
                <CircleCheck />
              </el-icon>
              <h3>安装完成！</h3>
              <p class="success-desc">数据目录已成功配置，现在可以开始使用了</p>
              
              <div class="success-info">
                <p><strong>数据存储位置：</strong></p>
                <p class="path-display">{{ selectedPath }}</p>
                <el-button 
                  text 
                  type="primary"
                  :icon="FolderOpened"
                  @click="openDataFolder"
                >
                  打开数据目录
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="guide-actions">
          <el-button 
            v-if="currentStep > 0 && currentStep < 2"
            size="large"
            @click="prevStep"
          >
            上一步
          </el-button>
          <el-button 
            v-if="currentStep < 2"
            type="primary" 
            size="large"
            :disabled="!selectedPath"
            @click="nextStep"
          >
            {{ currentStep === 1 ? '确认安装' : '下一步' }}
          </el-button>
          <el-button 
            v-else
            type="primary" 
            size="large"
            @click="complete"
          >
            开始使用
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  FolderAdd, Folder, FolderOpened, Check, CircleCheck 
} from '@element-plus/icons-vue'

const emit = defineEmits(['complete'])

const currentStep = ref(0)
const selectedPath = ref('')

const selectDirectory = async () => {
  try {
    const result = await window.electronAPI.selectInstallDirectory()
    if (result) {
      selectedPath.value = result
    }
  } catch (error) {
    ElMessage.error('选择目录失败')
  }
}

const selectQuickPath = async (type: string) => {
  try {
    const result = await window.electronAPI.getQuickPath(type)
    if (result) {
      selectedPath.value = result
    }
  } catch (error) {
    ElMessage.error('获取路径失败')
  }
}

const nextStep = async () => {
  if (currentStep.value === 0 && !selectedPath.value) {
    ElMessage.warning('请先选择数据存储目录')
    return
  }
  
  if (currentStep.value === 1) {
    // 执行安装
    try {
      const success = await window.electronAPI.initializeDataDirectory(selectedPath.value)
      if (success) {
        currentStep.value++
      } else {
        ElMessage.error('初始化数据目录失败')
      }
    } catch (error) {
      ElMessage.error('安装失败')
    }
  } else {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const openDataFolder = async () => {
  await window.electronAPI.openFolder(selectedPath.value)
}

const complete = () => {
  emit('complete', selectedPath.value)
}
</script>

<style scoped>
.install-guide {
  width: 100vw;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.guide-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  width: 100%;
  overflow: hidden;
}

.guide-header {
  text-align: center;
  padding: 60px 40px 40px;
  background: white;
  border-bottom: 2px solid #eef0f4;
}

.logo-icon {
  margin-bottom: 20px;
  color: #409EFF;
}

.guide-header h1 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-secondary);
}

.guide-content {
  padding: 40px;
}

.step-content {
  margin: 40px 0;
  min-height: 400px;
}

.step-panel {
  animation: fadeIn 0.3s ease;
}

.step-panel h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--color-text-primary);
}

.step-desc {
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.path-selector {
  display: flex;
  gap: 12px;
  margin: 24px 0;
}

.path-selector .el-input {
  flex: 1;
}

.path-selector .el-button {
  height: 40px;
}

.quick-options {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.quick-options p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  font-weight: 500;
}

.info-card {
  background: #fafbfc;
  border: 2px solid #eef0f4;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
}

.info-item {
  margin-bottom: 20px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.info-value {
  color: var(--color-text-secondary);
  font-size: 15px;
}

.file-list {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-top: 8px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.success-panel {
  text-align: center;
  padding: 40px 0;
}

.success-icon {
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease;
  color: #67C23A;
}

.success-panel h3 {
  font-size: 24px;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.success-desc {
  color: var(--color-text-secondary);
  font-size: 16px;
  margin-bottom: 32px;
}

.success-info {
  background: #f0f9ff;
  border: 2px solid #409EFF;
  border-radius: 12px;
  padding: 24px;
  margin: 0 auto;
  max-width: 600px;
}

.success-info strong {
  color: var(--color-text-primary);
}

.path-display {
  font-family: 'Consolas', monospace;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 12px 0;
  color: #409EFF;
  font-weight: 600;
  word-break: break-all;
  border: 1px solid #e4e7ed;
}

.guide-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 2px solid #eef0f4;
}

.guide-actions .el-button {
  min-width: 120px;
  height: 44px;
  font-size: 15px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Element Plus 步骤条样式覆盖 */
:deep(.el-steps) {
  margin: 32px 0;
}

:deep(.el-step__title) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-step__icon) {
  width: 32px;
  height: 32px;
  font-size: 16px;
}

/* 调整按钮组样式 */
.quick-options :deep(.el-button-group) {
  display: flex;
  gap: 8px;
}

.quick-options :deep(.el-button) {
  flex: 1;
  border-radius: 8px;
}
</style>

