<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-black text-slate-900">Zizi <span class="text-yellow-400">管理台</span></h1>
        <p class="text-sm text-slate-500 mt-1">请使用管理员账号登录</p>
      </div>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">手机号</label>
          <input
            v-model="phone"
            type="tel"
            placeholder="请输入手机号"
            class="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none text-sm transition-all"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none text-sm transition-all"
          />
        </div>
        <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="h-12 rounded-xl bg-yellow-400 text-slate-900 font-bold text-sm shadow hover:bg-yellow-300 active:scale-95 transition-all duration-200 disabled:opacity-60"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const auth     = useAuthStore()
const phone    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(phone.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    const status = e?.response?.status
    error.value = status === 401 ? '账号或密码错误' : '网络异常，请重试'
  } finally {
    loading.value = false
  }
}
</script>
