import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/core/http'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('zizi_admin_token') ?? '')

  async function login(phone: string, password: string) {
    const { data } = await http.post<{ token: string }>('/auth/login', { phone, password })
    token.value = data.token
    localStorage.setItem('zizi_admin_token', data.token)
  }

  function logout() {
    token.value = ''
    localStorage.removeItem('zizi_admin_token')
  }

  return { token, login, logout }
})
