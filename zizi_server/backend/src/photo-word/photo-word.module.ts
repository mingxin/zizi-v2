import { Module } from '@nestjs/common';
import { PhotoWordController } from './photo-word.controller';
import { PhotoWordService } from './photo-word.service';

@Module({
  controllers: [PhotoWordController],
  providers: [PhotoWordService],
})
export class PhotoWordModule {}
