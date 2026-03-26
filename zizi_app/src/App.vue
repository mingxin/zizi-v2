<template>
  <GlobalLoading />
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { GlobalLoading } from '@/shared/components'
</script>
