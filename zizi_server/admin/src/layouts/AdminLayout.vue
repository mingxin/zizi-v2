<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div class="p-5 border-b border-gray-100">
        <h1 class="text-lg font-black text-slate-900">Zizi <span class="text-yellow-400">管理台</span></h1>
      </div>
      <nav class="flex-1 p-3 flex flex-col gap-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          :class="isActive(item.to)
            ? 'bg-yellow-50 text-yellow-700 font-bold'
            : 'text-slate-600 hover:bg-gray-100'"
        >
          <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="p-3 border-t border-gray-100">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <span class="material-symbols-outlined text-xl">logout</span>
          退出登录
        </button>
      </div>
    </aside>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const navItems = [
  { to: '/dashboard',   icon: 'dashboard',    label: '数据总览' },
  { to: '/users',       icon: 'group',         label: '用户管理' },
  { to: '/books',       icon: 'menu_book',     label: '绘本管理' },
  { to: '/photo-words', icon: 'translate',     label: '识字记录' },
  { to: '/config',      icon: 'settings',      label: '全局配置' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
