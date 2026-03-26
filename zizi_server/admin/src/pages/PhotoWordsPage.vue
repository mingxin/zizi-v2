<template>
  <div class="p-8">
    <h2 class="text-xl font-black text-slate-900 mb-6">识字记录</h2>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">图片</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">词语</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">解释</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">级别</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">用户</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in records" :key="r.id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3">
              <img :src="r.imageUrl" class="size-12 rounded-lg object-cover" />
            </td>
            <td class="px-4 py-3 font-bold text-xl">{{ r.word }}</td>
            <td class="px-4 py-3 text-slate-500 max-w-xs truncate">{{ r.explanation }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">L{{ r.vocabLevel }}</span>
            </td>
            <td class="px-4 py-3 text-slate-400">{{ r.user.phone }}</td>
            <td class="px-4 py-3 text-slate-400">{{ fmtDate(r.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :total="total" :page="page" :limit="limit" @change="p => { page = p; loadRecords() }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/core/http'
import Pagination from '@/components/Pagination.vue'

const records = ref<any[]>([])
const total   = ref(0)
const page    = ref(1)
const limit   = 20

async function loadRecords() {
  const { data } = await http.get('/admin/photo-words', { params: { page: page.value, limit } })
  records.value = data.data
  total.value   = data.total
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN')
}

onMounted(loadRecords)
</script>
