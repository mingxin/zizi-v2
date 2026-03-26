<template>
  <nav class="flex items-center justify-around px-4 py-2 bg-white/90 dark:bg-bg-dark/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800">
    <a
      v-for="tab in tabs"
      :key="tab.name"
      @click.prevent="router.push(tab.path)"
      href="#"
      :class="[
        'flex-1 flex flex-col items-center justify-center py-3 rounded-[1.5rem] transition-all duration-300',
        isActive(tab.path)
          ? 'bg-primary/10'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
      ]"
    >
      <div class="w-12 h-10 rounded-full flex items-center justify-center mb-1">
        <span
          class="material-symbols-outlined text-[28px]"
          :style="isActive(tab.path) ? 'font-variation-settings:\'FILL\' 1' : 'font-variation-settings:\'FILL\' 0'"
          :class="isActive(tab.path) ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'"
        >{{ tab.icon }}</span>
      </div>
      <span
        class="text-sm font-bold tracking-wider"
        :class="isActive(tab.path) ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'"
      >{{ tab.label }}</span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { name: 'photo',  path: '/',       icon: 'photo_camera', label: '拍图' },
  { name: 'books',  path: '/books',  icon: 'menu_book',    label: '绘本' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
