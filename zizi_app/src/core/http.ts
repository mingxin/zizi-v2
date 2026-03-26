import axios from 'axios'
import { useAuthStore } from '@/features/auth/store'

const http = axios.create({
  // VITE_API_BASE_URL is set during build time via GitHub Actions
  // API URL: https://zizi-api.onrender.com/api
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：注入 Token + 用户自定义 API Key
http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  // API 双轨制：从 localStorage 读取用户自定义 Key
  const customLlmKey = localStorage.getItem('zizi_custom_llm_key')
  const customTtsKey = localStorage.getItem('zizi_custom_tts_key')
  const ttsVoice    = localStorage.getItem('zizi_tts_voice')
  if (customLlmKey) config.headers['X-Custom-LLM-Key'] = customLlmKey
  if (customTtsKey) config.headers['X-Custom-TTS-Key'] = customTtsKey
  if (ttsVoice)    config.headers['X-TTS-Voice']       = ttsVoice
  return config
})

// 响应拦截器：401 自动跳转登录
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default http
