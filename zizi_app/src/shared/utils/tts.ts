import { useSettingsStore } from '@/features/settings/store'
import http from '@/core/http'

/**
 * 上传图片到后端， 返回本地文件 URL
 * 适用于本地开发阶段，替代 OSS 直传
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post<{ url: string }>('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

/**
 * 播放音频： 优先使用 MP3 URL， 降级到浏览器 TTS
 */
export async function playAudio(url: string, fallbackText: string): Promise<void> {
  if (url) {
    const audio = new Audio(url)
    return new Promise((resolve) => {
      audio.onended = () => resolve()
      audio.onerror = () => speakWithBrowser(fallbackText).then(resolve)
      audio.play().catch(() => speakWithBrowser(fallbackText).then(resolve))
    })
  }
  return speakWithBrowser(fallbackText)
}

 }

function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'zh-CN'
    utter.rate = 0.85
    const settings = useSettingsStore()
    // 尝试匹配用户选择的音色名（浏览器 voice list 中匹配）
    if (settings.ttsVoice !== 'browser') {
      const voices = window.speechSynthesis.getVoices()
      const match  = voices.find(v => v.lang.startsWith('zh') && v.name.toLowerCase().includes(settings.ttsVoice.toLowerCase()))
      if (match) utter.voice = match
    }
    utter.onend   = () => resolve()
    utter.onerror = () => resolve()
  })
    window.speechSynthesis.speak(utter)
  }
  })
}
