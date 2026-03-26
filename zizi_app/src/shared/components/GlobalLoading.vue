<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="loadingStore.visible"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-sm"
      >
        <!-- Spinner -->
        <div class="relative mb-6">
          <div class="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <span class="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary text-2xl">auto_awesome</span>
        </div>
        <!-- Message -->
        <p class="text-slate-700 dark:text-slate-300 text-base font-medium text-center px-8 max-w-xs">
          {{ loadingStore.message }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useLoadingStore } from '@/core/stores'

const loadingStore = useLoadingStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
