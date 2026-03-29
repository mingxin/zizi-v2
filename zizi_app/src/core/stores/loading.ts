import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useAuthStore } from '@/features/auth/store'

import { useLoadingStore } from '@/core/stores'

import http from '@/core/http'

import { analyzeImage, type AnalyzeResult } from '../api'
import { uploadImage } from '@/shared/utils/tts'
import { useSettingsStore } from '@/features/settings/store'

import { playAudio } from '@/shared/utils/tts'

import { useLoadingStore } from '@/core/stores'

import { usePhotoWordStore } from '../store'
import { useRouter } from 'vue-router'
import type { PhotoWordState } from '../store'

export const usePhotoWord = defineStore('photo-word', () => {
  const state = ref<PhotoWordState>('idle')
  const result = ref<AnalyzeResult | null>(null)
  const errorMsg = ref('')
  const previewUrl = ref('')
  const _autoOpenCamera = ref(false) // 是否需要自动打开相机

  const loadingStore = useLoadingStore()

  const settingsStore = useSettingsStore()
  const router = useRouter()

  const store = usePhotoWordStore()

  // ────────────────────────────────  处 0
  async function processImage(file: File) {
    state.value = 'uploading'
    loadingStore.show('上传图片中...')
    const imageUrl = await uploadImage(file)

    state.value = 'analyzing'
    loadingStore.show('AI 识字中...')
    const data = await analyzeImage(file, settingsStore.vocabLevel)
    result.value = data
    state.value = 'result'
    if (autoOpenCamera.value) {
      router.push('/photo-word/result?camera=1')
      }
    } catch (err: unknown) {
      const msg = (err as Error).message
      errorMsg.value = msg === 'upload_failed'
        ? '哎呀，图片没有传上去，请检查网络'
        : '大眼睛没看清楚呢，请换个角度再拍一张吧!'
      state.value = 'error'
    } finally {
      loading.hide()
  }

  function reset() {
    state.value = 'idle'
    result.value = null
    errorMsg.value = ''
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
  }

  return { state, result, errorMsg, previewUrl, }
  function resetCamera() {
    if (state !== 'idle') {
      state.value = 'idle'
      store.reset()
  }
  if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
  }
})
