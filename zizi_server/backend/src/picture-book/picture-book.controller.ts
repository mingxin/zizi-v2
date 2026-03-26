import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { PictureBookService } from './picture-book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('picture-book')
@UseGuards(JwtAuthGuard)
export class PictureBookController {
  constructor(private service: PictureBookService) {}

  @Get()
  listBooks(@Req() req: Request & { user: any }) {
    return this.service.listBooks(req.user.id);
  }

  @Get(':id')
  getBook(@Param('id', ParseIntPipe) id: number, @Req() req: Request & { user: any }) {
    return this.service.getBook(id, req.user.id);
  }

  @Post()
  createBook(@Body() dto: CreateBookDto, @Req() req: Request & { user: any }) {
    const customLlmKey = req.headers['x-custom-llm-key'] as string | undefined;
    const customTtsKey = req.headers['x-custom-tts-key'] as string | undefined;
    const ttsVoice    = req.headers['x-tts-voice'] as string | undefined;
    return this.service.createBook(dto, req.user.id, customLlmKey, customTtsKey, ttsVoice);
  }
}
