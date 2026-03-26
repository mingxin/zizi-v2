<template>
  <div class="p-8">
    <h2 class="text-xl font-black text-slate-900 mb-6">数据总览</h2>
    <div class="grid grid-cols-2 gap-4 mb-6">
      <StatCard icon="group" label="总用户" :value="stats?.totalUsers" color="blue" />
      <StatCard icon="menu_book" label="总绘本" :value="stats?.totalBooks" color="yellow" />
      <StatCard icon="translate" label="识字记录" :value="stats?.totalPhotoWords" color="green" />
      <StatCard icon="today" label="今日新用户" :value="stats?.todayUsers" color="purple" />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <StatCard icon="auto_stories" label="今日新绘本" :value="stats?.todayBooks" color="orange" />
      <StatCard icon="star" label="今日识字次数" :value="stats?.todayPhotoWords" color="red" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/core/http'
import StatCard from '@/components/StatCard.vue'

const stats = ref<Record<string, number> | null>(null)

onMounted(async () => {
  const { data } = await http.get('/admin/stats')
  stats.value = data
})
</script>
