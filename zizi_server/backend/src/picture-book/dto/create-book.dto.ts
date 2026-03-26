import { IsArray, IsString } from 'class-validator';

export class CreateBookDto {
  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];
}
