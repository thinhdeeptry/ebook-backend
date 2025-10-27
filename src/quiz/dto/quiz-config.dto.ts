import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizConfigDto {
  @ApiProperty({ description: 'ID của PageBlock chứa quiz' })
  @IsString()
  pageBlockId: string;

  @ApiProperty({ description: 'Tiêu đề bài tập' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả bài tập' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Điểm đạt yêu cầu (%)', minimum: 0, maximum: 100, default: 70 })
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore: number;

  @ApiProperty({ description: 'Trọng số bài tập', minimum: 0, default: 1.0 })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiPropertyOptional({ description: 'Số lần làm tối đa (null = không giới hạn)' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({ description: 'Thời gian làm bài (phút, null = không giới hạn)' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  timeLimit?: number;

  @ApiProperty({ description: 'Xáo trộn câu hỏi', default: false })
  @IsBoolean()
  shuffleQuestions: boolean;

  @ApiProperty({ description: 'Hiển thị phản hồi sau khi trả lời', default: true })
  @IsBoolean()
  showFeedback: boolean;

  @ApiProperty({ description: 'Hiển thị đáp án đúng', default: true })
  @IsBoolean()
  showCorrectAnswers: boolean;

  @ApiProperty({ description: 'Cho phép xem lại bài', default: true })
  @IsBoolean()
  allowReview: boolean;
}

export class UpdateQuizConfigDto {
  @ApiPropertyOptional({ description: 'Tiêu đề bài tập' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Mô tả bài tập' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Điểm đạt yêu cầu (%)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  passingScore?: number;

  @ApiPropertyOptional({ description: 'Trọng số bài tập' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Số lần làm tối đa' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxAttempts?: number;

  @ApiPropertyOptional({ description: 'Thời gian làm bài (phút)' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Xáo trộn câu hỏi' })
  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ description: 'Hiển thị phản hồi' })
  @IsBoolean()
  @IsOptional()
  showFeedback?: boolean;

  @ApiPropertyOptional({ description: 'Hiển thị đáp án đúng' })
  @IsBoolean()
  @IsOptional()
  showCorrectAnswers?: boolean;

  @ApiPropertyOptional({ description: 'Cho phép xem lại bài' })
  @IsBoolean()
  @IsOptional()
  allowReview?: boolean;
}

export class QuizConfigResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  pageBlockId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  passingScore: number;

  @ApiProperty()
  weight: number;

  @ApiProperty({ required: false })
  maxAttempts?: number;

  @ApiProperty({ required: false })
  timeLimit?: number;

  @ApiProperty()
  shuffleQuestions: boolean;

  @ApiProperty()
  showFeedback: boolean;

  @ApiProperty()
  showCorrectAnswers: boolean;

  @ApiProperty()
  allowReview: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
