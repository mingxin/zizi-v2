import { defineStore } from 'pinia'
import { ref } from 'vue'
import { uploadToOss } from '@/shared/utils/oss'
import { analyzeImage, type AnalyzeResult } from './api'
import { useSettingsStore } from '@/features/settings/store'
import { useLoadingStore } from '@/core/stores'

export type PhotoWordState = 'idle' | 'uploading' | 'analyzing' | 'result' | 'error'

export const usePhotoWordStore = defineStore('photo-word', () => {
  const state       = ref<PhotoWordState>('idle')
  const result      = ref<AnalyzeResult | null>(null)
  const errorMsg    = ref('')
  const previewUrl  = ref('')  // 本地预览 ObjectURL

  async function processImage(file: File) {
    const settings = useSettingsStore()
    const loading  = useLoadingStore()
    errorMsg.value = ''
    result.value   = null

    try {
      // Step 1: 上传 OSS
      state.value = 'uploading'
      loading.show('上传图片中...')
      previewUrl.value = URL.createObjectURL(file)

      let imageUrl: string
      let uploadAttempt = 0
      while (true) {
        try {
          imageUrl = await uploadToOss(file)
          break
        } catch {
          uploadAttempt++
          if (uploadAttempt >= 2) throw new Error('upload_failed')
        }
      }

      // Step 2: AI 识字分析
      state.value = 'analyzing'
      loading.show('AI 识字中...')
      const data = await analyzeImage(imageUrl!, settings.vocabLevel)
      result.value = data
      state.value  = 'result'
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
    state.value  = 'idle'
    result.value = null
    errorMsg.value = ''
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
  }

  return { state, result, errorMsg, previewUrl, processImage, reset }
})
