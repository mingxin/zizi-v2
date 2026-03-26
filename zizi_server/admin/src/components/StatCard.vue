<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div
      class="size-12 rounded-xl flex items-center justify-center"
      :class="colorMap[color] ?? colorMap.blue"
    >
      <span class="material-symbols-outlined text-2xl">{{ icon }}</span>
    </div>
    <div>
      <p class="text-2xl font-black text-slate-900">{{ value ?? '—' }}</p>
      <p class="text-xs font-medium text-slate-500">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; label: string; value?: number; color: string }>()
const colorMap: Record<string, string> = {
  blue:   'bg-blue-50 text-blue-500',
  yellow: 'bg-yellow-50 text-yellow-500',
  green:  'bg-green-50 text-green-500',
  purple: 'bg-purple-50 text-purple-500',
  orange: 'bg-orange-50 text-orange-500',
  red:    'bg-red-50 text-red-500',
}
</script>
