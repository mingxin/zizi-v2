import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type VocabLevel = 1 | 2 | 3 | 4
export type TtsVoice = 'Serena' | 'Maia' | 'Rocky' | 'Kiki' | 'browser'

const KEYS = {
  vocabLevel:   'zizi_vocab_level',
  ttsVoice:     'zizi_tts_voice',
  customLlmKey: 'zizi_custom_llm_key',
  customTtsKey: 'zizi_custom_tts_key',
}

export const useSettingsStore = defineStore('settings', () => {
  const vocabLevel   = ref<VocabLevel>((Number(localStorage.getItem(KEYS.vocabLevel)) || 1) as VocabLevel)
  const ttsVoice     = ref<TtsVoice>((localStorage.getItem(KEYS.ttsVoice) as TtsVoice) || 'Serena')
  const customLlmKey = ref<string>(localStorage.getItem(KEYS.customLlmKey) || '')
  const customTtsKey = ref<string>(localStorage.getItem(KEYS.customTtsKey) || '')

  // 自动同步到 localStorage（Axios 拦截器直接读 localStorage，无需额外操作）
  watch(vocabLevel,   (v) => localStorage.setItem(KEYS.vocabLevel,   String(v)))
  watch(ttsVoice,     (v) => localStorage.setItem(KEYS.ttsVoice,     v))
  watch(customLlmKey, (v) => v ? localStorage.setItem(KEYS.customLlmKey, v) : localStorage.removeItem(KEYS.customLlmKey))
  watch(customTtsKey, (v) => v ? localStorage.setItem(KEYS.customTtsKey, v) : localStorage.removeItem(KEYS.customTtsKey))

  function save(payload: {
    vocabLevel:   VocabLevel
    ttsVoice:     TtsVoice
    customLlmKey: string
    customTtsKey: string
  }) {
    vocabLevel.value   = payload.vocabLevel
    ttsVoice.value     = payload.ttsVoice
    customLlmKey.value = payload.customLlmKey
    customTtsKey.value = payload.customTtsKey
  }

  return { vocabLevel, ttsVoice, customLlmKey, customTtsKey, save }
})
