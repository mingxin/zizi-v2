import { IsNumber, Min, Max } from 'class-validator';

export class AnalyzeDto {
  @IsNumber()
  @Min(1)
  @Max(4)
  vocabLevel: number;
}
