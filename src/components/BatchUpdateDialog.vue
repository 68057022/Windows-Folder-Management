<template>
  <el-dialog
    v-model="visible"
    title="批量更新状态"
    width="500px"
    @close="handleClose"
  >
    <el-alert
      title="批量操作"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px;"
    >
      <p>已选择 <strong>{{ selectedIds.length }}</strong> 个项目</p>
    </el-alert>
    
    <el-form label-width="100px">
      <el-form-item label="更新状态为">
        <el-radio-group v-model="newPhase" size="large">
          <el-radio-button label="待做">待做</el-radio-button>
          <el-radio-button label="已交付">已交付</el-radio-button>
          <el-radio-button label="需修改">需修改</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="!newPhase">
          确认更新
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: boolean
  selectedIds: string[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const newPhase = ref<'待做' | '已交付' | '需修改'>('待做')

const handleConfirm = () => {
  if (newPhase.value) {
    emit('confirm', newPhase.value)
    handleClose()
  }
}

const handleClose = () => {
  newPhase.value = '待做'
  visible.value = false
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

