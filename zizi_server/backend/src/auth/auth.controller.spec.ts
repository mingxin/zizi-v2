import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('应正确定义控制器', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/login', () => {
    const dto = { phone: '13800138000', password: '123456' };

    it('登录成功应返回 token', async () => {
      mockAuthService.login.mockResolvedValue({ token: 'jwt-token' });
      const result = await controller.login(dto);
      expect(result).toEqual({ token: 'jwt-token' });
      expect(service.login).toHaveBeenCalledWith(dto);
    });

    it('凭证错误应抛出 401', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('账号或密码错误'));
      await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/register', () => {
    const dto = { phone: '13800138000', password: '123456' };

    it('注册成功应调用 service', async () => {
      mockAuthService.register.mockResolvedValue(undefined);
      await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
    });

    it('手机号重复应抛出 409', async () => {
      mockAuthService.register.mockRejectedValue(new ConflictException('该手机号已注册'));
      await expect(controller.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('POST /auth/reset-password', () => {
    const dto = { phone: '13800138000', password: 'newpass123' };

    it('重置成功应调用 service', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined);
      await controller.resetPassword(dto);
      expect(service.resetPassword).toHaveBeenCalledWith(dto);
    });

    it('手机号未注册应抛出 404', async () => {
      mockAuthService.resetPassword.mockRejectedValue(new NotFoundException('该手机号未注册'));
      await expect(controller.resetPassword(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
