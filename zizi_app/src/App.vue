<template>
  <GlobalLoading />
  <div class="flex flex-col h-dvh bg-bg-light dark:bg-bg-dark overflow-hidden">
    <!-- 全局 Header -->
    <AppHeader
      v-if="showHeader"
      :title="headerTitle"
      :show-back="headerBack"
      :show-settings="headerSettings"
      @back="handleHeaderBack"
      @settings="showSettingsDrawer = true"
    >
      <template v-if="headerSlot" #title>
        <slot name="header-content" />
      </template>
    </AppHeader>

    <!-- 内容区 -->
    <main class="flex-1 overflow-hidden">
      <RouterView />
    </main>

    <!-- 全局 BottomTab -->
    <BottomTab v-if="showTab" />
  </div>

  <!-- 全局 Settings Drawer -->
  <SettingsDrawer v-model="showSettingsDrawer" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { AppHeader, BottomTab, GlobalLoading } from '@/shared/components'
import SettingsDrawer from '@/features/settings/components/SettingsDrawer.vue'

const route = useRoute()
const router = useRouter()
const showSettingsDrawer = ref(false)

// 从 route meta 读取 layout 配置
const showHeader = computed(() => route.meta.showHeader !== false)
const showTab = computed(() => route.meta.showTab === true)
const headerTitle = computed(() => (route.meta.title as string) || '')
const headerBack = computed(() => route.meta.showBack === true)
const headerSettings = computed(() => route.meta.showSettings === true)
const headerSlot = computed(() => route.meta.headerSlot === true)

function handleHeaderBack() {
  // 子页面可以 emit，这里默认 back
  router.back()
}
</script>
