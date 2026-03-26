import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PhotoWordService } from './photo-word.service';
import { AnalyzeDto } from './dto/analyze.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('photo-word')
@UseGuards(JwtAuthGuard)
export class PhotoWordController {
  constructor(private service: PhotoWordService) {}

  @Post('analyze')
  analyze(@Body() dto: AnalyzeDto, @Req() req: Request & { user: any }) {
    const customLlmKey = req.headers['x-custom-llm-key'] as string | undefined;
    const customTtsKey = req.headers['x-custom-tts-key'] as string | undefined;
    const ttsVoice    = req.headers['x-tts-voice'] as string | undefined;
    return this.service.analyze(dto, req.user.id, customLlmKey, customTtsKey, ttsVoice);
  }
}
