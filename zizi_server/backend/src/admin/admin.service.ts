import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, phone: true, role: true, isBanned: true, createdAt: true,
          _count: { select: { books: true, photoWords: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, total, page, limit };
  }

  async toggleBan(id: number) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return this.prisma.user.update({ where: { id }, data: { isBanned: !user.isBanned } });
  }

  async listBooks(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, phone: true } },
          _count: { select: { pages: true } },
        },
      }),
      this.prisma.book.count(),
    ]);
    return { data: books, total, page, limit };
  }

  async deleteBook(id: number) {
    return this.prisma.book.delete({ where: { id } });
  }

  async listPhotoWords(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.prisma.photoWord.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, phone: true } } },
      }),
      this.prisma.photoWord.count(),
    ]);
    return { data: records, total, page, limit };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalUsers, totalBooks, totalPhotoWords, todayUsers, todayBooks, todayPhotoWords] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.book.count(),
      this.prisma.photoWord.count(),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.book.count({ where: { createdAt: { gte: today } } }),
      this.prisma.photoWord.count({ where: { createdAt: { gte: today } } }),
    ]);
    return { totalUsers, totalBooks, totalPhotoWords, todayUsers, todayBooks, todayPhotoWords };
  }

  async getConfig() {
    return this.prisma.appConfig.findMany();
  }

  async updateConfig(entries: { key: string; value: string }[]) {
    await Promise.all(
      entries.map(e =>
        this.prisma.appConfig.upsert({
          where: { key: e.key },
          create: { key: e.key, value: e.value },
          update: { value: e.value },
        }),
      ),
    );
    return this.prisma.appConfig.findMany();
  }
}
