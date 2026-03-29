<template>
  <div class="relative flex flex-col h-dvh bg-bg-light dark:bg-bg-dark overflow-hidden">
    <AppHeader title="我的绘本" :show-settings="true" @settings="showSettings = true" />

    <!-- Has books -->
    <main v-if="books.length > 0" class="flex-1 overflow-y-auto px-4 pt-2 pb-4">
      <div class="grid grid-cols-2 gap-4">
        <!-- Add new book card -->
        <button
          @click="router.push('/books/capture')"
          class="aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-2 bg-primary/5 transition-all duration-300 active:scale-95"
        >
          <div class="size-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-2xl">add</span>
          </div>
          <span class="text-sm font-bold text-slate-500">添加绘本</span>
        </button>

        <!-- Book card list -->
        <button
          v-for="book in books"
          :key="book.id"
          @click="router.push(`/books/${book.id}`)"
          class="aspect-[3/4] rounded-2xl overflow-hidden shadow-float relative transition-all duration-300 active:scale-95"
        >
          <img
            :src="book.coverUrl"
            :alt="book.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p class="text-white text-sm font-bold leading-tight">{{ book.title }}</p>
            <p class="text-white/60 text-xs mt-0.5">{{ book.pageCount }} 页</p>
          </div>
        </button>
      </div>
    </main>

    <!-- Empty state -->
    <main v-else class="flex-1 flex flex-col items-center justify-center px-8 gap-6">
      <div class="relative">
        <div class="size-32 rounded-3xl bg-primary/10 flex items-center justify-center">
          <span class="material-symbols-outlined text-6xl text-primary/60">menu_book</span>
        </div>
        <span class="material-symbols-outlined absolute -top-2 -right-2 text-primary text-2xl">auto_awesome</span>
      </div>
      <div class="text-center">
        <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100">还没有绘本</h2>
        <p class="text-sm font-medium text-slate-500 mt-2 leading-relaxed">拍下家里的绘本，让 AI 给宝宝讲故事！</p>
      </div>
      <button
        @click="router.push('/books/capture')"
        class="relative flex items-center justify-center gap-3 py-5 px-8 bg-gradient-to-r from-primary to-primary-orange rounded-full text-slate-900 font-bold text-lg shadow-bubbly transition-all duration-300 active:scale-95"
      >
        <span class="material-symbols-outlined text-2xl">photo_camera</span>
        <span>去拍摄一本吧</span>
      </button>
    </main>

    <!-- Background decorations -->
    <div class="fixed pointer-events-none inset-0 z-[-1] overflow-hidden">
      <span class="material-symbols-outlined absolute top-1/4 left-[5%] text-slate-200 dark:text-slate-800 text-4xl">favorite</span>
      <span class="material-symbols-outlined absolute bottom-1/4 right-[8%] text-slate-200 dark:text-slate-800 text-6xl">draw</span>
      <span class="material-symbols-outlined absolute top-[60%] left-[10%] text-slate-200 dark:text-slate-800 text-3xl">pets</span>
    </div>

    <BottomTab />
    <SettingsDrawer v-model="showSettings" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AppHeader, BottomTab } from '@/shared/components'
import SettingsDrawer from '@/features/settings/components/SettingsDrawer.vue'
import { useBookStore } from '../store'
import { storeToRefs } from 'pinia'

const router       = useRouter()
const bookStore    = useBookStore()
const { books }    = storeToRefs(bookStore)
const showSettings = ref(false)

onMounted(() => bookStore.loadBooks())
</script>
