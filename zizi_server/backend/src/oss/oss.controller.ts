import { Controller, Get, UseGuards } from '@nestjs/common';
import { OssService } from './oss.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('oss')
@UseGuards(JwtAuthGuard)
export class OssController {
  constructor(private oss: OssService) {}

  @Get('sts-token')
  getStsToken() {
    return this.oss.getStsToken();
  }
}
