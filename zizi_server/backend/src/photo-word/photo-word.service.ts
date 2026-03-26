import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyzeDto } from './dto/analyze.dto';

const VOCAB_LEVEL_PROMPT: Record<number, string> = {
  1: '启蒙期（2-3岁），用最简单的词语，一个字或两个字',
  2: '成长期（3-4岁），常见名词，2-4个字',
  3: '进阶期（4-5岁），丰富词汇，可以是成语或短语',
  4: '流利期（5-6岁），较复杂的词汇或短语',
};

@Injectable()
export class PhotoWordService {
  constructor(private prisma: PrismaService) {}

  private resolveKey(customKey?: string): string {
    return customKey || process.env.DASHSCOPE_API_KEY || '';
  }

  async analyze(dto: AnalyzeDto, userId: number, customLlmKey?: string, customTtsKey?: string, ttsVoice?: string) {
    const llmKey = this.resolveKey(customLlmKey);
    const ttsKey = this.resolveKey(customTtsKey);
    const voice = ttsVoice || 'Serena';
    const levelHint = VOCAB_LEVEL_PROMPT[dto.vocabLevel] ?? VOCAB_LEVEL_PROMPT[1];

    // 1. Vision: identify word
    const visionResp = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        model: 'qwen-vl-max',
        input: {
          messages: [{
            role: 'user',
            content: [
              { image: dto.imageUrl },
              { text: `请从这张图片中识别出一个适合儿童学习的汉字词语。难度要求：${levelHint}。只返回JSON格式：{"word":"...","explanation":"...（一句话解释，适合儿童）"}` },
            ],
          }],
        },
      },
      { headers: { Authorization: `Bearer ${llmKey}`, 'Content-Type': 'application/json' } },
    );

    const raw = visionResp.data?.output?.choices?.[0]?.message?.content?.[0]?.text ?? '{}';
    let word = '';
    let explanation = '';
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      word = parsed.word ?? '';
      explanation = parsed.explanation ?? '';
    } catch {
      word = raw.substring(0, 10);
      explanation = '';
    }

    // 2. TTS for word and explanation
    const [wordAudioUrl, textAudioUrl] = await Promise.all([
      this.tts(word, voice, ttsKey, dto.imageUrl, `word_${Date.now()}`),
      this.tts(explanation, voice, ttsKey, dto.imageUrl, `text_${Date.now()}`),
    ]);

    // 3. Save record
    await this.prisma.photoWord.create({
      data: { imageUrl: dto.imageUrl, word, explanation, vocabLevel: dto.vocabLevel, userId },
    });

    return { word, explanation, wordAudioUrl, textAudioUrl, imageUrl: dto.imageUrl };
  }

  private async tts(text: string, voice: string, apiKey: string, _imageUrl: string, _tag: string): Promise<string> {
    if (!text) return '';
    try {
      const resp = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-2-audio/synthesis',
        {
          model: 'qwen3-tts-flash',
          input: { text },
          parameters: { voice, format: 'mp3' },
        },
        {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          responseType: 'arraybuffer',
        },
      );
      // Return as base64 data URL (frontend plays directly)
      const b64 = Buffer.from(resp.data as ArrayBuffer).toString('base64');
      return `data:audio/mp3;base64,${b64}`;
    } catch {
      return '';
    }
  }
}
