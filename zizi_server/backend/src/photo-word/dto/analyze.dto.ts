import { IsString, IsNumber, Min, Max } from 'class-validator';

export class AnalyzeDto {
  @IsString()
  imageUrl: string;

  @IsNumber()
  @Min(1)
  @Max(4)
  vocabLevel: number;
}
