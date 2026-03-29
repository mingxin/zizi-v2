<template>
  <div class="relative flex flex-col h-dvh bg-bg-light dark:bg-bg-dark overflow-hidden">
    <!-- 顶部导航 -->
    <AppHeader :show-back="true" @back="handleBack" />

    <template v-if="result">
      <!-- 图片区域（正方形裁剪）-->
      <div class="px-6 pt-2">
        <div class="w-full aspect-square rounded-3xl overflow-hidden shadow-float bg-slate-100">
          <img
            :src="store.previewUrl || result.imageUrl"
            alt="拍摄的图片"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- 内容区：可滚动 -->
      <div class="flex-1 overflow-y-auto px-6 pt-5 pb-4 space-y-4">
        <!-- 核心单字大卡片 -->
        <button
          @click="playWord"
          :class="[
            'w-full rounded-3xl p-6 flex items-center justify-between shadow-bubbly transition-all duration-300 active:scale-95',
            playingWord ? 'bg-primary' : 'bg-primary/20'
          ]"
        >
          <span class="text-7xl font-black text-slate-900">{{ result.word }}</span>
          <div class="flex flex-col items-center gap-1">
            <div :class="['size-16 rounded-full flex items-center justify-center transition-all duration-300', playingWord ? 'bg-slate-900' : 'bg-primary']">
              <span class="material-symbols-outlined text-3xl" :class="playingWord ? 'text-primary' : 'text-slate-900'">
                {{ playingWord ? 'volume_up' : 'play_arrow' }}
              </span>
            </div>
            <span class="text-xs font-bold text-slate-600">{{ playingWord ? '播放中' : '点击发音' }}</span>
          </div>
        </button>

        <!-- 解析文本卡片 -->
        <button
          @click="playText"
          class="w-full bg-surface dark:bg-white/5 rounded-3xl p-5 shadow-float text-left transition-all duration-300 active:scale-95"
        >
          <div class="flex gap-4 items-start">
            <div class="flex-1">
              <p class="text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                {{ result.explanation }}
              </p>
              <div class="mt-2 flex items-center gap-1 text-primary font-bold text-sm tracking-wider">
                <span class="material-symbols-outlined text-sm">volume_up</span>
                <span>{{ playingText ? '播放中...' : '点击重听' }}</span>
              </div>
            </div>
            <div class="flex items-center justify-center p-2 text-primary/60">
              <span class="material-symbols-outlined text-4xl">play_circle</span>
            </div>
          </div>
        </button>
      </div>

      <!-- 底部：继续玩按钮 -->
      <div class="px-6 py-4 bg-gradient-to-t from-bg-light dark:from-bg-dark to-transparent">
        <PrimaryButton label="继续玩" icon="auto_awesome" @click="handleContinue" />
      </div>
    </template>

    <!-- 兜底：没有结果时 -->
    <div v-else class="flex-1 flex flex-col items-center justify-center gap-4 px-8">
      <span class="material-symbols-outlined text-6xl text-slate-300">image_not_supported</span>
      <p class="text-slate-500 text-center font-medium">没有识字结果，请重新拍一张</p>
      <button @click="handleBack" class="text-primary font-bold active:scale-95 transition-all duration-300">返回拍照</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AppHeader, PrimaryButton } from '@/shared/components'
import { usePhotoWordStore } from '../store'
import { playAudio } from '@/shared/utils/tts'

const router = useRouter()
const store  = usePhotoWordStore()
const result = store.result

const playingWord = ref(false)
const playingText = ref(false)

// 进入结果页自动播放解析文本
onMounted(() => {
  if (result) playText()
})

async function playWord() {
  if (!result || playingWord.value) return
  playingWord.value = true
  await playAudio(result.wordAudioUrl, result.word)
  playingWord.value = false
}

async function playText() {
  if (!result || playingText.value) return
  playingText.value = true
  await playAudio(result.textAudioUrl, result.explanation)
  playingText.value = false
}

function handleBack() {
  store.reset()
  router.push('/')
}

function handleContinue() {
  store.reset()
  router.push('/?camera=1')
}
</script>
