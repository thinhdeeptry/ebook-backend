import { IsString, IsOptional } from 'class-validator';

export class TtsRequestDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  lang?: string;
}
