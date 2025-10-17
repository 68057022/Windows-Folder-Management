<template>
  <div class="project-card" :class="{ 'historical-project': project.isHistorical, 'selected': selected }" @click="handleCardClick">
    <!-- 选择复选框 -->
    <div v-if="selectionMode" class="selection-checkbox" @click.stop="$emit('toggle-select')">
      <el-checkbox :model-value="selected" size="large" />
    </div>
    
    <!-- 顶部状态条 -->
    <div class="status-bar" :style="{ background: themeColor }"></div>
    
    <!-- 历史项目标识 -->
    <div v-if="project.isHistorical" class="historical-badge">
      <el-icon><Clock /></el-icon>
      <span>历史项目</span>
    </div>
    
    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 头部 -->
      <div class="card-header">
        <div class="project-info">
          <div class="icon-wrapper" :style="{ background: themeColor + '15', color: themeColor }">
            <el-icon :size="24"><Folder /></el-icon>
          </div>
          <div class="title-section">
            <h3 class="project-name">{{ project.name }}</h3>
            <div class="badges">
              <span class="badge status-badge" :style="{ background: themeColor + '15', color: themeColor }">
                {{ project.phase }}
              </span>
              <span class="badge priority-badge" :style="{ background: priorityColor + '15', color: priorityColor }">
                <el-icon><Star /></el-icon> {{ project.priority }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 客户信息 -->
      <div v-if="project.client" class="info-section">
        <el-icon class="section-icon"><User /></el-icon>
        <span class="section-text">{{ project.client }}</span>
      </div>
      
      <!-- 项目需求 -->
      <div v-if="project.description" class="description-section">
        <div class="desc-header">
          <el-icon><Document /></el-icon>
          <span>项目需求</span>
        </div>
        <p class="desc-text">{{ truncatedDescription }}</p>
      </div>
      
      <!-- 附件 -->
      <div v-if="project.attachments && project.attachments.length > 0" class="attachments-section">
        <div class="attachments-header">
          <el-icon><Paperclip /></el-icon>
          <span>附件 ({{ project.attachments.length }})</span>
        </div>
        <div class="attachments-list">
          <div 
            v-for="(file, index) in project.attachments.slice(0, 3)" 
            :key="index"
            class="attachment-item"
            @click.stop="handleOpenAttachment(file)"
          >
            <el-icon class="file-icon">
              <component :is="file.type === 'image' ? Picture : Document" />
            </el-icon>
            <span class="file-name">{{ file.name }}</span>
          </div>
          <div v-if="project.attachments.length > 3" class="more-attachments">
            +{{ project.attachments.length - 3 }} 更多
          </div>
        </div>
      </div>
      
      <!-- 截止日期 -->
      <div v-if="project.deadline" class="deadline-section" :class="deadlineInfo.type">
        <el-icon class="deadline-icon"><Calendar /></el-icon>
        <div class="deadline-info">
          <span class="deadline-label">截止日期</span>
          <div class="deadline-content">
            <span class="deadline-date">{{ project.deadline }}</span>
            <span v-if="deadlineInfo.status" class="deadline-status">{{ deadlineInfo.status }}</span>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions" @click.stop>
        <el-button size="small" @click="$emit('open', project)">
          <el-icon><FolderOpened /></el-icon>
          打开
        </el-button>
        <el-button size="small" type="success" @click="$emit('manage-files', project)">
          <el-icon><Files /></el-icon>
          文件
        </el-button>
        <el-button size="small" type="primary" @click="$emit('edit', project)">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button size="small" type="danger" @click="$emit('delete', project)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Folder, User, Document, Calendar, Paperclip, Picture,
  FolderOpened, Files, Edit, Delete, Star, Clock
} from '@element-plus/icons-vue'
import type { Project } from '../stores/project'

interface Props {
  project: Project
  selectionMode?: boolean
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectionMode: false,
  selected: false
})
const emit = defineEmits(['edit', 'delete', 'open', 'manage-files', 'toggle-select'])

const themeColor = computed(() => {
  const colors = {
    '待做': '#3b82f6',
    '已交付': '#10b981',
    '需修改': '#f59e0b'
  }
  return colors[props.project.phase] || '#3b82f6'
})

const priorityColor = computed(() => {
  const colors = { '高': '#ef4444', '中': '#f59e0b', '低': '#94a3b8' }
  return colors[props.project.priority] || '#94a3b8'
})

const truncatedDescription = computed(() => {
  const desc = props.project.description
  return desc.length > 120 ? desc.slice(0, 120) + '...' : desc
})

const deadlineInfo = computed(() => {
  if (!props.project.deadline) return { type: '', status: '' }
  
  const deadline = new Date(props.project.deadline).getTime()
  const now = Date.now()
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) {
    return { type: 'overdue', status: '已逾期' }
  } else if (daysLeft <= 3) {
    return { type: 'urgent', status: `紧急 (${daysLeft}天)` }
  } else {
    return { type: 'normal', status: `剩余 ${daysLeft} 天` }
  }
})

const handleCardClick = () => {
  if (props.selectionMode) {
    emit('toggle-select')
  } else {
    emit('open', props.project)
  }
}

const handleOpenAttachment = async (file: any) => {
  await window.electronAPI.openAttachment(file.path)
}
</script>

<style scoped>
.project-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.project-card.selected {
  border: 3px solid #409EFF;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.selection-checkbox {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 100;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 历史项目灰色样式 */
.project-card.historical-project {
  background: #f8f9fa;
  opacity: 0.85;
}

.project-card.historical-project .card-content {
  filter: grayscale(0.3);
}

.project-card.historical-project:hover {
  opacity: 1;
}

.historical-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(148, 163, 184, 0.9);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.status-bar {
  height: 4px;
  width: 100%;
}

.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.project-info {
  display: flex;
  gap: 16px;
  flex: 1;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge .el-icon {
  font-size: 12px;
}

.info-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-bg-tertiary);
  border-radius: 10px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.section-icon {
  font-size: 18px;
  color: var(--color-text-tertiary);
}

.description-section {
  padding: 16px;
  background: var(--color-bg-tertiary);
  border-radius: 12px;
  border-left: 3px solid var(--color-primary);
}

.desc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.desc-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}

.attachments-section {
  padding: 14px;
  background: var(--color-bg-tertiary);
  border-radius: 10px;
}

.attachments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border-radius: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 150px;
}

.attachment-item:hover {
  background: var(--color-primary);
  color: white;
}

.attachment-item:hover .file-icon {
  color: white;
}

.file-icon {
  font-size: 14px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.more-attachments {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.deadline-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--color-bg-tertiary);
}

.deadline-section.urgent {
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
}

.deadline-section.overdue {
  background: #fee2e2;
  border-left: 3px solid #ef4444;
}

.deadline-icon {
  font-size: 20px;
  color: var(--color-text-tertiary);
}

.deadline-section.urgent .deadline-icon {
  color: #f59e0b;
}

.deadline-section.overdue .deadline-icon {
  color: #ef4444;
}

.deadline-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deadline-label {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.deadline-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deadline-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.deadline-status {
  font-size: 12px;
  font-weight: 600;
}

.deadline-section.urgent .deadline-status {
  color: #f59e0b;
}

.deadline-section.overdue .deadline-status {
  color: #ef4444;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.actions .el-button {
  font-weight: 500;
}

.actions .el-button:last-child {
  grid-column: 4;
}
</style>
