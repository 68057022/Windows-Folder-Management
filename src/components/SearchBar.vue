<template>
  <div class="search-bar">
    <div class="search-input-section">
      <el-input
        v-model="projectStore.searchQuery"
        placeholder="搜索项目名称、客户..."
        size="large"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <div class="filters-section">
      <div class="filter-group">
        <label><el-icon><Flag /></el-icon> 项目状态</label>
        <el-select v-model="projectStore.phaseFilter" size="default">
          <el-option label="全部" value="全部" />
          <el-option label="待做" value="待做" />
          <el-option label="已交付" value="已交付" />
          <el-option label="需修改" value="需修改" />
        </el-select>
      </div>
      
      <div class="filter-group">
        <label><el-icon><Star /></el-icon> 优先级</label>
        <el-select v-model="projectStore.priorityFilter" size="default">
          <el-option label="全部" value="全部" />
          <el-option label="高" value="高" />
          <el-option label="中" value="中" />
          <el-option label="低" value="低" />
        </el-select>
      </div>
      
      <div class="filter-group">
        <label><el-icon><Sort /></el-icon> 排序方式</label>
        <el-select v-model="projectStore.sortBy" size="default">
          <el-option label="修改时间" value="修改时间" />
          <el-option label="创建时间" value="创建时间" />
          <el-option label="截止日期" value="截止日期" />
        </el-select>
      </div>
      
      
      <div class="batch-actions">
        <el-button 
          :type="selectionMode ? 'warning' : 'default'" 
          @click="$emit('toggle-selection')"
        >
          <el-icon><Operation /></el-icon>
          {{ selectionMode ? '取消选择' : '批量操作' }}
        </el-button>
        
        <template v-if="selectionMode && selectedCount > 0">
          <el-button type="primary" @click="$emit('batch-update')">
            批量更新 ({{ selectedCount }})
          </el-button>
          <el-button @click="$emit('clear-selection')">清空选择</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Flag, Star, Sort, Operation } from '@element-plus/icons-vue'
import { useProjectStore } from '../stores/project'

interface Props {
  selectedCount: number
  selectionMode: boolean
}

defineProps<Props>()
defineEmits(['batch-update', 'toggle-selection', 'clear-selection'])
const projectStore = useProjectStore()
</script>

<style scoped>
.search-bar {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-end;
  box-shadow: var(--shadow-sm);
}

.search-input-section {
  flex: 1;
  min-width: 300px;
}

.filters-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 140px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-group label .el-icon {
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  padding: 12px 16px;
  border-radius: 10px;
}

:deep(.el-input__prefix) {
  font-size: 18px;
  color: var(--color-text-tertiary);
}

:deep(.el-select) {
  width: 100%;
}
</style>
