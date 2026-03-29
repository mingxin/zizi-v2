import { Test, TestingModule } from '@nestjs/testing';
import { PictureBookController } from './picture-book.controller';
import { PictureBookService } from './picture-book.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

describe('PictureBookController', () => {
  let controller: PictureBookController;
  let service: PictureBookService;

  const mockService = {
    listBooks: jest.fn(),
    getBook: jest.fn(),
    createBook: jest.fn(),
    updateBook: jest.fn(),
  };

  const mockReq = {
    user: { id: 1 },
    headers: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PictureBookController],
      providers: [{ provide: PictureBookService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PictureBookController>(PictureBookController);
    service = module.get<PictureBookService>(PictureBookService);
    jest.clearAllMocks();
  });

  it('应正确定义控制器', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /picture-book', () => {
    it('应返回用户绘本列表', async () => {
      mockService.listBooks.mockResolvedValue([{ id: 1, title: '绘本1' }]);
      const result = await controller.listBooks(mockReq as any);
      expect(result).toHaveLength(1);
      expect(service.listBooks).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /picture-book/:id', () => {
    it('应返回单个绘本详情', async () => {
      mockService.getBook.mockResolvedValue({ id: 1, title: '绘本1', pages: [] });
      const result = await controller.getBook(1, mockReq as any);
      expect(result.id).toBe(1);
      expect(service.getBook).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('POST /picture-book', () => {
    it('应创建绘本并提取自定义 Headers', async () => {
      mockService.createBook.mockResolvedValue({ id: 1, pageCount: 3 });
      const req = {
        user: { id: 1 },
        headers: {
          'x-custom-llm-key': 'llm-key',
          'x-custom-tts-key': 'tts-key',
          'x-tts-voice': 'Rocky',
        },
      };
      const dto = { imageUrls: ['url1', 'url2'] };

      const result = await controller.createBook(dto, req as any);

      expect(result.id).toBe(1);
      expect(service.createBook).toHaveBeenCalledWith(
        dto,
        1,
        'llm-key',
        'tts-key',
        'Rocky',
      );
    });

    it('无自定义 Headers 时应传 undefined', async () => {
      mockService.createBook.mockResolvedValue({ id: 2 });
      const dto = { imageUrls: ['url1'] };

      await controller.createBook(dto, mockReq as any);

      expect(service.createBook).toHaveBeenCalledWith(
        dto,
        1,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe('PATCH /picture-book/:id', () => {
    it('应更新绘本标题', async () => {
      mockService.updateBook.mockResolvedValue({ id: 1, title: '新标题' });
      const dto = { title: '新标题' };

      const result = await controller.updateBook(1, dto, mockReq as any);

      expect(result.title).toBe('新标题');
      expect(service.updateBook).toHaveBeenCalledWith(1, 1, dto);
    });
  });
});
