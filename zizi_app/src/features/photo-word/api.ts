import http from '@/core/http'

export interface AnalyzeResult {
  word:         string   // 核心单字，如"猫"
  explanation:  string   // 儿童化解析文本
  wordAudioUrl: string   // 单字 TTS MP3 URL（为空时使用浏览器 TTS）
  textAudioUrl: string   // 解析文本 TTS MP3 URL
  imageUrl:     string   // 已上传的 OSS 图片 URL
}

/**
 * 发送图片 URL 给后端，返回识字结果
 * @param imageUrl  OSS 公开 URL
 * @param vocabLevel  字库等级 1-4
 */
export async function analyzeImage(imageUrl: string, vocabLevel: number): Promise<AnalyzeResult> {
  const { data } = await http.post<AnalyzeResult>('/photo-word/analyze', {
    imageUrl,
    vocabLevel,
  })
  return data
}
