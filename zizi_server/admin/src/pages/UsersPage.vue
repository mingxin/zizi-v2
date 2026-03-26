<template>
  <div class="p-8">
    <h2 class="text-xl font-black text-slate-900 mb-6">用户管理</h2>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">ID</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">手机号</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">角色</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">绘本</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">识字</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">注册时间</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 text-slate-400">{{ u.id }}</td>
            <td class="px-4 py-3 font-medium">{{ u.phone }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="u.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-slate-500'">{{ u.role }}</span>
            </td>
            <td class="px-4 py-3">{{ u._count.books }}</td>
            <td class="px-4 py-3">{{ u._count.photoWords }}</td>
            <td class="px-4 py-3 text-slate-400">{{ fmtDate(u.createdAt) }}</td>
            <td class="px-4 py-3">
              <button
                @click="toggleBan(u)"
                class="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                :class="u.isBanned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'"
              >
                {{ u.isBanned ? '解封' : '封禁' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :total="total" :page="page" :limit="limit" @change="p => { page = p; loadUsers() }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/core/http'
import Pagination from '@/components/Pagination.vue'

const users = ref<any[]>([])
const total = ref(0)
const page  = ref(1)
const limit = 20

async function loadUsers() {
  const { data } = await http.get('/admin/users', { params: { page: page.value, limit } })
  users.value = data.data
  total.value = data.total
}

async function toggleBan(u: any) {
  await http.patch(`/admin/users/${u.id}/ban`)
  u.isBanned = !u.isBanned
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN')
}

onMounted(loadUsers)
</script>
