import { IsString, MaxLength } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @MaxLength(100)
  title: string;
}
