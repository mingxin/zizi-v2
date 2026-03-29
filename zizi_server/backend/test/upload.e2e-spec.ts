import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Upload (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  const testPhone = '19999990011';
  const testPassword = 'test123456';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // 注册并登录
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ phone: testPhone, password: testPassword })
      .catch(() => {});

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone: testPhone, password: testPassword });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    try {
      await prisma.photoWord.deleteMany({ where: { user: { phone: testPhone } } });
      await prisma.book.deleteMany({ where: { user: { phone: testPhone } } });
      await prisma.user.deleteMany({ where: { phone: testPhone } });
    } catch {
      // ignore
    }
    await app.close();
  });

  describe('POST /api/upload/image', () => {
    it('无文件应返回 400', () => {
      return request(app.getHttpServer())
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('无 token 应返回 401', () => {
      return request(app.getHttpServer())
        .post('/api/upload/image')
        .attach('file', Buffer.from('fake'), 'test.jpg')
        .expect(401);
    });

    it('上传有效图片应返回 URL (201)', () => {
      // 创建一个最小的 1x1 JPEG buffer
      const minJpeg = Buffer.from(
        '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYI4Q/SFhSRFEiN0FeUzR1eVlBZ1iOTZoaSjs2P/2gAMAwEAAhEDEQA/APf6oooA//2Q==',
        'base64',
      );

      return request(app.getHttpServer())
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', minJpeg, 'test.jpg')
        .expect(201)
        .expect((res) => {
          expect(res.body.url).toBeDefined();
          expect(res.body.url).toMatch(/^\/api\/static\//);
        });
    });
  });
});
