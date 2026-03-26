<template>
  <div class="flex items-center justify-between px-5 pt-5 pb-3">
    <!-- 左侧：返回按钮或占位 -->
    <div class="w-11">
      <button
        v-if="showBack"
        @click="handleBack"
        class="flex items-center justify-center size-11 bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-float transition-all duration-300 active:scale-95"
        aria-label="返回"
      >
        <span class="material-symbols-outlined text-slate-700 dark:text-slate-200 text-[22px]" style="font-variation-settings:'FILL' 0">arrow_back_ios_new</span>
      </button>
    </div>

    <!-- 中间：标题 -->
    <h1 v-if="title" class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
      {{ title }}
    </h1>
    <div v-else />

    <!-- 右侧：齿轮或占位 -->
    <div class="w-11">
      <button
        v-if="showSettings"
        @click="emit('settings')"
        class="flex items-center justify-center size-11 bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-float transition-all duration-300 active:scale-95"
        aria-label="设置"
      >
        <span class="material-symbols-outlined text-slate-700 dark:text-slate-200 text-[22px]">settings</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = withDefaults(defineProps<{
  title?: string
  showBack?: boolean
  showSettings?: boolean
}>(), {
  showBack: false,
  showSettings: false,
})

const emit = defineEmits<{
  back: []
  settings: []
}>()

const router = useRouter()

function handleBack() {
  emit('back')
  if (!props.showBack) return
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
