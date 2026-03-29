import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

const DASHSCOPE_VISION_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const DASHSCOPE_TTS_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-2-audio/synthesis';

@Injectable()
export class PictureBookService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  private resolveKey(customKey?: string): string {
    return customKey || process.env.DASHSCOPE_API_KEY || '';
  }

  // ── List books with pageCount ────────────────────────────────
  async listBooks(userId: number) {
    const books = await this.prisma.book.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { pages: true } } },
    });
    return books.map((b) => ({
      id: b.id,
      title: b.title,
      coverUrl: b.coverUrl,
      createdAt: b.createdAt,
      pageCount: b._count.pages,
    }));
  }

  // ── Get single book with pages ───────────────────────────────
  async getBook(id: number, userId: number) {
    const book = await this.prisma.book.findFirst({
      where: { id, userId },
      include: { pages: { orderBy: { pageNum: 'asc' } } },
    });
    if (!book) throw new NotFoundException('绘本不存在');
    return {
      ...book,
      pageCount: book.pages.length,
    };
  }

  // ── Update book title ────────────────────────────────────────
  async updateBook(id: number, userId: number, dto: UpdateBookDto) {
    const book = await this.prisma.book.findFirst({ where: { id, userId } });
    if (!book) throw new NotFoundException('绘本不存在');
    return this.prisma.book.update({
      where: { id },
      data: { title: dto.title },
    });
  }

  // ── Create book: two-step orchestration ──────────────────────
  async createBook(
    dto: CreateBookDto,
    userId: number,
    customLlmKey?: string,
    customTtsKey?: string,
    ttsVoice?: string,
  ) {
    const llmKey = this.resolveKey(customLlmKey);
    const ttsKey = this.resolveKey(customTtsKey);
    const voice = ttsVoice || 'Serena';

    // ── Step 1: Send ALL images to LLM to extract storyline + title ──
    const { mainStory, title } = await this.extractStoryline(
      dto.imageUrls,
      llmKey,
    );

    // ── Step 2: For each page, combine with storyline to generate story ──
    const pageStories = await this.generatePageStories(
      dto.imageUrls,
      mainStory,
      llmKey,
    );

    // ── Step 3: Fuzzy pages imagination + TTS for all pages ──
    const pageData = await Promise.all(
      pageStories.map((story, idx) =>
        this.generateAudio(story, voice, ttsKey, `book_page_${idx + 1}`),
      ),
    );

    const coverUrl = dto.imageUrls[0];

    const book = await this.prisma.book.create({
      data: {
        title,
        coverUrl,
        userId,
        pages: {
          create: pageData.map((p, idx) => ({
            pageNum: idx + 1,
            imageUrl: dto.imageUrls[idx],
            story: p.story,
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

  // ── Step 1: Extract overall storyline + title from all images ──
  private async extractStoryline(
    imageUrls: string[],
    apiKey: string,
  ): Promise<{ mainStory: string; title: string }> {
    const imageContents = imageUrls.map((url) => ({ image: url }));

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
                  ...imageContents,
                  {
                    text: `这是一本绘本的所有页面图片（共${imageUrls.length}页）。请你完成以下两个任务：
1. 提炼出这本绘本的主线故事梗概（100-200字），包含开头、发展和结尾。
2. 为这本绘本起一个适合3-6岁儿童的标题（不超过15个字）。

请严格按以下JSON格式返回，不要返回其他内容：
{"mainStory":"主线故事梗概","title":"绘本标题"}`,
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
          timeout: 120000,
        },
      );

      const raw =
        resp.data?.output?.choices?.[0]?.message?.content?.[0]?.text ?? '';
      const cleaned = raw.replace(/```json|```/g, '').trim();

      try {
        const parsed = JSON.parse(cleaned);
        return {
          mainStory: parsed.mainStory || '一个有趣的故事。',
          title: parsed.title || '我的绘本',
        };
      } catch {
        // Fallback: try to extract from raw text
        const titleMatch = raw.match(/title["\s:]+["']([^"']+)["']/);
        return {
          mainStory: raw.substring(0, 200) || '一个有趣的故事。',
          title: titleMatch?.[1] || '我的绘本',
        };
      }
    } catch {
      return {
        mainStory: '一个有趣的故事。',
        title: '我的绘本',
      };
    }
  }

  // ── Step 2: Generate story for each page with storyline context ──
  private async generatePageStories(
    imageUrls: string[],
    mainStory: string,
    apiKey: string,
  ): Promise<string[]> {
    return Promise.all(
      imageUrls.map((imageUrl, idx) =>
        this.generateSinglePageStory(
          imageUrl,
          idx + 1,
          imageUrls.length,
          mainStory,
          apiKey,
        ),
      ),
    );
  }

  private async generateSinglePageStory(
    imageUrl: string,
    pageNum: number,
    totalPages: number,
    mainStory: string,
    apiKey: string,
  ): Promise<string> {
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
                  { image: imageUrl },
                  {
                    text: `这是绘本第${pageNum}页（共${totalPages}页）的图片。

这本绘本的主线故事是：${mainStory}

请根据这页图片内容，结合主线故事，用2-3句话为3-6岁儿童讲述这页的故事。要求：
1. 语言生动有趣，适合朗读
2. 与主线故事连贯
3. 如果这页图片内容不清晰或模糊，请根据主线故事合理脑补这页的内容
4. 只返回故事文字，不要其他内容`,
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
          timeout: 60000,
        },
      );

      const story =
        resp.data?.output?.choices?.[0]?.message?.content?.[0]?.text ?? '';

      // Fuzzy page: if story is empty, generate from mainStory context
      if (!story || story.trim().length < 5) {
        return this.imaginePageFromStoryline(pageNum, totalPages, mainStory);
      }
      return story;
    } catch {
      return this.imaginePageFromStoryline(pageNum, totalPages, mainStory);
    }
  }

  // ── Step 3: Imagine fuzzy page content from storyline ──
  private imaginePageFromStoryline(
    pageNum: number,
    totalPages: number,
    mainStory: string,
  ): string {
    // Divide storyline into segments for each page
    const segmentLength = Math.floor(mainStory.length / totalPages);
    const start = (pageNum - 1) * segmentLength;
    const end =
      pageNum === totalPages ? mainStory.length : start + segmentLength;
    const segment = mainStory.substring(start, end).trim();

    if (segment.length > 0) {
      return `${segment}`;
    }
    return `故事继续，小朋友们快翻到下一页看看吧。`;
  }

  // ── TTS + save to local file ─────────────────────────────────
  private async generateAudio(
    story: string,
    voice: string,
    apiKey: string,
    tag: string,
  ): Promise<{ story: string; audioUrl: string }> {
    if (!story) {
      return { story: '', audioUrl: '' };
    }

    let audioUrl = '';
    try {
      const resp = await axios.post(
        DASHSCOPE_TTS_URL,
        {
          model: 'qwen3-tts-flash',
          input: { text: story },
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
      audioUrl = await this.uploadService.saveFile(buffer, 'audio', 'mp3', tag);
    } catch {
      audioUrl = '';
    }

    return { story, audioUrl };
  }
}
