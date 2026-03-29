import { Module } from '@nestjs/common';
import { PictureBookController } from './picture-book.controller';
import { PictureBookService } from './picture-book.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [PictureBookController],
  providers: [PictureBookService],
})
export class PictureBookModule {}
