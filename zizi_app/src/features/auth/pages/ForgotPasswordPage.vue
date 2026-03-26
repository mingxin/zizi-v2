<template>
  <div class="relative flex flex-col min-h-dvh bg-bg-light dark:bg-bg-dark page-glow overflow-hidden">
    <AppHeader title="找回密码" :show-back="true" @back="router.push('/login')" />

    <main class="flex-1 flex flex-col px-6 pt-4">
      <div class="bg-surface dark:bg-white/5 rounded-3xl shadow-float p-6 space-y-4">
        <div>
          <label class="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1 block">手机号</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone_iphone</span>
            <input
              v-model="phone"
              type="tel" inputmode="numeric" maxlength="11"
              placeholder="请输入注册手机号"
              @blur="validatePhone"
              class="w-full h-14 pl-11 pr-4 rounded-[1rem] bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-slate-100 text-base font-medium placeholder:text-slate-300 border-2 transition-all duration-300 outline-none"
              :class="phoneError ? 'border-error' : 'border-transparent focus:border-primary'"
            />
          </div>
          <p v-if="phoneError" class="text-error text-xs font-medium mt-1 pl-1">{{ phoneError }}</p>
        </div>

        <div>
          <label class="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1 block">新密码</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
            <input
              v-model="password"
              :type="showPwd ? 'text' : 'password'"
              placeholder="请设置新密码"
              class="w-full h-14 pl-11 pr-12 rounded-[1rem] bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-slate-100 text-base font-medium placeholder:text-slate-300 border-2 border-transparent focus:border-primary transition-all duration-300 outline-none"
            />
            <button type="button" @click="showPwd = !showPwd" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 active:scale-95 transition-all duration-300">
              <span class="material-symbols-outlined text-xl" :style="showPwd ? '' : 'font-variation-settings:\'FILL\' 0'">{{ showPwd ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1 block">确认新密码</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_reset</span>
            <input
              v-model="confirmPassword"
              :type="showPwd ? 'text' : 'password'"
              placeholder="请再次输入新密码"
              class="w-full h-14 pl-11 pr-4 rounded-[1rem] bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-slate-100 text-base font-medium placeholder:text-slate-300 border-2 transition-all duration-300 outline-none"
              :class="confirmError ? 'border-error' : 'border-transparent focus:border-primary'"
            />
          </div>
          <p v-if="confirmError" class="text-error text-xs font-medium mt-1 pl-1">{{ confirmError }}</p>
        </div>

        <p v-if="formError" class="text-error text-sm font-medium text-center bg-error-container rounded-[1rem] py-2 px-4">{{ formError }}</p>

        <PrimaryButton label="重置密码" icon="key" :disabled="loading" @click="handleReset" />
      </div>
    </main>

    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-orange/10 rounded-full blur-3xl pointer-events-none" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppHeader, PrimaryButton } from '@/shared/components'
import { useAuthStore } from '../store'
import { useLoadingStore } from '@/core/stores'

const router = useRouter()
const auth = useAuthStore()
const loadingStore = useLoadingStore()

const phone           = ref('')
const password        = ref('')
const confirmPassword = ref('')
const showPwd         = ref(false)
const phoneError      = ref('')
const confirmError    = ref('')
const formError       = ref('')
const loading         = ref(false)

function validatePhone() {
  if (!/^1\d{10}$/.test(phone.value)) {
    phoneError.value = '请输入正确的手机号'
    return false
  }
  phoneError.value = ''
  return true
}

async function handleReset() {
  if (!validatePhone()) return
  confirmError.value = ''
  formError.value = ''
  if (password.value !== confirmPassword.value) {
    confirmError.value = '两次密码不一致'
    return
  }
  loading.value = true
  loadingStore.show()
  try {
    await auth.resetPassword(phone.value, password.value)
    router.push({ path: '/login', query: { phone: phone.value } })
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    formError.value = status === 404
      ? '该手机号未注册'
      : '网络开小差了，请重试'
  } finally {
    loading.value = false
    loadingStore.hide()
  }
}
</script>
