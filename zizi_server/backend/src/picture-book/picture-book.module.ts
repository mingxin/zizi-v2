import { Module } from '@nestjs/common';
import { PictureBookController } from './picture-book.controller';
import { PictureBookService } from './picture-book.service';

@Module({
  controllers: [PictureBookController],
  providers: [PictureBookService],
})
export class PictureBookModule {}
