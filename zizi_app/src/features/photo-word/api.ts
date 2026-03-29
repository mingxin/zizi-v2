import http from '@/core/http'

export interface AnalyzeResult {
  word:         string   // 核心单字
  explanation:  string   // 儿童化解析文本
  wordAudioUrl: string   // 单字 TTS 音频 URL
  textAudioUrl: string   // 解析文本 TTS 音频 URL
  imageUrl:     string   // 图片 URL
}

/**
 * 上传图片到后端并分析识字结果
 * @param file 图片文件
 * @param vocabLevel 字库等级 1-4
 */
export async function analyzeImage(
  file: File,
  vocabLevel: number,
): Promise<AnalyzeResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('vocabLevel', String(vocabLevel.toString())

  const { data } = await http.post<AnalyzeResult>('/photo-word/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
