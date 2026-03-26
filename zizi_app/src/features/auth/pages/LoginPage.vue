<template>
  <div class="relative flex flex-col min-h-dvh bg-bg-light dark:bg-bg-dark page-glow overflow-hidden">
    <!-- 顶部 Logo 区 -->
    <header class="flex flex-col items-center pt-16 pb-8 px-8">
      <div class="size-20 rounded-3xl bg-gradient-to-br from-primary to-primary-orange shadow-bubbly flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-5xl text-slate-900">auto_awesome</span>
      </div>
      <h1 class="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-wide">Zizi 识字</h1>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">让每一张照片都能说话</p>
    </header>

    <!-- 表单卡片 -->
    <main class="flex-1 flex flex-col px-6">
      <div class="bg-surface dark:bg-white/5 rounded-3xl shadow-float p-6 space-y-4">
        <!-- 手机号 -->
        <div>
          <label class="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1 block">手机号</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone_iphone</span>
            <input
              v-model="phone"
              type="tel"
              inputmode="numeric"
              maxlength="11"
              placeholder="请输入11位手机号"
              @blur="validatePhone"
              class="w-full h-14 pl-11 pr-4 rounded-[1rem] bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-slate-100 text-base font-medium placeholder:text-slate-300 border-2 transition-all duration-300 outline-none"
              :class="phoneError ? 'border-error' : 'border-transparent focus:border-primary'"
            />
          </div>
          <p v-if="phoneError" class="text-error text-xs font-medium mt-1 pl-1">{{ phoneError }}</p>
        </div>

        <!-- 密码 -->
        <div>
          <label class="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1 block">密码</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              class="w-full h-14 pl-11 pr-12 rounded-[1rem] bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-slate-100 text-base font-medium placeholder:text-slate-300 border-2 border-transparent focus:border-primary transition-all duration-300 outline-none"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 active:scale-95 transition-all duration-300"
            >
              <span class="material-symbols-outlined text-xl" :style="showPassword ? '' : 'font-variation-settings:\'FILL\' 0'">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <!-- 错误提示 -->
        <p v-if="formError" class="text-error text-sm font-medium text-center bg-error-container rounded-[1rem] py-2 px-4">{{ formError }}</p>

        <!-- 登录按钮 -->
        <PrimaryButton
          label="魔法开启"
          icon="auto_fix_high"
          type="submit"
          :disabled="loading"
          @click="handleLogin"
        />
      </div>

      <!-- 次要链接 -->
      <div class="flex flex-col items-center gap-4 pt-6">
        <router-link
          to="/register"
          class="text-primary-orange text-sm font-bold tracking-wider transition-colors duration-300 active:scale-95"
        >
          没有账号？去注册
        </router-link>
        <router-link
          to="/forgot-password"
          class="text-slate-400 text-xs font-medium transition-colors duration-300"
        >
          忘记密码了？
        </router-link>
      </div>
    </main>

    <!-- 底部装饰 -->
    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-orange/10 rounded-full blur-3xl pointer-events-none" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PrimaryButton } from '@/shared/components'
import { useAuthStore } from '../store'
import { useLoadingStore } from '@/core/stores'

const router = useRouter()
const route  = useRoute()
const auth = useAuthStore()
const loadingStore = useLoadingStore()

const phone       = ref((route.query.phone as string) ?? '')
const password    = ref('')
const showPassword = ref(false)
const phoneError  = ref('')
const formError   = ref('')
const loading     = ref(false)

function validatePhone() {
  if (!/^1\d{10}$/.test(phone.value)) {
    phoneError.value = '请输入正确的手机号'
    return false
  }
  phoneError.value = ''
  return true
}

async function handleLogin() {
  if (!validatePhone()) return
  if (!password.value) return
  formError.value = ''
  loading.value = true
  loadingStore.show()
  try {
    await auth.login(phone.value, password.value)
    router.push('/')
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 401 || status === 400) {
      formError.value = '账号或密码错误'
    } else {
      formError.value = '网络开小差了，请重试'
    }
  } finally {
    loading.value = false
    loadingStore.hide()
  }
}
</script>
