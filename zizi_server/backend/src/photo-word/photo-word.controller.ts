import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoWordService } from './photo-word.service';
import { AnalyzeDto } from './dto/analyze.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('photo-word')
@UseGuards(JwtAuthGuard)
export class PhotoWordController {
  constructor(private service: PhotoWordService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body('vocabLevel') vocabLevelStr: string,
    @Req() req: Request & { user: any },
  ) {
    if (!file) throw new BadRequestException('请提供图片文件');

    const vocabLevel = Number(vocabLevelStr) || 1;
    if (vocabLevel < 1 || vocabLevel > 4) {
      throw new BadRequestException('vocabLevel 必须为 1-4');
    }

    const dto: AnalyzeDto = { vocabLevel };
    const customLlmKey = req.headers['x-custom-llm-key'] as string | undefined;
    const customTtsKey = req.headers['x-custom-tts-key'] as string | undefined;
    const ttsVoice = req.headers['x-tts-voice'] as string | undefined;

    return this.service.analyze(
      dto,
      req.user.id,
      file.buffer,
      customLlmKey,
      customTtsKey,
      ttsVoice,
    );
  }
}
