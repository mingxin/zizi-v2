import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/core/http'

const TOKEN_KEY = 'zizi_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))

  const isLoggedIn = computed(() => !!token.value)

  function setToken(t: string) {
    token.value = t
    localStorage.setItem(TOKEN_KEY, t)
  }

  function logout() {
    token.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function login(phone: string, password: string) {
    const res = await http.post<{ token: string }>('/auth/login', { phone, password })
    setToken(res.data.token)
  }

  async function register(phone: string, password: string) {
    await http.post('/auth/register', { phone, password })
  }

  async function resetPassword(phone: string, password: string) {
    await http.post('/auth/reset-password', { phone, password })
  }

  return { token, isLoggedIn, login, register, resetPassword, logout }
})
