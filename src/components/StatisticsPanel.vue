<template>
  <div class="statistics-panel">
    <div 
      v-for="(stat, index) in statCards" 
      :key="stat.title" 
      class="stat-card"
      :style="{ background: stat.gradient }"
      @click="handleCardClick(stat.phase)"
    >
      <div class="card-content">
        <div class="stat-icon-wrapper">
          <div class="stat-icon">
            <component :is="stat.icon" />
          </div>
        </div>
        
        <div class="stat-info">
          <div class="stat-label">{{ stat.title }}</div>
          <div class="stat-number">{{ formatNumber(stat.value) }}</div>
        </div>
      </div>
      
      <!-- 装饰性波浪线 -->
      <svg class="wave-decoration" viewBox="0 0 200 60" preserveAspectRatio="none">
        <path 
          :d="getWavePath(index)" 
          fill="rgba(255,255,255,0.15)"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FolderOpened, Clock, CircleCheck, Warning } from '@element-plus/icons-vue'

interface Props {
  stats: {
    total: number
    todo: number
    delivered: number
    toModify: number
    urgent: number
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['change-phase'])

const statCards = computed(() => [
  { 
    icon: FolderOpened, 
    title: '项目总数', 
    value: props.stats.total,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    phase: null
  },
  { 
    icon: Clock, 
    title: '待做', 
    value: props.stats.todo,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    phase: '待做'
  },
  { 
    icon: CircleCheck, 
    title: '已交付', 
    value: props.stats.delivered,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    phase: '已交付'
  },
  { 
    icon: Warning, 
    title: '紧急', 
    value: props.stats.urgent,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    phase: null
  }
])

const handleCardClick = (phase: string | null) => {
  if (phase) {
    emit('change-phase', phase)
  }
}

// 格式化数字显示
const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

// 生成不同的波浪路径
const getWavePath = (index: number): string => {
  const paths = [
    'M0,20 Q50,10 100,20 T200,20 L200,60 L0,60 Z',
    'M0,25 Q50,15 100,25 T200,25 L200,60 L0,60 Z',
    'M0,30 Q50,20 100,30 T200,30 L200,60 L0,60 Z',
    'M0,22 Q50,12 100,22 T200,22 L200,60 L0,60 Z'
  ]
  return paths[index % paths.length]
}
</script>

<style scoped>
.statistics-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 8px;
}

.stat-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 30px 26px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  min-height: 150px;
  display: flex;
  flex-direction: column;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

/* 所有卡片都是白色文字 */
.stat-card {
  color: white;
}

.stat-card .stat-label {
  color: rgba(255, 255, 255, 0.95);
}

.stat-card .stat-number {
  color: white;
}

.stat-card .stat-icon {
  color: white;
}

.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.stat-icon-wrapper {
  display: flex;
  align-items: flex-start;
}

.stat-icon {
  font-size: 44px;
  opacity: 0.95;
  transition: all 0.35s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-card:hover .stat-icon {
  transform: scale(1.15) rotate(5deg);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -1px;
  color: var(--color-text-primary);
}

/* 波浪装饰 */
.wave-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  width: 100%;
  opacity: 1;
  z-index: 1;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .statistics-panel {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .statistics-panel {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .statistics-panel {
    grid-template-columns: 1fr;
  }
}

/* 入场动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.stat-card:nth-child(1) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(2) {
  animation-delay: 0.15s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.2s;
}

.stat-card:nth-child(4) {
  animation-delay: 0.25s;
}

/* 脉动效果 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

</style>
