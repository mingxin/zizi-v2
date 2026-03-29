import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from './store'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('SettingsStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('应使用默认值初始化', () => {
    const settings = useSettingsStore()

    expect(settings.vocabLevel).toBe(1)
    expect(settings.ttsVoice).toBe('Serena')
    expect(settings.customLlmKey).toBe('')
    expect(settings.customTtsKey).toBe('')
  })

  it('应从 localStorage 读取已保存的设置', () => {
    localStorageMock.getItem
      .mockReturnValueOnce('3')            // vocabLevel
      .mockReturnValueOnce('Kiki')          // ttsVoice
      .mockReturnValueOnce('my-llm-key')   // customLlmKey
      .mockReturnValueOnce('my-tts-key')   // customTtsKey

    setActivePinia(createPinia())
    const settings = useSettingsStore()

    expect(settings.vocabLevel).toBe(3)
    expect(settings.ttsVoice).toBe('Kiki')
    expect(settings.customLlmKey).toBe('my-llm-key')
    expect(settings.customTtsKey).toBe('my-tts-key')
  })

  it('save() 应更新所有设置', () => {
    const settings = useSettingsStore()

    settings.save({
      vocabLevel: 4,
      ttsVoice: 'Rocky',
      customLlmKey: 'new-key',
      customTtsKey: 'new-tts',
    })

    expect(settings.vocabLevel).toBe(4)
    expect(settings.ttsVoice).toBe('Rocky')
    expect(settings.customLlmKey).toBe('new-key')
    expect(settings.customTtsKey).toBe('new-tts')
  })

  it('设置变化时应自动同步到 localStorage', () => {
    const settings = useSettingsStore()

    settings.vocabLevel = 2

    expect(localStorageMock.setItem).toHaveBeenCalledWith('zizi_vocab_level', '2')
  })

  it('清空自定义 Key 时应从 localStorage 删除', () => {
    const settings = useSettingsStore()
    settings.customLlmKey = 'some-key'

    settings.customLlmKey = ''

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('zizi_custom_llm_key')
  })
})
