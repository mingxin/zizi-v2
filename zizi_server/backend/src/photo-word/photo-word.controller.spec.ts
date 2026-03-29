import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PhotoWordController } from './photo-word.controller';
import { PhotoWordService } from './photo-word.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

describe('PhotoWordController', () => {
  let controller: PhotoWordController;
  let service: PhotoWordService;

  const mockService = {
    analyze: jest.fn(),
  };

  const mockFile = {
    buffer: Buffer.from('fake-image'),
    mimetype: 'image/jpeg',
    originalname: 'photo.jpg',
  } as Express.Multer.File;

  const mockReq = {
    user: { id: 1 },
    headers: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotoWordController],
      providers: [{ provide: PhotoWordService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PhotoWordController>(PhotoWordController);
    service = module.get<PhotoWordService>(PhotoWordService);
    jest.clearAllMocks();
  });

  it('应正确定义控制器', () => {
    expect(controller).toBeDefined();
  });

  it('无文件时应抛出 BadRequestException', async () => {
    await expect(
      controller.analyze(undefined as any, '1', mockReq as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('vocabLevel 无效时应抛出 BadRequestException', async () => {
    await expect(
      controller.analyze(mockFile, '5', mockReq as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('vocabLevel 缺失时应默认为 1', async () => {
    mockService.analyze.mockResolvedValue({ word: '花', explanation: '漂亮的花' });

    await controller.analyze(mockFile, undefined as any, mockReq as any);

    expect(service.analyze).toHaveBeenCalledWith(
      { vocabLevel: 1 },
      1,
      mockFile.buffer,
      undefined,
      undefined,
      undefined,
    );
  });

  it('应从请求头提取自定义 Key', async () => {
    mockService.analyze.mockResolvedValue({ word: '花' });

    const req = {
      user: { id: 1 },
      headers: {
        'x-custom-llm-key': 'my-key',
        'x-custom-tts-key': 'tts-key',
        'x-tts-voice': 'Kiki',
      },
    };

    await controller.analyze(mockFile, '2', req as any);

    expect(service.analyze).toHaveBeenCalledWith(
      { vocabLevel: 2 },
      1,
      mockFile.buffer,
      'my-key',
      'tts-key',
      'Kiki',
    );
  });
});
