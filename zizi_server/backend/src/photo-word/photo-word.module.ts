import { Module } from '@nestjs/common';
import { PhotoWordController } from './photo-word.controller';
import { PhotoWordService } from './photo-word.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [PhotoWordController],
  providers: [PhotoWordService],
})
export class PhotoWordModule {}
