<template>
  <div class="relative flex flex-col h-dvh bg-bg-light dark:bg-bg-dark overflow-hidden">
    <AppHeader title="拍摄绘本" :show-back="true" @back="handleBack" />

    <!-- Viewfinder area -->
    <main class="flex-1 flex flex-col items-center justify-center px-6 gap-6">
      <!-- Thumbnail strip of captured pages -->
      <div v-if="store.captureCount > 0" class="w-full">
        <p class="text-sm font-bold text-slate-500 mb-2">已拍 {{ store.captureCount }} / 20 页，可继续拍摄</p>
        <div class="flex gap-2 overflow-x-auto pb-1">
          <div
            v-for="(url, i) in previewUrls"
            :key="i"
            class="shrink-0 size-16 rounded-xl overflow-hidden border-2 border-primary/30"
          >
            <img :src="url" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- Viewfinder frame -->
      <div class="relative w-full max-w-xs aspect-[3/4]">
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-primary-orange/10 blur-xl" />
        <div class="relative w-full h-full rounded-3xl border-4 border-dashed border-primary/40 flex flex-col items-center justify-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
          <div class="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
          <div class="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
          <div class="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
          <div class="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
          <span class="material-symbols-outlined text-5xl text-primary/60">menu_book</span>
          <p class="text-sm font-medium text-slate-400 text-center px-8">对准绘本页面拍摄</p>
        </div>
      </div>

      <!-- Error message -->
      <Transition name="fade">
        <p v-if="errorMsg" class="text-error text-sm font-medium text-center bg-error-container rounded-2xl py-2 px-4 w-full">{{ errorMsg }}</p>
      </Transition>
    </main>

    <!-- Bottom action bar -->
    <footer class="flex flex-col gap-3 px-6 pb-8">
      <!-- Finish button (visible when at least 1 page captured) -->
      <button
        v-if="store.captureCount > 0"
        @click="handleFinish"
        class="w-full h-14 rounded-full bg-gradient-to-r from-primary to-primary-orange shadow-bubbly flex items-center justify-center gap-2 text-slate-900 text-base font-black border-b-4 border-black/10 transition-all duration-300 active:scale-95"
      >
        <span class="material-symbols-outlined">auto_stories</span>
        <span>结束拍摄，生成故事</span>
      </button>

      <!-- Camera button -->
      <div class="flex justify-center">
        <input ref="fileInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="handleCapture" />
        <button
          @click="handleCameraClick"
          class="size-20 rounded-full bg-gradient-to-br from-primary to-primary-orange shadow-bubbly flex items-center justify-center transition-all duration-300 active:scale-90"
          :class="{ 'opacity-50': store.captureCount >= 20 }"
        >
          <span class="material-symbols-outlined text-4xl text-slate-900">photo_camera</span>
        </button>
      </div>
    </footer>

    <!-- Exit confirmation dialog -->
    <Transition name="fade">
      <div
        v-if="showExitDialog"
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6"
        @click.self="showExitDialog = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 text-center">确定要退出吗？</h3>
          <p class="text-sm text-slate-500 mt-2 text-center">已拍的 {{ store.captureCount }} 页照片将不会保存</p>
          <div class="flex gap-3 mt-6">
            <button
              @click="showExitDialog = false"
              class="flex-1 h-12 rounded-full border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all active:scale-95"
            >
              继续拍摄
            </button>
            <button
              @click="confirmExit"
              class="flex-1 h-12 rounded-full bg-red-500 text-white font-bold text-sm transition-all active:scale-95"
            >
              放弃退出
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppHeader } from '@/shared/components'
import { useBookStore } from '../store'

const MAX_PAGES = 20

const router = useRouter()
const store  = useBookStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const errorMsg     = ref('')
const localFiles   = ref<File[]>([])
const showExitDialog = ref(false)

// Local preview URLs (ObjectURL)
const previewUrls = computed(() =>
  localFiles.value.map(f => URL.createObjectURL(f))
)

function handleCameraClick() {
  if (store.captureCount >= MAX_PAGES) {
    errorMsg.value = '最多只能拍摄 20 页哦'
    return
  }
  fileInputRef.value?.click()
}

function handleCapture(e: Event) {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  input.value = ''
  if (!file) return
  errorMsg.value = ''

  if (store.captureCount >= MAX_PAGES) {
    errorMsg.value = '最多只能拍摄 20 页哦'
    return
  }

  localFiles.value.push(file)
  store.addCapture(file)
}

async function handleFinish() {
  if (store.captureCount === 0) return
  errorMsg.value = ''
  try {
    const book = await store.submitBook()
    localFiles.value = []
    router.replace(`/books/${book.id}`)
  } catch {
    errorMsg.value = '哎呀，上传失败了，请检查网络后重试'
  }
}

function handleBack() {
  if (store.captureCount === 0) {
    router.back()
    return
  }
  // Has captured pages: show exit confirmation
  showExitDialog.value = true
}

function confirmExit() {
  showExitDialog.value = false
  localFiles.value = []
  store.resetCapture()
  router.back()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
