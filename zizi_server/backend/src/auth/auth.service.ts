import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('账号或密码错误');
    }
    if (user.isBanned) throw new UnauthorizedException('账号已被封禁');
    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return { token };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (exists) throw new ConflictException('该手机号已注册');
    const hash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({ data: { phone: dto.phone, password: hash } });
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new NotFoundException('该手机号未注册');
    const hash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { password: hash } });
  }
}
