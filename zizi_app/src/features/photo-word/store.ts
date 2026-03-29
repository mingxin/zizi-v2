import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useLoadingStore } from '@/core/stores'
import { analyzeImage, type AnalyzeResult } from './api'
import { uploadImage } from '@/shared/utils/tts'
import { useSettingsStore } from '@/features/settings/store'

export type PhotoWordState = 'idle' | 'uploading' | 'analyzing' | 'result' | 'error'

const SESSION_KEY = 'zizi_photo_word_result'

export const usePhotoWord = defineStore('photo-word', () => {
  const state       = ref<PhotoWordState>('idle')
  const result      = ref<AnalyzeResult | null>(null)
  const errorMsg    = ref('')
  const previewUrl  = ref('')

  // 从 sessionStorage 恢复结果（防止黑屏后丢失）
  function restoreFromSession() {
    if (result.value) return
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        result.value = JSON.parse(saved) as AnalyzeResult
        state.value = 'result'
      }
    } catch { /* ignore */ }
  }

  async function processImage(file: File) {
    const settings = useSettingsStore()
    const loading  = useLoadingStore()
    errorMsg.value = ''
    result.value = null
    sessionStorage.removeItem(SESSION_KEY)

    state.value = 'uploading'

    try {
      // Step 1: 上传图片到后端
      const imageUrl = await uploadImage(file)
      state.value = 'analyzing'
      // Step 2: AI 识字分析
      const data = await analyzeImage(file, settings.vocabLevel)
      result.value = data
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
      state.value = 'result'
    } catch (err: unknown) {
      const msg = (err as Error).message
      errorMsg.value = msg === 'upload_failed'
        ? '哎呀，图片没有传上去，请检查网络'
        : '大眼睛没看清楚呢，请换个角度再拍一张吧！'

      state.value = 'error'
    } finally {
      loading.hide()
    }
  }

  function reset() {
    state.value = 'idle'
    result.value = null
    errorMsg.value = ''
    sessionStorage.removeItem(SESSION_KEY)
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
  }

  return { state, result, errorMsg, previewUrl, processImage, reset, restoreFromSession }
})
