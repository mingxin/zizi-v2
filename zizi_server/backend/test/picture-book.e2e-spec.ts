import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * 绘本 e2e 测试
 *
 * 注意: createBook 依赖 DashScope AI API。
 * 如果没有 DASHSCOPE_API_KEY 环境变量，createBook 测试会被跳过。
 * listBooks / getBook / updateBook 不依赖外部 API。
 */
describe('PictureBook (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  let userId: number;
  const testPhone = '19999990010';
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

    // 注册并登录测试用户
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ phone: testPhone, password: testPassword })
      .catch(() => {}); // 可能已存在

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

  describe('GET /api/picture-book', () => {
    it('应返回空列表 (200)', () => {
      return request(app.getHttpServer())
        .get('/api/picture-book')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /api/picture-book/:id (不存在)', () => {
    it('应返回 404', () => {
      return request(app.getHttpServer())
        .get('/api/picture-book/999999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /api/picture-book/:id', () => {
    it('更新不存在的绘本应返回 404', () => {
      return request(app.getHttpServer())
        .patch('/api/picture-book/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '新标题' })
        .expect(404);
    });
  });
});
