import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // 清理测试用户
    try {
      await prisma.user.deleteMany({
        where: { phone: { startsWith: '1999999' } },
      });
    } catch {
      // ignore if cleanup fails
    }
    await app.close();
  });

  const testPhone = '19999990001';
  const testPassword = 'test123456';

  describe('POST /api/auth/register', () => {
    it('应成功注册新用户 (201)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ phone: testPhone, password: testPassword })
        .expect(201);
    });

    it('重复手机号应返回 409', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ phone: testPhone, password: testPassword })
        .expect(409);
    });

    it('无效手机号应返回 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ phone: '123', password: testPassword })
        .expect(400);
    });

    it('密码太短应返回 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ phone: '19999990002', password: '123' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('应成功登录并返回 JWT token (200)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone: testPhone, password: testPassword })
        .expect(200)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          expect(typeof res.body.token).toBe('string');
        });
    });

    it('错误密码应返回 401', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone: testPhone, password: 'wrongpassword' })
        .expect(401);
    });

    it('不存在的手机号应返回 401', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone: '19999999999', password: testPassword })
        .expect(401);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('应成功重置密码 (200)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ phone: testPhone, password: 'newpassword123' })
        .expect(200);
    });

    it('重置后应能用新密码登录', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone: testPhone, password: 'newpassword123' })
        .expect(200);
    });

    it('未注册手机号应返回 404', () => {
      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ phone: '19999999998', password: 'something123' })
        .expect(404);
    });
  });

  describe('JWT 认证保护', () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone: testPhone, password: 'newpassword123' });
      token = res.body.token;
    });

    it('无 token 访问受保护路由应返回 401', () => {
      return request(app.getHttpServer())
        .get('/api/picture-book')
        .expect(401);
    });

    it('带有效 token 访问受保护路由应成功 (200)', () => {
      return request(app.getHttpServer())
        .get('/api/picture-book')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('伪造 token 应返回 401', () => {
      return request(app.getHttpServer())
        .get('/api/picture-book')
        .set('Authorization', 'Bearer fake-token-12345')
        .expect(401);
    });
  });
});
