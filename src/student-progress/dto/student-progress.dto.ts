import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ProgressStatus } from '@prisma/client';

export class CreateStudentProgressDto {
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  @IsString({ message: 'ID người dùng phải là chuỗi ký tự' })
  userId: string;

  @IsNotEmpty({ message: 'ID bước học không được để trống' })
  @IsString({ message: 'ID bước học phải là chuỗi ký tự' })
  lessonStepId: string;

  @IsOptional()
  @IsEnum(ProgressStatus, { message: 'Trạng thái tiến độ phải là NOT_STARTED, IN_PROGRESS, hoặc COMPLETED' })
  status?: ProgressStatus;
}

export class UpdateStudentProgressDto {
  @IsOptional()
  @IsEnum(ProgressStatus, { message: 'Trạng thái tiến độ phải là NOT_STARTED, IN_PROGRESS, hoặc COMPLETED' })
  status?: ProgressStatus;
}

export class CreateQuizAttemptDto {
  @IsNotEmpty({ message: 'ID tiến độ học sinh không được để trống' })
  @IsString({ message: 'ID tiến độ học sinh phải là chuỗi ký tự' })
  studentProgressId: string;

  @IsOptional()
  @IsNumber({}, { message: 'Điểm số phải là số' })
  @Min(0, { message: 'Điểm số không được nhỏ hơn 0' })
  @Max(100, { message: 'Điểm số không được lớn hơn 100' })
  score?: number;

  @IsNotEmpty({ message: 'Kết quả đạt/không đạt không được để trống' })
  isPass: boolean;

  @IsOptional()
  statement?: any; // xAPI statement
}

export class UpdateQuizAttemptDto {
  @IsOptional()
  @IsNumber({}, { message: 'Điểm số phải là số' })
  @Min(0, { message: 'Điểm số không được nhỏ hơn 0' })
  @Max(100, { message: 'Điểm số không được lớn hơn 100' })
  score?: number;

  @IsOptional()
  isPass?: boolean;

  @IsOptional()
  statement?: any; // xAPI statement
}

export class ProgressSummaryDto {
  @IsOptional()
  @IsString({ message: 'ID người dùng phải là chuỗi ký tự' })
  userId?: string;

  @IsOptional()
  @IsString({ message: 'ID lớp học phải là chuỗi ký tự' })
  classId?: string;

  @IsOptional()
  @IsString({ message: 'ID khóa học phải là chuỗi ký tự' })
  courseId?: string;

  @IsOptional()
  @IsString({ message: 'ID bài học phải là chuỗi ký tự' })
  lessonId?: string;
}