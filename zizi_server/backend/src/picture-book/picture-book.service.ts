import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class PictureBookService {
  constructor(private prisma: PrismaService) {}

  private resolveKey(customKey?: string): string {
    return customKey || process.env.DASHSCOPE_API_KEY || '';
  }

  async listBooks(userId: number) {
    const books = await this.prisma.book.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { pages: false },
    });
    return books.map(b => ({
      ...b,
      pageCount: undefined,
      _count: undefined,
    }));
  }

  async getBook(id: number, userId: number) {
    const book = await this.prisma.book.findFirstOrThrow({
      where: { id, userId },
      include: { pages: { orderBy: { pageNum: 'asc' } } },
    });
    return book;
  }

  async createBook(dto: CreateBookDto, userId: number, customLlmKey?: string, customTtsKey?: string, ttsVoice?: string) {
    const llmKey = this.resolveKey(customLlmKey);
    const ttsKey = this.resolveKey(customTtsKey);
    const voice  = ttsVoice || 'Serena';

    // Generate story + TTS for each page in parallel
    const pageData = await Promise.all(
      dto.imageUrls.map((imageUrl, idx) =>
        this.processPage(imageUrl, idx + 1, llmKey, ttsKey, voice),
      ),
    );

    const title    = pageData[0]?.story?.substring(0, 20) || '新绘本';
    const coverUrl = dto.imageUrls[0];

    const book = await this.prisma.book.create({
      data: {
        title,
        coverUrl,
        userId,
        pages: {
          create: pageData.map((p, idx) => ({
            pageNum:  idx + 1,
            imageUrl: dto.imageUrls[idx],
            story:    p.story,
            audioUrl: p.audioUrl,
          })),
        },
      },
      include: { pages: { orderBy: { pageNum: 'asc' } } },
    });

    return {
      ...book,
      pageCount: book.pages.length,
    };
  }

  private async processPage(imageUrl: string, pageNum: number, llmKey: string, ttsKey: string, voice: string) {
    let story = '';
    try {
      const visionResp = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        {
          model: 'qwen-vl-max',
          input: {
            messages: [{
              role: 'user',
              content: [
                { image: imageUrl },
                { text: `这是绘本第${pageNum}页的图片，请用2-3句话为3-6岁儿童讲述这页的故事，语言生动有趣，只返回故事文字。` },
              ],
            }],
          },
        },
        { headers: { Authorization: `Bearer ${llmKey}`, 'Content-Type': 'application/json' } },
      );
      story = visionResp.data?.output?.choices?.[0]?.message?.content?.[0]?.text ?? '';
    } catch {
      story = '';
    }

    let audioUrl = '';
    if (story) {
      try {
        const ttsResp = await axios.post(
          'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-2-audio/synthesis',
          {
            model: 'qwen3-tts-flash',
            input: { text: story },
            parameters: { voice, format: 'mp3' },
          },
          {
            headers: { Authorization: `Bearer ${ttsKey}`, 'Content-Type': 'application/json' },
            responseType: 'arraybuffer',
          },
        );
        const b64 = Buffer.from(ttsResp.data as ArrayBuffer).toString('base64');
        audioUrl = `data:audio/mp3;base64,${b64}`;
      } catch {
        audioUrl = '';
      }
    }

    return { story, audioUrl };
  }
}
