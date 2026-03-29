<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="fixed inset-0 z-40 flex justify-end" @click.self="close">
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="close" />

        <!-- Drawer 容器 -->
        <aside class="relative w-[88%] max-w-sm h-full bg-surface dark:bg-bg-dark rounded-l-3xl shadow-2xl flex flex-col border-l-4 border-white/10 overflow-hidden z-10">

          <!-- Header -->
          <header class="flex items-center justify-between px-6 pt-10 pb-4">
            <button
              @click="close"
              class="size-11 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-full shadow-float active:scale-95 transition-all duration-300"
            >
              <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">close</span>
            </button>
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">家长设置</h2>
            <div class="w-11" />
          </header>

          <!-- 可滚动内容区 -->
          <div class="flex-1 overflow-y-auto px-6 space-y-8 pb-36">

            <!-- Section A: 字库难度 -->
            <section class="space-y-3">
              <div>
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">字库难度</h3>
                <p class="text-xs text-slate-500 mt-0.5">选择宝宝的识字阶段</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="level in ([1,2,3,4] as VocabLevel[])"
                  :key="level"
                  @click="form.vocabLevel = level"
                  :class="[
                    'flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-b-4 transition-all duration-300 active:scale-95',
                    form.vocabLevel === level
                      ? 'bg-primary shadow-bubbly-sm border-primary-orange/50 scale-[1.02]'
                      : 'bg-white dark:bg-white/5 shadow-float border-slate-100 dark:border-white/10'
                  ]"
                >
                  <span
                    class="text-2xl font-black"
                    :class="form.vocabLevel === level ? 'text-slate-900' : 'text-slate-400'"
                  >L{{ level }}</span>
                  <span
                    class="text-xs font-bold tracking-wide"
                    :class="form.vocabLevel === level ? 'text-slate-700' : 'text-slate-400'"
                  >{{ levelLabels[level] }}</span>
                </button>
              </div>
            </section>

            <!-- Section B: TTS 音色 -->
            <section class="space-y-3">
              <div>
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">朗读音色</h3>
                <p class="text-xs text-slate-500 mt-0.5">选择 AI 的声音风格</p>
              </div>
              <div class="grid grid-cols-1 gap-2">
                <button
                  v-for="voice in voices"
                  :key="voice.id"
                  @click="form.ttsVoice = voice.id; previewVoice(voice.id)"
                  :class="[
                    'flex items-center gap-3 p-4 rounded-2xl border-b-4 transition-all duration-300 active:scale-95 text-left',
                    form.ttsVoice === voice.id
                      ? 'bg-primary shadow-bubbly-sm border-primary-orange/50'
                      : 'bg-white dark:bg-white/5 shadow-float border-slate-100 dark:border-white/10'
                  ]"
                >
                  <span class="material-symbols-outlined text-2xl" :class="form.ttsVoice === voice.id ? 'text-slate-900' : 'text-slate-400'">{{ voice.icon }}</span>
                  <div>
                    <p class="text-sm font-bold" :class="form.ttsVoice === voice.id ? 'text-slate-900' : 'text-slate-600 dark:text-slate-300'">{{ voice.label }}</p>
                    <p class="text-xs" :class="form.ttsVoice === voice.id ? 'text-slate-600' : 'text-slate-400'">{{ voice.desc }}</p>
                  </div>
                  <span v-if="form.ttsVoice === voice.id" class="material-symbols-outlined ml-auto text-slate-900">check_circle</span>
                </button>
              </div>
            </section>

            <!-- Section C: 自定义 API Key -->
            <section class="space-y-3">
              <div>
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">自定义 API Key</h3>
                <p class="text-xs text-slate-500 mt-0.5">留空则使用系统默认 Key</p>
              </div>
              <div class="space-y-3">
                <div>
                  <label class="text-xs font-black text-slate-400 tracking-widest uppercase ml-1 mb-1 block">大模型 API Key</label>
                  <input
                    v-model="form.customLlmKey"
                    type="password"
                    placeholder="sk-..."
                    autocomplete="off"
                    class="w-full h-14 bg-white dark:bg-white/10 rounded-2xl px-4 ring-2 ring-transparent focus:ring-primary shadow-float text-slate-700 dark:text-slate-200 placeholder:text-slate-300 font-medium text-sm outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label class="text-xs font-black text-slate-400 tracking-widest uppercase ml-1 mb-1 block">TTS API Key</label>
                  <input
                    v-model="form.customTtsKey"
                    type="password"
                    placeholder="sk-..."
                    autocomplete="off"
                    class="w-full h-14 bg-white dark:bg-white/10 rounded-2xl px-4 ring-2 ring-transparent focus:ring-primary shadow-float text-slate-700 dark:text-slate-200 placeholder:text-slate-300 font-medium text-sm outline-none transition-all duration-300"
                  />
                </div>
              </div>
            </section>

            <!-- 装饰 -->
            <div class="flex justify-center py-4 opacity-20">
              <span class="material-symbols-outlined text-8xl text-slate-400">auto_awesome</span>
            </div>
          </div>

          <!-- Footer：保存按钮 -->
          <footer class="absolute bottom-0 left-0 right-0 px-6 pt-12 pb-8 bg-gradient-to-t from-surface dark:from-bg-dark via-surface/95 dark:via-bg-dark/95 to-transparent">
            <button
              @click="handleSave"
              class="w-full h-16 rounded-full bg-gradient-to-r from-primary to-primary-orange shadow-bubbly flex items-center justify-center gap-3 text-slate-900 text-xl font-black border-b-4 border-black/10 transition-all duration-300 active:scale-95"
            >
              <span class="material-symbols-outlined text-2xl">stars</span>
              <span>保存设置</span>
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useSettingsStore, type VocabLevel, type TtsVoice } from '../store'
import { previewVoice } from '@/shared/utils/tts'

const props = defineProps<{ modelValue: boolean }>()
const emit  = defineEmits<{ 'update:modelValue': [boolean] }>()

const settings = useSettingsStore()

const levelLabels: Record<VocabLevel, string> = {
  1: '启蒙期',
  2: '成长期',
  3: '进阶期',
  4: '流利期',
}

const voices: { id: TtsVoice; label: string; desc: string; icon: string }[] = [
  { id: 'Maia',   label: 'Maia · 四月',   desc: '知性与温柔的碰撞（女声）',       icon: 'self_improvement' },
  { id: 'Kai',    label: 'Kai · 凯',      desc: '耳朵的一场SPA（男声）',           icon: 'record_voice_over' },
  { id: 'Kiki',   label: 'Kiki · 阿清',   desc: '甜美的港妹闺蜜（粤语女声）',     icon: 'mood' },
  { id: 'Rocky',  label: 'Rocky · 阿强',  desc: '幽默风趣在线陪聊（粤语男声）',   icon: 'sentiment_satisfied' },
  { id: 'browser', label: '系统默认',       desc: '使用浏览器内置语音（离线可用）', icon: 'speaker' },
]

const form = reactive<{
  vocabLevel:   VocabLevel
  ttsVoice:     TtsVoice
  customLlmKey: string
  customTtsKey: string
}>({
  vocabLevel:   settings.vocabLevel,
  ttsVoice:     settings.ttsVoice,
  customLlmKey: settings.customLlmKey,
  customTtsKey: settings.customTtsKey,
})

// 每次打开 Drawer 时同步最新 store 值
watch(() => props.modelValue, (open) => {
  if (open) {
    form.vocabLevel   = settings.vocabLevel
    form.ttsVoice     = settings.ttsVoice
    form.customLlmKey = settings.customLlmKey
    form.customTtsKey = settings.customTtsKey
  }
})

function close() {
  emit('update:modelValue', false)
}

function handleSave() {
  settings.save({ ...form })
  close()
}
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from {
  opacity: 0;
}
.drawer-enter-from aside {
  transform: translateX(100%);
}
.drawer-leave-to {
  opacity: 0;
}
.drawer-leave-to aside {
  transform: translateX(100%);
}
</style>
