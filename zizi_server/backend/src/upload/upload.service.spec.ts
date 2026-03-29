import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import { UploadService } from './upload.service';

jest.mock('fs');

describe('UploadService', () => {
  let service: UploadService;
  const mockDir = '/mock/uploads/images';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
    jest.clearAllMocks();
  });

  it('应正确定义服务', () => {
    expect(service).toBeDefined();
  });

  describe('saveFile', () => {
    it('应保存文件并返回 URL 路径', async () => {
      const buffer = Buffer.from('test-image-data');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      // mock Date.now to return a fixed value
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1700000000000);

      const result = await service.saveFile(buffer, 'images', 'jpg', 'photo');

      Date.now = originalDateNow;

      expect(result).toMatch(/^\/api\/static\/images\/photo_\d+_[a-f0-9]+\.jpg$/);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('应在目录不存在时自动创建', async () => {
      const buffer = Buffer.from('test');
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      await service.saveFile(buffer, 'audio', 'mp3');

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('audio'),
        { recursive: true },
      );
    });

    it('应清理扩展名前导点', async () => {
      const buffer = Buffer.from('test');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      const result = await service.saveFile(buffer, 'images', '.jpg');

      expect(result).toMatch(/\.jpg$/);
      expect(result).not.toMatch(/\.\.jpg$/);
    });

    it('无前缀时文件名不应包含前缀分隔符', async () => {
      const buffer = Buffer.from('test');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      const result = await service.saveFile(buffer, 'images', 'png');

      // URL 中文件名部分不应以 _ 开头
      const filename = result.split('/').pop()!;
      expect(filename[0]).not.toBe('_');
    });

    it('不同次调用应生成不同文件名', async () => {
      const buffer = Buffer.from('test');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      const results = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const result = await service.saveFile(buffer, 'images', 'jpg');
        results.add(result);
      }

      // 由于包含随机 hex 和时间戳，每次应不同
      expect(results.size).toBe(10);
    });
  });
});
