import { useSettingsStore } from '@/features/settings/store'
import http from '@/core/http'

/**
 * 上传图片到后端，返回本地文件 URL
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post<{ url: string }>('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

let currentAudio: HTMLAudioElement | null = null
let currentResolve: (() => void) | null = null

/**
 * 停止当前正在播放的音频
 */
export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  if (currentResolve) {
    currentResolve()
    currentResolve = null
  }
  window.speechSynthesis?.cancel()
}

/**
 * 播放音频：优先使用 MP3 URL，降级到浏览器 TTS
 */
export async function playAudio(url: string, fallbackText: string): Promise<void> {
  stopAudio()
  if (url) {
    const audio = new Audio(url)
    currentAudio = audio
    return new Promise((resolve) => {
      currentResolve = resolve
      audio.onended = () => { currentAudio = null; currentResolve = null; resolve() }
      audio.onerror = () => { currentAudio = null; currentResolve = null; speakWithBrowser(fallbackText).then(resolve) }
      audio.play().catch(() => { currentAudio = null; currentResolve = null; speakWithBrowser(fallbackText).then(resolve) })
    })
  }
  return speakWithBrowser(fallbackText)
}

/**
 * 试听预览：调用后端获取 DashScope 生成的音频并播放
 * 浏览器音色降级为本地 speechSynthesis
 */
export async function previewVoice(voice: string): Promise<void> {
  stopAudio()
  if (voice === 'browser') {
    const utter = new SpeechSynthesisUtterance('你好啊')
    utter.lang = 'zh-CN'
    utter.rate = 0.85
    window.speechSynthesis?.speak(utter)
    return
  }

  try {
    const { data } = await http.get<{ url: string }>(`/photo-word/voice-preview/${voice}`)
    if (!data.url) return
    const audio = new Audio(data.url)
    currentAudio = audio
    await new Promise<void>((resolve) => {
      currentResolve = resolve
      audio.onended = () => { currentAudio = null; currentResolve = null; resolve() }
      audio.onerror = () => { currentAudio = null; currentResolve = null; resolve() }
      audio.play().catch(() => { currentAudio = null; currentResolve = null; resolve() })
    })
  } catch {
    // 降级到浏览器 TTS
    const utter = new SpeechSynthesisUtterance('你好啊')
    utter.lang = 'zh-CN'
    utter.rate = 0.85
    window.speechSynthesis?.speak(utter)
  }
}

function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'zh-CN'
    utter.rate = 0.85
    utter.onend = () => resolve()
    utter.onerror = () => resolve()
    window.speechSynthesis.speak(utter)
  })
}
