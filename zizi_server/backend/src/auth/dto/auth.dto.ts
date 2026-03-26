import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone: string;

  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone: string;

  @MinLength(6)
  password: string;
}

export class ResetPasswordDto {
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone: string;

  @MinLength(6)
  password: string;
}
