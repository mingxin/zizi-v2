import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PictureBookService } from './picture-book.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PictureBookService', () => {
  let service: PictureBookService;
  let prisma: PrismaService;

  const mockBook = {
    id: 1,
    title: '小兔子的冒险',
    coverUrl: 'https://example.com/cover.jpg',
    userId: 1,
    createdAt: new Date(),
    pages: [
      { id: 1, pageNum: 1, imageUrl: 'url1', story: '故事1', audioUrl: 'audio1' },
      { id: 2, pageNum: 2, imageUrl: 'url2', story: '故事2', audioUrl: 'audio2' },
    ],
  };

  const mockPrisma = {
    book: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUploadService = {
    saveFile: jest.fn().mockResolvedValue('/api/static/audio/page.mp3'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PictureBookService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UploadService, useValue: mockUploadService },
      ],
    }).compile();

    service = module.get<PictureBookService>(PictureBookService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('listBooks', () => {
    it('应返回用户的绘本列表（含页数）', async () => {
      mockPrisma.book.findMany.mockResolvedValue([
        { ...mockBook, _count: { pages: 2 } },
      ]);

      const result = await service.listBooks(1);

      expect(result).toHaveLength(1);
      expect(result[0].pageCount).toBe(2);
      expect(result[0].id).toBe(1);
    });

    it('无绘本时应返回空数组', async () => {
      mockPrisma.book.findMany.mockResolvedValue([]);

      const result = await service.listBooks(1);

      expect(result).toEqual([]);
    });
  });

  describe('getBook', () => {
    it('应返回绘本详情含分页', async () => {
      mockPrisma.book.findFirst.mockResolvedValue(mockBook);

      const result = await service.getBook(1, 1);

      expect(result.id).toBe(1);
      expect(result.pageCount).toBe(2);
      expect(result.pages).toHaveLength(2);
    });

    it('绘本不存在应抛出 NotFoundException', async () => {
      mockPrisma.book.findFirst.mockResolvedValue(null);

      await expect(service.getBook(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBook', () => {
    it('应更新绘本标题', async () => {
      mockPrisma.book.findFirst.mockResolvedValue(mockBook);
      mockPrisma.book.update.mockResolvedValue({
        ...mockBook,
        title: '新标题',
      });

      const result = await service.updateBook(1, 1, { title: '新标题' });

      expect(result.title).toBe('新标题');
      expect(mockPrisma.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: '新标题' },
      });
    });

    it('更新不存在的绘本应抛出 NotFoundException', async () => {
      mockPrisma.book.findFirst.mockResolvedValue(null);

      await expect(
        service.updateBook(999, 1, { title: '新标题' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createBook (AI 管道)', () => {
    const imageUrls = ['url1', 'url2'];

    const mockVisionResponse = (text: string) => ({
      data: {
        output: {
          choices: [{ message: { content: [{ text }] } }],
        },
      },
    });

    const mockTtsBuffer = Buffer.from('fake-mp3');

    it('完整三阶段管道应成功创建绘本', async () => {
      // Step 1: extractStoryline
      mockedAxios.post.mockResolvedValueOnce(
        mockVisionResponse(
          '{"mainStory":"小兔子去森林探险的故事","title":"小兔子的冒险"}',
        ),
      );

      // Step 2: generateSinglePageStory x2
      mockedAxios.post
        .mockResolvedValueOnce(
          mockVisionResponse('小兔子蹦蹦跳跳地走进了森林。'),
        )
        .mockResolvedValueOnce(
          mockVisionResponse('小兔子在森林里遇到了一只小鹿。'),
        );

      // Step 3: TTS x2
      mockedAxios.post
        .mockResolvedValueOnce({ data: mockTtsBuffer })
        .mockResolvedValueOnce({ data: mockTtsBuffer });

      const createdBook = {
        ...mockBook,
        pages: [
          { pageNum: 1, imageUrl: 'url1', story: '小兔子蹦蹦跳跳地走进了森林。', audioUrl: '/api/static/audio/page1.mp3' },
          { pageNum: 2, imageUrl: 'url2', story: '小兔子在森林里遇到了一只小鹿。', audioUrl: '/api/static/audio/page2.mp3' },
        ],
      };
      mockPrisma.book.create.mockResolvedValue(createdBook);
      mockUploadService.saveFile
        .mockResolvedValueOnce('/api/static/audio/page1.mp3')
        .mockResolvedValueOnce('/api/static/audio/page2.mp3');

      const result = await service.createBook(
        { imageUrls },
        1,
      );

      expect(result.pageCount).toBe(2);
      expect(mockPrisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: '小兔子的冒险',
            coverUrl: 'url1',
            userId: 1,
          }),
        }),
      );
    });

    it('故事提取 API 失败应使用降级默认值', async () => {
      // Step 1 fails
      mockedAxios.post.mockRejectedValueOnce(new Error('API error'));

      // Step 2: page stories
      mockedAxios.post
        .mockResolvedValueOnce(mockVisionResponse('故事继续。'))
        .mockResolvedValueOnce(mockVisionResponse('故事结尾。'));

      // Step 3: TTS
      mockedAxios.post
        .mockResolvedValueOnce({ data: mockTtsBuffer })
        .mockResolvedValueOnce({ data: mockTtsBuffer });

      mockPrisma.book.create.mockResolvedValue({
        ...mockBook,
        title: '我的绘本',
        pages: [],
      });

      const result = await service.createBook({ imageUrls }, 1);

      // 降级后标题应为 "我的绘本"
      expect(mockPrisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: '我的绘本' }),
        }),
      );
    });

    it('分页故事为空时应使用 imaginePageFromStoryline 降级', async () => {
      // Step 1: extract storyline
      mockedAxios.post.mockResolvedValueOnce(
        mockVisionResponse(
          '{"mainStory":"小兔子去森林探险，遇到了很多好朋友，最后开开心心地回家了","title":"小兔子的冒险"}',
        ),
      );

      // Step 2: one page returns empty
      mockedAxios.post
        .mockResolvedValueOnce(mockVisionResponse('')) // empty → fallback
        .mockResolvedValueOnce(mockVisionResponse('正常的第二页故事。'));

      // Step 3: TTS
      mockedAxios.post
        .mockResolvedValueOnce({ data: mockTtsBuffer })
        .mockResolvedValueOnce({ data: mockTtsBuffer });

      mockPrisma.book.create.mockResolvedValue({
        ...mockBook,
        pages: [],
      });

      await service.createBook({ imageUrls }, 1);

      // 第一页应该用 storyline 分段降级
      const createCall = mockPrisma.book.create.mock.calls[0][0];
      const page1Story = createCall.data.pages.create[0].story;
      expect(page1Story.length).toBeGreaterThan(0);
    });

    it('自定义 Key 应透传到所有 API 调用', async () => {
      mockedAxios.post
        .mockResolvedValueOnce(
          mockVisionResponse('{"mainStory":"故事","title":"标题"}'),
        )
        .mockResolvedValueOnce(mockVisionResponse('故事1'))
        .mockResolvedValueOnce(mockVisionResponse('故事2'))
        .mockResolvedValueOnce({ data: mockTtsBuffer })
        .mockResolvedValueOnce({ data: mockTtsBuffer });

      mockPrisma.book.create.mockResolvedValue({ ...mockBook, pages: [] });

      await service.createBook(
        { imageUrls },
        1,
        'my-llm-key',
        'my-tts-key',
        'Maia',
      );

      // LLM 调用使用 LLM key
      const llmCalls = mockedAxios.post.mock.calls.filter(
        (c) => c[0]?.includes('multimodal'),
      );
      llmCalls.forEach((call) => {
        expect(call[2]?.headers?.Authorization).toBe('Bearer my-llm-key');
      });

      // TTS 调用使用 TTS key
      const ttsCalls = mockedAxios.post.mock.calls.filter(
        (c) => c[0]?.includes('text-2-audio'),
      );
      ttsCalls.forEach((call) => {
        expect(call[2]?.headers?.Authorization).toBe('Bearer my-tts-key');
      });
    });
  });
});
