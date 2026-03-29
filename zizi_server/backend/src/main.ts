import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET 环境变量未配置，服务拒绝启动');
  }

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // 托管本地 uploads 目录为静态文件（开发阶段替代 OSS）
  app.use('/api/static', express.static(path.resolve(process.cwd(), 'uploads')));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
