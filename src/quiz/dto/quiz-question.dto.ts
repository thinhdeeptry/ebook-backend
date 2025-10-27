import { IsString, IsNumber, IsObject, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizQuestionDto {
  @ApiProperty({ description: 'ID của QuizConfig' })
  @IsString()
  quizConfigId: string;

  @ApiProperty({ description: 'Nội dung câu hỏi' })
  @IsString()
  questionText: string;

  @ApiProperty({ description: 'Loại câu hỏi', enum: ['multiple-choice', 'true-false', 'fill-blank', 'essay'] })
  @IsString()
  questionType: string;

  @ApiProperty({ description: 'Thứ tự câu hỏi' })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({ description: 'Điểm số câu hỏi', minimum: 0 })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiPropertyOptional({ description: 'ID H5P Content (nếu câu hỏi dùng H5P)' })
  @IsString()
  @IsOptional()
  h5pContentId?: string;

  @ApiProperty({ 
    description: 'Metadata câu hỏi (options, correctAnswer, etc.)',
    example: {
      options: [
        { id: 'a', text: 'Đáp án A', isCorrect: true },
        { id: 'b', text: 'Đáp án B', isCorrect: false }
      ]
    }
  })
  @IsObject()
  metadata: any;
}

export class UpdateQuizQuestionDto {
  @ApiPropertyOptional({ description: 'Nội dung câu hỏi' })
  @IsString()
  @IsOptional()
  questionText?: string;

  @ApiPropertyOptional({ description: 'Loại câu hỏi' })
  @IsString()
  @IsOptional()
  questionType?: string;

  @ApiPropertyOptional({ description: 'Thứ tự câu hỏi' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'Điểm số câu hỏi' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ description: 'Metadata câu hỏi' })
  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class QuizQuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quizConfigId: string;

  @ApiProperty()
  questionText: string;

  @ApiProperty()
  questionType: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  points: number;

  @ApiProperty({ required: false })
  h5pContentId?: string;

  @ApiProperty()
  metadata: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class QuizQuestionForStudentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  questionText: string;

  @ApiProperty()
  questionType: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  points: number;

  @ApiProperty({ required: false })
  h5pContentId?: string;

  @ApiProperty({ 
    description: 'Metadata không bao gồm đáp án đúng',
    example: {
      options: [
        { id: 'a', text: 'Đáp án A' },
        { id: 'b', text: 'Đáp án B' }
      ]
    }
  })
  metadata: any;
}
