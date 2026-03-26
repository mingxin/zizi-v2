<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'relative w-full h-16 rounded-full',
      'bg-gradient-to-r from-primary to-primary-orange',
      'shadow-bubbly',
      'flex items-center justify-center gap-3',
      'text-slate-900 text-xl font-black',
      'border-b-4 border-black/10',
      'transition-all duration-300 active:scale-95',
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-bubbly',
    ]"
  >
    <span v-if="icon" class="material-symbols-outlined text-2xl">{{ icon }}</span>
    <span>{{ label }}</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  icon?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  type: 'button',
  disabled: false,
})
</script>
