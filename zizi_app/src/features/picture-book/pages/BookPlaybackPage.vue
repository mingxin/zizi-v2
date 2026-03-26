<template>
  <div class="relative flex flex-col h-dvh bg-bg-light dark:bg-bg-dark overflow-hidden">
    <!-- Header -->
    <AppHeader
      :title="book?.title ?? ''"
      :show-back="true"
      @back="router.push('/books')"
    />

    <!-- 3D Swiper 区域 -->
    <main
      ref="swiperRef"
      class="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory hide-scrollbar px-[10vw] gap-6"
      @scroll="handleScroll"
      @touchstart="handleTouchStart"
    >
      <div
        v-for="(page, idx) in pages"
        :key="page.id"
        class="shrink-0 snap-center transition-all duration-300"
        :class="idx === currentIndex
          ? 'w-[80vw] max-w-[400px] h-[65vh] scale-110 opacity-100'
          : 'w-64 h-[55vh] scale-90 opacity-40 blur-[2px]'"
      >
        <div class="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 relative">
          <img :src="page.imageUrl" class="w-full h-full object-cover" :alt="`第${page.pageNum}页`" />
          <!-- 故事文字叠层（当前页显示） -->
          <Transition name="story">
            <div
              v-if="idx === currentIndex && page.story"
              class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5"
            >
              <p class="text-white text-sm font-medium leading-relaxed">{{ page.story }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </main>

    <!-- Footer：页码指示 + 连播控制 -->
    <footer class="flex flex-col items-center gap-4 pb-8 pt-4">
      <!-- 页码点 -->
      <div class="flex items-center gap-2">
        <div
          v-for="(_, idx) in pages"
          :key="idx"
          class="rounded-full transition-all duration-300"
          :class="idx === currentIndex
            ? 'size-4 bg-primary shadow-[0_0_10px_rgba(238,205,43,0.8)] ring-2 ring-white'
            : 'size-2 bg-primary/30'"
        />
      </div>

      <!-- 控制按钮行 -->
      <div class="flex items-center gap-4">
        <!-- NFC 复制链接 -->
        <button
          @click="copyNfcUrl"
          class="size-12 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm shadow-float flex items-center justify-center transition-all duration-300 active:scale-95"
          :title="nfcCopied ? '已复制！' : '复制 NFC 链接'"
        >
          <span class="material-symbols-outlined text-xl" :class="nfcCopied ? 'text-primary' : 'text-slate-600 dark:text-slate-300'">
            {{ nfcCopied ? 'check_circle' : 'nfc' }}
          </span>
        </button>

        <!-- 暂停/连播按钮 -->
        <button
          @click="toggleAutoplay"
          class="size-14 rounded-full flex items-center justify-center shadow-xl border border-white/40 transition-all duration-300 active:scale-95"
          :class="autoplay ? 'bg-primary text-slate-900' : 'bg-white/70 dark:bg-white/10 backdrop-blur-sm text-slate-800 dark:text-slate-200'"
        >
          <span class="material-symbols-outlined text-3xl">{{ autoplay ? 'pause' : 'play_arrow' }}</span>
        </button>

        <!-- 占位（对称用） -->
        <div class="size-12" />
      </div>
    </footer>

    <!-- 背景光晕 -->
    <div class="absolute inset-0 -z-10 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px]" />
      <div class="absolute bottom-[-10%] left-[-10%] w-1/2 h-1/2 bg-blue-200/20 rounded-full blur-[100px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AppHeader } from '@/shared/components'
import { useBookStore } from '../store'
import { getBookNfcUrl } from '../api'
import { playAudio } from '@/shared/utils/tts'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route  = useRoute()
const store  = useBookStore()
const { currentBook: book } = storeToRefs(store)

const swiperRef    = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const autoplay     = ref(false)
const nfcCopied    = ref(false)
const isPlaying    = ref(false)

const pages = computed(() => book.value?.pages ?? [])

// ── 加载数据 ────────────────────────────────────────────────
onMounted(async () => {
  const id = Number(route.params.id)
  await store.loadBook(id)

  // NFC autoplay=1 参数：自动启动连播
  if (route.query.autoplay === '1') {
    autoplay.value = true
    playCurrentPage()
  }
})

// ── 滚动防抖（0.5s 后播放当前页）────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleScroll() {
  if (debounceTimer) clearTimeout(debounceTimer)
  // 更新 currentIndex
  const el = swiperRef.value
  if (el) {
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    if (idx !== currentIndex.value) {
      currentIndex.value = idx
      stopCurrentAudio()
    }
  }
  debounceTimer = setTimeout(() => playCurrentPage(), 500)
}

// ── 用户触摸时退出自动连播 ───────────────────────────────────
function handleTouchStart() {
  if (autoplay.value) {
    autoplay.value = false
    stopCurrentAudio()
  }
}

// ── 音频控制 ─────────────────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  window.speechSynthesis?.cancel()
  isPlaying.value = false
}

async function playCurrentPage() {
  if (pages.value.length === 0 || isPlaying.value) return
  const page = pages.value[currentIndex.value]
  if (!page) return

  isPlaying.value = true
  try {
    if (page.audioUrl) {
      currentAudio = new Audio(page.audioUrl)
      await new Promise<void>((resolve) => {
        currentAudio!.onended = () => resolve()
        currentAudio!.onerror = () => resolve()
        currentAudio!.play().catch(() => resolve())
      })
    } else {
      await playAudio('', page.story)
    }
  } finally {
    isPlaying.value = false
    currentAudio = null
    // 自动连播：播完自动翻下一页
    if (autoplay.value) advanceAutoplay()
  }
}

function advanceAutoplay() {
  if (!autoplay.value) return
  const next = currentIndex.value + 1
  if (next >= pages.value.length) {
    autoplay.value = false
    return
  }
  // 滚动到下一页
  const el = swiperRef.value
  if (el) {
    el.scrollTo({ left: next * el.offsetWidth, behavior: 'smooth' })
    currentIndex.value = next
  }
  setTimeout(() => playCurrentPage(), 500)
}

function toggleAutoplay() {
  autoplay.value = !autoplay.value
  if (autoplay.value) {
    playCurrentPage()
  } else {
    stopCurrentAudio()
  }
}

// ── NFC URL 复制 ─────────────────────────────────────────────
async function copyNfcUrl() {
  if (!book.value) return
  const url = getBookNfcUrl(book.value.id)
  await navigator.clipboard.writeText(url)
  nfcCopied.value = true
  setTimeout(() => { nfcCopied.value = false }, 2000)
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  stopCurrentAudio()
})
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.story-enter-active, .story-leave-active { transition: opacity 0.3s ease; }
.story-enter-from, .story-leave-to { opacity: 0; }
</style>
