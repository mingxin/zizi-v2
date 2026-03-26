<template>
  <div class="p-8">
    <h2 class="text-xl font-black text-slate-900 mb-6">绘本管理</h2>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="book in books"
        :key="book.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div class="aspect-[3/4] relative">
          <img :src="book.coverUrl" :alt="book.title" class="w-full h-full object-cover" />
          <button
            @click="deleteBook(book)"
            class="absolute top-2 right-2 size-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-all"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div class="p-3">
          <p class="text-sm font-bold text-slate-800 truncate">{{ book.title }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ book.user.phone }} · {{ book._count.pages }}页</p>
          <p class="text-xs text-slate-400">{{ fmtDate(book.createdAt) }}</p>
        </div>
      </div>
    </div>
    <Pagination :total="total" :page="page" :limit="limit" @change="p => { page = p; loadBooks() }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/core/http'
import Pagination from '@/components/Pagination.vue'

const books = ref<any[]>([])
const total = ref(0)
const page  = ref(1)
const limit = 20

async function loadBooks() {
  const { data } = await http.get('/admin/books', { params: { page: page.value, limit } })
  books.value = data.data
  total.value = data.total
}

async function deleteBook(book: any) {
  if (!confirm(`确认删除《${book.title}》？`)) return
  await http.delete(`/admin/books/${book.id}`)
  books.value = books.value.filter(b => b.id !== book.id)
  total.value--
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN')
}

onMounted(loadBooks)
</script>
