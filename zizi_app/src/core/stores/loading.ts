import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const visible = ref(false)
  const message = ref('加载中...')
  let slowTimer: ReturnType<typeof setTimeout> | null = null

  function show(msg = '加载中...') {
    message.value = msg
    visible.value = true
    slowTimer = setTimeout(() => {
      message.value = 'AI正在努力苏醒中，请耐心等待哦~'
    }, 5000)
  }

  function hide() {
    visible.value = false
    message.value = '加载中...'
    if (slowTimer) {
      clearTimeout(slowTimer)
      slowTimer = null
    }
  }

  return { visible, message, show, hide }
})
