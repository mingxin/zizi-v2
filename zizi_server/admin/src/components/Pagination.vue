<template>
  <div class="p-2 flex items-center justify-between text-sm text-slate-500">
    <span>共 {{ total }} 条</span>
    <div class="flex items-center gap-1">
      <button
        :disabled="page <= 1"
        @click="$emit('change', page - 1)"
        class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-all"
      >上一页</button>
      <span class="px-3">{{ page }} / {{ totalPages }}</span>
      <button
        :disabled="page >= totalPages"
        @click="$emit('change', page + 1)"
        class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-all"
      >下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ total: number; page: number; limit: number }>()
defineEmits<{ change: [page: number] }>()
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))
</script>
