<template>
  <div class="relative flex flex-col h-dvh bg-bg-light dark:bg-bg-dark overflow-hidden">
    <AppHeader title="拍摄绘本" :show-back="true" @back="handleBack" />

    <!-- 取景区域 -->
    <main class="flex-1 flex flex-col items-center justify-center px-6 gap-6">
      <!-- 已拍页面缩略图 -->
      <div v-if="store.captureCount > 0" class="w-full">
        <p class="text-sm font-bold text-slate-500 mb-2">已拍 {{ store.captureCount }} 页，可继续拍摄</p>
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

      <!-- 取景框 -->
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

      <!-- 错误提示 -->
      <Transition name="fade">
        <p v-if="errorMsg" class="text-error text-sm font-medium text-center bg-error-container rounded-2xl py-2 px-4 w-full">{{ errorMsg }}</p>
      </Transition>
    </main>

    <!-- 底部操作栏 -->
    <footer class="flex flex-col gap-3 px-6 pb-8">
      <!-- 结束拍摄按钮（已拍至少1页时显示） -->
      <button
        v-if="store.captureCount > 0"
        @click="handleFinish"
        class="w-full h-14 rounded-full bg-gradient-to-r from-primary to-primary-orange shadow-bubbly flex items-center justify-center gap-2 text-slate-900 text-base font-black border-b-4 border-black/10 transition-all duration-300 active:scale-95"
      >
        <span class="material-symbols-outlined">auto_stories</span>
        <span>结束拍摄，生成故事</span>
      </button>

      <!-- 拍照按钮 -->
      <div class="flex justify-center">
        <input ref="fileInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="handleCapture" />
        <button
          @click="fileInputRef?.click()"
          class="size-20 rounded-full bg-gradient-to-br from-primary to-primary-orange shadow-bubbly flex items-center justify-center transition-all duration-300 active:scale-90"
        >
          <span class="material-symbols-outlined text-4xl text-slate-900">photo_camera</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppHeader } from '@/shared/components'
import { useBookStore } from '../store'

const router = useRouter()
const store  = useBookStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const errorMsg     = ref('')
const localFiles   = ref<File[]>([])

// 本地预览 URL（ObjectURL）
const previewUrls = computed(() =>
  localFiles.value.map(f => URL.createObjectURL(f))
)

function handleCapture(e: Event) {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  input.value = ''
  if (!file) return
  errorMsg.value = ''
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
  // 有已拍页面时直接返回，保留 store 状态
  router.back()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
