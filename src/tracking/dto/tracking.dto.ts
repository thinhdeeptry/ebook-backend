import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateTrackingDto {
  @IsString()
  @IsNotEmpty()
  verb: string;

  @IsString()
  @IsNotEmpty()
  objectId: string;

  @IsString()
  @IsOptional()
  contentId?: string;

  @IsObject()
  statement: any; // Complete xAPI statement

  @IsObject()
  @IsOptional()
  result?: any; // Result data (score, completion, etc.)

  @IsObject()
  @IsOptional()
  context?: any; // Context information
}

export class TrackingQueryDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  contentId?: string;

  @IsString()
  @IsOptional()
  verb?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}