<template>
  <div class="relative flex flex-col h-dvh bg-bg-light dark:bg-bg-dark overflow-hidden">
    <!-- Header with editable title -->
    <AppHeader
      :title="book?.title ?? ''"
      :show-back="true"
      @back="router.push('/books')"
    >
      <template #title>
        <div v-if="editingTitle" class="flex items-center gap-2 flex-1 min-w-0">
          <input
            ref="titleInputRef"
            v-model="draftTitle"
            class="flex-1 min-w-0 h-10 px-3 rounded-xl bg-white/80 dark:bg-white/10 border-2 border-primary text-sm font-bold text-slate-900 dark:text-slate-100 outline-none"
            maxlength="100"
            @keydown.enter="saveTitle"
            @keydown.escape="cancelEditTitle"
            @blur="saveTitle"
          />
        </div>
        <div v-else class="flex items-center gap-1 cursor-pointer" @click="startEditTitle">
          <span class="text-base font-bold truncate max-w-[50vw]">{{ book?.title ?? '' }}</span>
          <span class="material-symbols-outlined text-base text-slate-400">edit</span>
        </div>
      </template>
    </AppHeader>

    <!-- 3D Swiper area -->
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
          <!-- Story text overlay (current page only) -->
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

    <!-- Footer: page indicators + playback controls -->
    <footer class="flex flex-col items-center gap-4 pb-8 pt-4">
      <!-- Page dots -->
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

      <!-- Control buttons row -->
      <div class="flex items-center gap-4">
        <!-- NFC copy link -->
        <button
          @click="copyNfcUrl"
          class="size-12 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm shadow-float flex items-center justify-center transition-all duration-300 active:scale-95"
          :title="nfcCopied ? '已复制！' : '复制 NFC 链接'"
        >
          <span class="material-symbols-outlined text-xl" :class="nfcCopied ? 'text-primary' : 'text-slate-600 dark:text-slate-300'">
            {{ nfcCopied ? 'check_circle' : 'nfc' }}
          </span>
        </button>

        <!-- Play/Pause button -->
        <button
          @click="toggleAutoplay"
          class="size-14 rounded-full flex items-center justify-center shadow-xl border border-white/40 transition-all duration-300 active:scale-95"
          :class="autoplay ? 'bg-primary text-slate-900' : 'bg-white/70 dark:bg-white/10 backdrop-blur-sm text-slate-800 dark:text-slate-200'"
        >
          <span class="material-symbols-outlined text-3xl">{{ autoplay ? 'pause' : 'play_arrow' }}</span>
        </button>

        <!-- Spacer for symmetry -->
        <div class="size-12" />
      </div>
    </footer>

    <!-- Background glow -->
    <div class="absolute inset-0 -z-10 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px]" />
      <div class="absolute bottom-[-10%] left-[-10%] w-1/2 h-1/2 bg-blue-200/20 rounded-full blur-[100px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
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

// ── Title editing state ─────────────────────────────────────
const editingTitle   = ref(false)
const draftTitle     = ref('')
const titleInputRef  = ref<HTMLInputElement | null>(null)
const savingTitle    = ref(false)

function startEditTitle() {
  if (!book.value) return
  draftTitle.value = book.value.title
  editingTitle.value = true
  nextTick(() => {
    titleInputRef.value?.focus()
    titleInputRef.value?.select()
  })
}

async function saveTitle() {
  if (!editingTitle.value) return
  const newTitle = draftTitle.value.trim()
  if (!newTitle || !book.value) {
    cancelEditTitle()
    return
  }
  // No change
  if (newTitle === book.value.title) {
    editingTitle.value = false
    return
  }
  if (savingTitle.value) return
  savingTitle.value = true
  try {
    await store.editBookTitle(book.value.id, newTitle)
  } catch {
    // Silently fail, keep original title
  } finally {
    savingTitle.value = false
    editingTitle.value = false
  }
}

function cancelEditTitle() {
  editingTitle.value = false
}

const pages = computed(() => book.value?.pages ?? [])

// ── Load data ────────────────────────────────────────────────
onMounted(async () => {
  const id = Number(route.params.id)
  await store.loadBook(id)

  // NFC autoplay=1 param: auto-start playback
  if (route.query.autoplay === '1') {
    autoplay.value = true
    playCurrentPage()
  }
})

// ── Scroll debounce (play current page after 0.5s) ──────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleScroll() {
  if (debounceTimer) clearTimeout(debounceTimer)
  // Update currentIndex
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

// ── Exit autoplay on user touch ──────────────────────────────
function handleTouchStart() {
  if (autoplay.value) {
    autoplay.value = false
    stopCurrentAudio()
  }
}

// ── Audio control ────────────────────────────────────────────
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
    // Autoplay: advance to next page after finishing
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
  // Scroll to next page
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

// ── NFC URL copy ─────────────────────────────────────────────
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
