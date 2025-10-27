import { IsString, IsArray, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AnswerDto {
  @ApiProperty({ description: 'ID câu hỏi' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Câu trả lời của học sinh', example: { selectedOption: 'a' } })
  @IsObject()
  userAnswer: any;

  @ApiPropertyOptional({ description: 'Thời gian làm câu này (giây)' })
  @IsOptional()
  timeSpent?: number;
}

export class StartQuizAttemptDto {
  @ApiProperty({ description: 'ID của PageBlock chứa quiz' })
  @IsString()
  pageBlockId: string;
}

export class SubmitAnswerDto {
  @ApiProperty({ description: 'ID của quiz attempt' })
  @IsString()
  attemptId: string;

  @ApiProperty({ description: 'ID câu hỏi' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Câu trả lời', example: { selectedOption: 'a' } })
  @IsObject()
  userAnswer: any;

  @ApiPropertyOptional({ description: 'Thời gian làm câu này (giây)' })
  @IsOptional()
  timeSpent?: number;
}

export class CompleteQuizAttemptDto {
  @ApiProperty({ description: 'ID của quiz attempt' })
  @IsString()
  attemptId: string;

  @ApiProperty({ description: 'Danh sách câu trả lời', type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class QuizAttemptResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentProgressId: string;

  @ApiProperty()
  attemptNumber: number;

  @ApiProperty({ required: false })
  score?: number;

  @ApiProperty({ required: false })
  maxScore?: number;

  @ApiProperty()
  isPass: boolean;

  @ApiProperty({ required: false })
  duration?: number;

  @ApiProperty({ required: false })
  submittedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  statement?: any;
}

export class QuizResultDto {
  @ApiProperty()
  attemptId: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  maxScore: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  isPass: boolean;

  @ApiProperty()
  passingScore: number;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  correctAnswers: number;

  @ApiProperty()
  incorrectAnswers: number;

  @ApiProperty({ type: 'object' })
  questionResults: Array<{
    questionId: string;
    questionText: string;
    userAnswer: any;
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
    correctAnswer?: any;
    feedback?: string;
  }>;
}

export class QuizAttemptHistoryDto {
  @ApiProperty()
  attemptNumber: number;

  @ApiProperty()
  score: number;

  @ApiProperty()
  isPass: boolean;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  submittedAt: Date;

  @ApiProperty()
  canReview: boolean;
}
