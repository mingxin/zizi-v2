<template>
  <div class="relative flex flex-col h-full overflow-hidden">
    <!-- 主体：取景框区域 -->
    <main class="flex-1 flex flex-col items-center justify-center px-6">
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

          <!-- 默认：可爱眼睛 + 提示文字 -->
          <div v-if="store.state === 'idle'" class="flex flex-col items-center gap-3 text-center px-8">
            <div class="cute-eye">
              <div class="cute-eye__sclera">
                <div class="cute-eye__iris">
                  <div class="cute-eye__pupil" />
                  <div class="cute-eye__shine" />
                </div>
              </div>
            </div>
            <p class="text-sm font-medium text-slate-400">拍一张照片，认识新汉字</p>
          </div>

          <!-- 上传/分析中：状态提示 -->
          <div v-else-if="store.state === 'uploading' || store.state === 'analyzing'" class="flex flex-col items-center gap-4 text-center px-8">
            <div class="relative size-20">
              <div class="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="material-symbols-outlined text-3xl text-primary">
                  {{ store.state === 'uploading' ? 'cloud_upload' : 'auto_awesome' }}
                </span>
              </div>
            </div>
            <div>
              <p class="text-base font-bold text-slate-700 dark:text-slate-200">
                {{ store.state === 'uploading' ? '正在上传图片...' : 'AI 正在识别中...' }}
              </p>
              <p v-if="store.state === 'analyzing'" class="text-xs text-slate-400 mt-1">请稍等，大眼睛在看呢</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 引导文字 -->
      <div class="text-center py-8">
        <p class="text-sm font-medium text-slate-500"></p>
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

    <!-- 浮动拍照按钮 -->
    <div class="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none pb-6">
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
        class="pointer-events-auto relative size-20 rounded-full bg-gradient-to-br from-primary to-primary-orange shadow-bubbly flex items-center justify-center transition-all duration-300 active:scale-90 disabled:opacity-50"
      >
        <div class="absolute inset-0 rounded-full bg-white/20 blur-sm" />
        <span class="material-symbols-outlined text-4xl text-slate-900 relative z-10">photo_camera</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePhotoWord } from '../store'

const router = useRouter()
const route = useRoute()
const store = usePhotoWord()

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')

onMounted(() => {
  if (route.query.camera === '1') {
    triggerCamera()
  }
})

function triggerCamera() {
  store.reset()
  previewUrl.value = ''
  fileInputRef.value?.click()
}

async function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  await store.processImage(file)
  if (store.state === 'result') {
    router.push('/photo-word/result')
  }
}
</script>

<style scoped>
.cute-eye {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cute-eye__sclera {
  width: 64px;
  height: 48px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 6px rgb(0 0 0 / 0.08);
  position: relative;
  overflow: hidden;
}

.cute-eye__iris {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #eecd2b 0%, #d4a912 50%, #8B6914 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cute-eye__pupil {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 45% 45%, #1e1e1e 0%, #3a3a3a 100%);
}

.cute-eye__shine {
  position: absolute;
  top: 5px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

.cute-eye__sclera::before,
.cute-eye__sclera::after {
  content: '';
  position: absolute;
  top: 0;
  width: 3px;
  height: 100%;
  background: #eee;
}

.cute-eye__sclera::before {
  left: 0;
  border-radius: 50% 0 0 50%;
}

.cute-eye__sclera::after {
  right: 0;
  border-radius: 0 50% 50% 0;
}
</style>
