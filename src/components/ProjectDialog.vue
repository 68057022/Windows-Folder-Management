<template>
  <el-dialog
    v-model="visible"
    :title="project ? '编辑项目' : '新建项目'"
    width="750px"
    @close="handleClose"
    center
  >
    <el-form :model="formData" label-width="110px" label-position="left" class="project-form">
      <el-form-item label="项目路径">
        <el-input v-model="formData.path" disabled>
          <template #prefix>
            <el-icon><Folder /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="客户备注">
        <el-input 
          v-model="formData.client" 
          placeholder="例如：张总、李经理、某某公司..."
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目状态">
            <el-select v-model="formData.phase" style="width: 100%">
              <el-option label="待做" value="待做">
                <el-icon><Clock /></el-icon> 待做
              </el-option>
              <el-option label="已交付" value="已交付">
                <el-icon><Check /></el-icon> 已交付
              </el-option>
              <el-option label="需修改" value="需修改">
                <el-icon><Edit /></el-icon> 需修改
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级">
            <el-select v-model="formData.priority" style="width: 100%">
              <el-option label="高" value="高">
                <el-icon><Star /></el-icon> 高
              </el-option>
              <el-option label="中" value="中">
                <el-icon><Star /></el-icon> 中
              </el-option>
              <el-option label="低" value="低">
                <el-icon><Star /></el-icon> 低
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="截止日期">
        <el-date-picker
          v-model="formData.deadline"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        >
          <template #prefix>
            <el-icon><Calendar /></el-icon>
          </template>
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="项目需求" class="description-item">
        <div class="description-wrapper">
          <el-input
            ref="textareaRef"
            v-model="formData.description"
            type="textarea"
            :rows="6"
            placeholder="详细输入客户需求、功能要求、技术要求等...&#10;&#10;提示：可以直接粘贴图片 (Ctrl+V)"
            maxlength="2000"
            show-word-limit
            @paste="handlePaste"
          />
          <div class="upload-hint">
            <el-icon><Picture /></el-icon>
            <span>支持粘贴图片和上传文件</span>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="附件" class="attachments-item">
        <div class="attachments-section">
          <el-button type="primary" @click="handleSelectFiles" :loading="uploading">
            <el-icon><Upload /></el-icon>
            选择文件
          </el-button>
          
          <div v-if="formData.attachments.length > 0" class="attachments-list">
            <div 
              v-for="(file, index) in formData.attachments" 
              :key="index"
              class="attachment-card"
            >
              <div class="attachment-preview">
                <img 
                  v-if="file.type === 'image'" 
                  :src="'file://' + file.path" 
                  alt="preview"
                  class="preview-image"
                />
                <el-icon v-else :size="32" class="file-icon"><Document /></el-icon>
              </div>
              <div class="attachment-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ formatSize(file.size) }}</div>
              </div>
              <el-button 
                type="danger" 
                :icon="Delete" 
                circle 
                size="small"
                @click="handleRemoveAttachment(index)"
              />
            </div>
          </div>
          
          <div v-else class="empty-attachments">
            <el-icon :size="40"><Paperclip /></el-icon>
            <p>暂无附件</p>
          </div>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose" size="large">取消</el-button>
      <el-button type="primary" @click="handleSave" size="large" :loading="saving">
        <el-icon><Check /></el-icon> 保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Folder, User, Clock, Check, Edit, Star, Calendar,
  Picture, Upload, Document, Delete, Paperclip
} from '@element-plus/icons-vue'
import type { Project } from '../stores/project'

interface Props {
  modelValue: boolean
  project: Project | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const textareaRef = ref()
const uploading = ref(false)
const saving = ref(false)

const formData = ref({
  path: '',
  client: '',
  phase: '待做' as '待做' | '已交付' | '需修改',
  priority: '中' as '高' | '中' | '低',
  deadline: '',
  description: '',
  attachments: [] as Array<{
    name: string
    path: string
    type: 'image' | 'file'
    size: number
  }>
})

watch(() => props.project, (project) => {
  if (project) {
    formData.value = {
      path: project.path,
      client: project.client,
      phase: project.phase,
      priority: project.priority,
      deadline: project.deadline,
      description: project.description,
      attachments: project.attachments || []
    }
  }
}, { immediate: true })

// 处理粘贴图片
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items || !props.project) return
  
  for (const item of Array.from(items)) {
    if (item.type.indexOf('image') !== -1) {
      event.preventDefault()
      
      const blob = item.getAsFile()
      if (!blob) continue
      
      uploading.value = true
      try {
        // 将 blob 转为 ArrayBuffer
        const reader = new FileReader()
        reader.onload = async (e) => {
          const buffer = e.target?.result as ArrayBuffer
          
          // 直接保存图片到应用文件夹
          const result = await window.electronAPI.saveClipboardImage(props.project!.id, buffer)
          if (result.success && result.path && result.name && result.size) {
            formData.value.attachments.push({
              name: result.name,
              path: result.path,
              type: 'image',
              size: result.size
            })
            ElMessage.success('图片已添加')
          } else {
            ElMessage.error('图片保存失败')
          }
          uploading.value = false
        }
        reader.readAsArrayBuffer(blob)
      } catch (error) {
        ElMessage.error('图片处理失败')
        uploading.value = false
      }
    }
  }
}

// 选择文件
const handleSelectFiles = async () => {
  if (!props.project) return
  
  uploading.value = true
  try {
    const filePaths = await window.electronAPI.selectFile()
    if (!filePaths || filePaths.length === 0) {
      uploading.value = false
      return
    }
    
    for (const filePath of filePaths) {
      const result = await window.electronAPI.saveAttachment(props.project.id, filePath)
      if (result.success && result.path && result.name && result.size) {
        // 判断文件类型
        const ext = result.name.split('.').pop()?.toLowerCase()
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
        const type = imageExts.includes(ext || '') ? 'image' : 'file'
        
        formData.value.attachments.push({
          name: result.name,
          path: result.path,
          type: type,
          size: result.size
        })
      }
    }
    
    ElMessage.success(`已添加 ${filePaths.length} 个文件`)
  } catch (error) {
    ElMessage.error('文件上传失败')
  } finally {
    uploading.value = false
  }
}

// 移除附件
const handleRemoveAttachment = async (index: number) => {
  const file = formData.value.attachments[index]
  
  try {
    await window.electronAPI.deleteAttachment(file.path)
    formData.value.attachments.splice(index, 1)
    ElMessage.success('附件已移除')
  } catch (error) {
    ElMessage.error('移除失败')
  }
}

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleClose = () => {
  visible.value = false
}

const handleSave = () => {
  saving.value = true
  emit('save', {
    client: formData.value.client,
    phase: formData.value.phase,
    priority: formData.value.priority,
    deadline: formData.value.deadline,
    description: formData.value.description,
    attachments: formData.value.attachments
  })
  saving.value = false
}
</script>

<style scoped>
.project-form {
  padding: 10px 0;
}

.project-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--color-text-primary);
}

.description-wrapper {
  width: 100%;
}

.upload-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.description-item :deep(.el-textarea__inner) {
  font-size: 13px;
  line-height: 1.6;
}

.attachments-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attachments-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.attachment-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-bg-tertiary);
  border-radius: 12px;
  border: 2px solid var(--color-border);
  transition: all 0.2s ease;
  position: relative;
}

.attachment-card:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-secondary);
}

.attachment-card .el-button {
  position: absolute;
  top: 8px;
  right: 8px;
}

.attachment-preview {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.file-icon {
  color: var(--color-text-tertiary);
}

.attachment-info {
  width: 100%;
  text-align: center;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.empty-attachments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--color-bg-tertiary);
  border-radius: 12px;
  color: var(--color-text-tertiary);
}

.empty-attachments p {
  margin: 8px 0 0 0;
  font-size: 14px;
}

:deep(.el-dialog__footer) {
  padding: 20px 24px;
  border-top: 1px solid var(--color-border);
}
</style>
