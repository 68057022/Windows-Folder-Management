<template>
  <div class="dashboard-view">
    <StatisticsPanel :stats="projectStore.statistics" @change-phase="handleQuickPhaseChange" />
    <SearchBar 
      :selected-count="selectedCount"
      :selection-mode="selectionMode"
      @batch-update="handleBatchUpdate"
      @toggle-selection="toggleSelection"
      @clear-selection="clearSelection"
    />
    <ProjectGrid 
      :selection-mode="selectionMode"
      :selected-ids="selectedIds"
      @edit="$emit('edit', $event)"
      @manage-files="$emit('manage-files', $event)"
      @toggle-select="toggleSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '@/stores/project'
import StatisticsPanel from '@/components/StatisticsPanel.vue'
import SearchBar from '@/components/SearchBar.vue'
import ProjectGrid from '@/components/ProjectGrid.vue'

interface Props {
  selectedCount?: number
  selectionMode?: boolean
  selectedIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedCount: 0,
  selectionMode: false,
  selectedIds: () => []
})

const emit = defineEmits(['edit', 'manage-files', 'batch-update', 'toggle-selection', 'clear-selection', 'toggle-select'])

const projectStore = useProjectStore()

const handleQuickPhaseChange = (phase: '待做' | '已交付' | '需修改') => {
  projectStore.phaseFilter = phase === projectStore.phaseFilter ? '全部' : phase
}

const handleBatchUpdate = () => {
  emit('batch-update')
}

const toggleSelection = () => {
  emit('toggle-selection')
}

const clearSelection = () => {
  emit('clear-selection')
}

const toggleSelect = (id: string) => {
  emit('toggle-select', id)
}
</script>

<style scoped>
.dashboard-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: hidden;
}
</style>

