import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf, MaxLength, IsNumber } from 'class-validator';
import { LessonStepType } from '@prisma/client';

export class CreateLessonStepDto {
  @IsNotEmpty({ message: 'Tiêu đề bước học không được để trống' })
  @IsString({ message: 'Tiêu đề bước học phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề bước học không được vượt quá 255 ký tự' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Mô tả bước học phải là chuỗi ký tự' })
  description?: string;

  @IsNotEmpty({ message: 'Loại bước học không được để trống' })
  @IsEnum(LessonStepType, { message: 'Loại bước học phải là TEXT, VIDEO, hoặc H5P' })
  contentType: LessonStepType;

  @ValidateIf(o => o.contentType === LessonStepType.TEXT)
  @IsNotEmpty({ message: 'Nội dung văn bản không được để trống khi loại bước học là TEXT' })
  @IsString({ message: 'Nội dung văn bản phải là chuỗi ký tự' })
  textContent?: string;

  @ValidateIf(o => o.contentType === LessonStepType.VIDEO)
  @IsNotEmpty({ message: 'URL video không được để trống khi loại bước học là VIDEO' })
  @IsString({ message: 'URL video phải là chuỗi ký tự' })
  videoUrl?: string;

  @ValidateIf(o => o.contentType === LessonStepType.H5P)
  @IsNotEmpty({ message: 'ID nội dung H5P không được để trống khi loại bước học là H5P' })
  @IsString({ message: 'ID nội dung H5P phải là chuỗi ký tự' })
  h5pContentId?: string;

  @IsNotEmpty({ message: 'ID bài học không được để trống' })
  @IsString({ message: 'ID bài học phải là chuỗi ký tự' })
  lessonId: string;

  @IsOptional()
  @IsNumber({}, { message: 'Thứ tự bước học phải là số nguyên' })
  order?: number;
}

export class UpdateLessonStepDto {
  @IsOptional()
  @IsString({ message: 'Tiêu đề bước học phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề bước học không được vượt quá 255 ký tự' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả bước học phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @IsEnum(LessonStepType, { message: 'Loại bước học phải là TEXT, VIDEO, hoặc H5P' })
  contentType?: LessonStepType;

  @IsOptional()
  @IsString({ message: 'Nội dung văn bản phải là chuỗi ký tự' })
  textContent?: string;

  @IsOptional()
  @IsString({ message: 'URL video phải là chuỗi ký tự' })
  videoUrl?: string;

  @IsOptional()
  @IsString({ message: 'ID nội dung H5P phải là chuỗi ký tự' })
  h5pContentId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Thứ tự bước học phải là số nguyên' })
  order?: number;
}

export class ReorderLessonStepsDto {
  @IsNotEmpty({ message: 'Danh sách thứ tự bước học không được để trống' })
  stepIds: string[];
}