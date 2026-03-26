<template>
  <div class="p-8 max-w-2xl">
    <h2 class="text-xl font-black text-slate-900 mb-6">全局配置</h2>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
      <div v-for="item in configItems" :key="item.key">
        <label class="block text-sm font-semibold text-slate-700 mb-1">{{ item.label }}</label>
        <p class="text-xs text-slate-400 mb-2">{{ item.desc }}</p>
        <input
          v-model="form[item.key]"
          :type="item.secret ? 'password' : 'text'"
          :placeholder="item.placeholder"
          class="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none text-sm transition-all font-mono"
        />
      </div>
      <p v-if="saved" class="text-green-600 text-sm font-medium text-center">已保存</p>
      <button
        @click="handleSave"
        :disabled="saving"
        class="h-12 rounded-xl bg-yellow-400 text-slate-900 font-bold text-sm shadow hover:bg-yellow-300 active:scale-95 transition-all duration-200 disabled:opacity-60"
      >
        {{ saving ? '保存中...' : '保存配置' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/core/http'

const configItems = [
  { key: 'llm_api_key',           label: 'LLM API Key（DashScope）', desc: '用于图片识字和绘本生成的默认 API Key', placeholder: 'sk-...', secret: true },
  { key: 'tts_api_key',           label: 'TTS API Key（DashScope）', desc: '用于语音合成的默认 API Key（留空则与 LLM Key 相同）', placeholder: 'sk-...', secret: true },
  { key: 'tts_default_voice',     label: '默认 TTS 音色', desc: 'Serena / Maia / Rocky / Kiki / browser', placeholder: 'Serena', secret: false },
  { key: 'oss_bucket',            label: 'OSS Bucket', desc: 'Alibaba Cloud OSS bucket 名称', placeholder: 'my-bucket', secret: false },
  { key: 'oss_region',            label: 'OSS Region', desc: '例如 oss-cn-hangzhou', placeholder: 'oss-cn-hangzhou', secret: false },
  { key: 'oss_access_key_id',     label: 'OSS Access Key ID', desc: '阿里云 RAM 用户 Access Key ID', placeholder: '', secret: true },
  { key: 'oss_access_key_secret', label: 'OSS Access Key Secret', desc: '阿里云 RAM 用户 Access Key Secret', placeholder: '', secret: true },
  { key: 'oss_sts_role_arn',      label: 'OSS STS Role ARN', desc: '用于生成临时上传凭证的 RAM 角色 ARN', placeholder: 'acs:ram::...', secret: false },
]

const form   = ref<Record<string, string>>({})
const saving = ref(false)
const saved  = ref(false)

onMounted(async () => {
  const { data } = await http.get<{ key: string; value: string }[]>('/admin/config')
  data.forEach(({ key, value }) => { form.value[key] = value })
})

async function handleSave() {
  saving.value = true
  saved.value  = false
  try {
    const entries = Object.entries(form.value).map(([key, value]) => ({ key, value }))
    await http.patch('/admin/config', entries)
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } finally {
    saving.value = false
  }
}
</script>
