import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { PhotoWordService } from './photo-word.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PhotoWordService', () => {
  let service: PhotoWordService;
  let prisma: PrismaService;
  let uploadService: UploadService;

  const mockPrisma = {
    photoWord: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  };

  const mockUploadService = {
    saveFile: jest.fn().mockResolvedValue('/api/static/images/test_123.jpg'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotoWordService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UploadService, useValue: mockUploadService },
      ],
    }).compile();

    service = module.get<PhotoWordService>(PhotoWordService);
    prisma = module.get<PrismaService>(PrismaService);
    uploadService = module.get<UploadService>(UploadService);
    jest.clearAllMocks();
  });

  describe('analyze (完整管道)', () => {
    const imageBuffer = Buffer.from('fake-image');

    const mockVisionResponse = (text: string) => ({
      data: {
        output: {
          choices: [{ message: { content: [{ text }] } }],
        },
      },
    });

    const mockTtsResponse = {
      data: Buffer.from('fake-mp3-data'),
    };

    it('完整管道成功应返回分析结果', async () => {
      // Step 1: 提取候选词
      mockedAxios.post
        .mockResolvedValueOnce(
          mockVisionResponse('["花","红色","植物"]'),
        )
        // Step 3: 生成解释
        .mockResolvedValueOnce(
          mockVisionResponse('这是"花"，五颜六色的花真漂亮！'),
        )
        // Step 4: TTS for word
        .mockResolvedValueOnce(mockTtsResponse)
        // Step 4: TTS for text
        .mockResolvedValueOnce(mockTtsResponse);

      mockUploadService.saveFile
        .mockResolvedValueOnce('/api/static/images/test.jpg')
        .mockResolvedValueOnce('/api/static/audio/word.mp3')
        .mockResolvedValueOnce('/api/static/audio/text.mp3');

      const result = await service.analyze(
        { vocabLevel: 1 },
        1,
        imageBuffer,
      );

      expect(result).toHaveProperty('word');
      expect(result).toHaveProperty('explanation');
      expect(result).toHaveProperty('wordAudioUrl');
      expect(result).toHaveProperty('textAudioUrl');
      expect(result).toHaveProperty('imageUrl');
      expect(mockPrisma.photoWord.create).toHaveBeenCalled();
    });

    it('LLM 返回非 JSON 格式时应降级解析', async () => {
      mockedAxios.post
        .mockResolvedValueOnce(
          mockVisionResponse('猫, 狗, 桌子'),
        )
        .mockResolvedValueOnce(
          mockVisionResponse('这是"猫"，小猫咪真可爱！'),
        )
        .mockResolvedValueOnce(mockTtsResponse)
        .mockResolvedValueOnce(mockTtsResponse);

      const result = await service.analyze(
        { vocabLevel: 1 },
        1,
        imageBuffer,
      );

      expect(result.word).toBeDefined();
      expect(typeof result.word).toBe('string');
    });

    it('TTS 失败时音频 URL 应为空字符串', async () => {
      mockedAxios.post
        .mockResolvedValueOnce(
          mockVisionResponse('["大","事物"]'),
        )
        .mockResolvedValueOnce(
          mockVisionResponse('这是"大"，大大的世界真奇妙！'),
        )
        .mockRejectedValueOnce(new Error('TTS API error'))
        .mockRejectedValueOnce(new Error('TTS API error'));

      const result = await service.analyze(
        { vocabLevel: 1 },
        1,
        imageBuffer,
      );

      expect(result.wordAudioUrl).toBe('');
      expect(result.textAudioUrl).toBe('');
    });

    it('视觉 API 完全失败时应使用降级候选词', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Vision API error'))
        .mockResolvedValueOnce(
          mockVisionResponse('这是"好"，一起来学习吧！'),
        )
        .mockResolvedValueOnce(mockTtsResponse)
        .mockResolvedValueOnce(mockTtsResponse);

      const result = await service.analyze(
        { vocabLevel: 1 },
        1,
        imageBuffer,
      );

      expect(result.word).toBeDefined();
    });

    it('自定义 API Key 应被正确传递', async () => {
      mockedAxios.post
        .mockResolvedValueOnce(
          mockVisionResponse('["花"]'),
        )
        .mockResolvedValueOnce(
          mockVisionResponse('漂亮的花园'),
        )
        .mockResolvedValueOnce(mockTtsResponse)
        .mockResolvedValueOnce(mockTtsResponse);

      await service.analyze(
        { vocabLevel: 1 },
        1,
        imageBuffer,
        'custom-llm-key',
        'custom-tts-key',
        'Kiki',
      );

      // 验证 LLM 调用使用了自定义 key
      const llmCall = mockedAxios.post.mock.calls[0];
      expect(llmCall[2]?.headers?.Authorization).toBe('Bearer custom-llm-key');

      // 验证 TTS 调用使用了自定义 key
      const ttsCall = mockedAxios.post.mock.calls[2];
      expect(ttsCall[2]?.headers?.Authorization).toBe('Bearer custom-tts-key');
    });
  });
});
