<template>
  <div class="relative flex flex-col h-dvh bg-bg-light dark:bg-bg-dark overflow-hidden">
    <!-- 顶部导航 -->
    <AppHeader :show-settings="true" @settings="showSettings = true" />

    <!-- 主体：取景框区域 -->
    <main class="flex-1 flex flex-col items-center justify-center px-6 gap-8">
      <!-- 取景框装饰 -->
      <div class="relative w-full max-w-xs aspect-square">
        <!-- 外圈光晕 -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-primary-orange/10 blur-xl" />
        <!-- 取景框 -->
        <div class="relative w-full h-full rounded-3xl border-4 border-dashed border-primary/40 flex items-center justify-center overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-sm">
          <!-- 四角装饰 -->
          <div class="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
          <div class="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
          <div class="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
          <div class="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
          <!-- 提示文字 -->
          <div class="flex flex-col items-center gap-2 text-center px-8">
            <span class="material-symbols-outlined text-5xl text-primary/60">photo_camera</span>
            <p class="text-sm font-medium text-slate-400">对准想认识的字或物品</p>
          </div>
        </div>
      </div>

      <!-- 引导文字 -->
      <div class="text-center">
        <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100">大眼睛看世界</h2>
        <p class="text-sm font-medium text-slate-500 mt-1">拍一张照片，认识新汉字</p>
      </div>
    </main>

    <!-- 错误提示 -->
    <Transition name="fade">
      <div v-if="store.state === 'error'" class="mx-6 mb-4 bg-error-container rounded-2xl p-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-error text-2xl">error</span>
        <p class="text-sm font-medium text-error flex-1">{{ store.errorMsg }}</p>
        <button @click="store.reset()" class="text-error active:scale-95 transition-all duration-300">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </Transition>

    <!-- 相机权限被拒提示 Modal -->
    <Transition name="fade">
      <div v-if="showPermissionDenied" class="fixed inset-0 z-30 flex items-end justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showPermissionDenied = false" />
        <div class="relative w-full max-w-sm bg-surface dark:bg-bg-dark rounded-3xl p-6 shadow-2xl">
          <span class="material-symbols-outlined text-4xl text-primary mb-3 block">photo_camera</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">需要相机权限</h3>
          <p class="text-sm font-medium text-slate-500 mb-4">Zizi 需要大眼睛（相机)才能看世界哦，请在手机「设置 → 浏览器/Safari → 相机」中允许拍照权限。</p>
          <button @click="showPermissionDenied = false" class="w-full h-12 rounded-full bg-primary text-slate-900 font-bold active:scale-95 transition-all duration-300">我知道了</button>
        </div>
      </div>
    </Transition>

    <!-- 底部:拍照按钮 + Tab -->
    <footer class="flex flex-col">
      <!-- 拍照主按钮 -->
      <div class="flex justify-center pb-4 px-6">
        <!-- 隐藏的文件输入 -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          @change="handleFileChange"
        />
        <button
          @click="triggerCamera"
          :disabled="store.state === 'uploading' || store.state === 'analyzing'"
          class="relative size-20 rounded-full bg-gradient-to-br from-primary to-primary-orange shadow-bubbly flex items-center justify-center transition-all duration-300 active:scale-90 disabled:opacity-50"
        >
          <div class="absolute inset-0 rounded-full bg-white/20 blur-sm" />
          <span class="material-symbols-outlined text-4xl text-slate-900 relative z-10">photo_camera</span>
        </button>
      </div>
      <BottomTab />
    </footer>

    <!-- 设置 Drawer -->
    <SettingsDrawer v-model="showSettings" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, from 'vue-router'
import { useRoute } from 'vue-router'
import { AppHeader, BottomTab } from '@/shared/components'
import SettingsDrawer from '@/features/settings/components/SettingsDrawer.vue'
import { usePhotoWordStore } from '../store'
import { useSettingsStore } from '@/features/settings/store'
import { useLoadingStore } from '@/core/stores'
import { uploadImage } from '@/shared/utils/upload'
import { analyzeImage } from '../api'
import type { AnalyzeResult } from '../api'

const router = useRouter()
const route = useRoute()
const store = usePhotoWordStore()
const settingsStore = useSettingsStore()
const loadingStore = useLoadingStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const showSettings = ref(false)
const showPermissionDenied = ref(false)
const previewUrl = ref('')

// ── 自动打开相机（从"继续玩"返回时）
onMounted(() => {
  if (route.query.camera === '1') {
    triggerCamera()
  }
})

async function triggerCamera() {
  store.reset()
  previewUrl.value = ''
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    stream.getTracks().forEach(t => t.stop())
    fileInputRef.value?.click()
  } catch {
    showPermissionDenied.value = true
  }
}

async function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  previewUrl.value = URL.createObjectURL(file)
  try {
    const imageUrl = await uploadImage(file)
    const data = await analyzeImage(file, settingsStore.vocabLevel)
    store.setResult(data)
    router.push('/photo-word/result')
  } catch (err: unknown) {
    const msg = (err as Error).message
    store.setError(msg === 'upload_failed' ? '哎呀，图片没有传上去，请检查网络' : '大眼睛没看清楚呢，请换个角度再拍一张吧!')
  }
}

