import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const visible = ref(false)
  const message = ref('')

  function show(msg: string) {
    message.value = msg
    visible.value = true
  }

  function hide() {
    visible.value = false
    message.value = ''
  }

  return { visible, message, show, hide }
})
