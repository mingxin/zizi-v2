import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { AnalyzeDto } from './dto/analyze.dto';
import { matchVocabulary } from './vocabularies';

const DASHSCOPE_VISION_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const DASHSCOPE_TTS_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-2-audio/synthesis';

@Injectable()
export class PhotoWordService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  private resolveKey(customKey?: string): string {
    return customKey || process.env.DASHSCOPE_API_KEY || '';
  }

  async analyze(
    dto: AnalyzeDto,
    userId: number,
    imageBuffer: Buffer,
    customLlmKey?: string,
    customTtsKey?: string,
    ttsVoice?: string,
  ) {
    const llmKey = this.resolveKey(customLlmKey);
    const ttsKey = this.resolveKey(customTtsKey);
    const voice = ttsVoice || 'Serena';

    // 将图片转为 base64 data URL（供 LLM 视觉模型使用）
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    // 保存图片到本地，获取可访问 URL（供前端展示）
    const imageUrl = await this.uploadService.saveFile(imageBuffer, 'images', 'jpg');

    // ── Step 1: 视觉提取候选词汇 ──────────────────────────────
    const candidates = await this.extractCandidates(base64Image, llmKey);

    // ── Step 2: 字库匹配 ─────────────────────────────────────
    const matchedWord = matchVocabulary(candidates, dto.vocabLevel);

    // ── Step 3: 生成儿童化讲解 ────────────────────────────────
    const explanation = await this.generateExplanation(
      base64Image,
      matchedWord,
      dto.vocabLevel,
      llmKey,
    );

    // ── Step 4: TTS + 存本地文件 ──────────────────────────────
    const [wordAudioUrl, textAudioUrl] = await Promise.all([
      this.ttsAndSave(matchedWord, voice, ttsKey, 'word'),
      this.ttsAndSave(explanation, voice, ttsKey, 'text'),
    ]);

    // ── Step 5: 落库 ──────────────────────────────────────────
    await this.prisma.photoWord.create({
      data: {
        imageUrl,
        word: matchedWord,
        explanation,
        vocabLevel: dto.vocabLevel,
        userId,
      },
    });

    return {
      word: matchedWord,
      explanation,
      wordAudioUrl,
      textAudioUrl,
      imageUrl,
    };
  }

  /**
   * Step 1: 调 LLM 提取画面中的候选词汇
   */
  private async extractCandidates(
    imageSource: string,
    apiKey: string,
  ): Promise<string[]> {
    try {
      const resp = await axios.post(
        DASHSCOPE_VISION_URL,
        {
          model: 'qwen-vl-max',
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  { image: imageSource },
                  {
                    text: '请从这张图片中识别出所有适合儿童学习的事物和概念。提取画面中出现的名词、动词和形容词（每个词1-4个字）。只返回JSON数组格式，例如：["猫","睡觉","沙发","橘色","可爱"]。不要返回任何其他内容。',
                  },
                ],
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const raw =
        resp.data?.output?.choices?.[0]?.message?.content?.[0]?.text ?? '[]';
      const cleaned = raw.replace(/```json|```/g, '').trim();

      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(String);
        }
      } catch {
        if (typeof cleaned === 'string' && cleaned.length > 0) {
          return cleaned
            .split(/[,，、\s]+/)
            .map((s) => s.replace(/["\[\]"]/g, '').trim())
            .filter(Boolean);
        }
      }

      return ['事物'];
    } catch {
      return ['事物'];
    }
  }

  /**
   * Step 3: 确定核心字后，二次调 LLM 生成儿童化讲解
   */
  private async generateExplanation(
    imageSource: string,
    word: string,
    vocabLevel: number,
    apiKey: string,
  ): Promise<string> {
    const ageHint =
      ({ 1: '2-3岁', 2: '3-4岁', 3: '4-5岁', 4: '5-6岁' } as const)[vocabLevel] ??
      '3-4岁';

    try {
      const resp = await axios.post(
        DASHSCOPE_VISION_URL,
        {
          model: 'qwen-vl-max',
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  { image: imageSource },
                  {
                    text: `你现在是一个温柔的幼儿园老师。请结合图片内容，教${ageHint}的小朋友认"${word}"这个字。要求：1. 长度在50字以内。2. 必须包含"${word}"字。3. 语气生动可爱，带有鼓励性质。只返回讲解文字，不要其他内容。`,
                  },
                ],
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return (
        resp.data?.output?.choices?.[0]?.message?.content?.[0]?.text ??
        `这是"${word}"，一起来学习吧！`
      );
    } catch {
      return `这是"${word}"，一起来学习吧！`;
    }
  }

  /**
   * Step 4: TTS 合成 + 保存为本地文件
   */
  private async ttsAndSave(
    text: string,
    voice: string,
    apiKey: string,
    tag: string,
  ): Promise<string> {
    if (!text) return '';
    try {
      const resp = await axios.post(
        DASHSCOPE_TTS_URL,
        {
          model: 'qwen3-tts-flash',
          input: { text },
          parameters: { voice, format: 'mp3' },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        },
      );
      const buffer = Buffer.from(resp.data as ArrayBuffer);
      return this.uploadService.saveFile(buffer, 'audio', 'mp3', tag);
    } catch {
      return '';
    }
  }
}
