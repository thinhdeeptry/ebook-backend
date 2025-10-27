import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuizAnalyticsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  pageBlockId: string;

  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty()
  totalAttempts: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  highestScore: number;

  @ApiProperty()
  lowestScore: number;

  @ApiProperty()
  passRate: number;

  @ApiProperty({ required: false })
  averageTimeSpent?: number;

  @ApiProperty()
  lastCalculatedAt: Date;
}

export class QuestionAnalyticsDto {
  @ApiProperty()
  questionId: string;

  @ApiProperty()
  questionText: string;

  @ApiProperty()
  totalResponses: number;

  @ApiProperty()
  correctResponses: number;

  @ApiProperty()
  incorrectResponses: number;

  @ApiProperty()
  correctRate: number;

  @ApiProperty()
  averageTimeSpent: number;

  @ApiProperty({ description: 'Các đáp án được chọn và tần suất' })
  answerDistribution: Record<string, number>;
}

export class StudentQuizPerformanceDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  totalAttempts: number;

  @ApiProperty()
  bestScore: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  lastAttemptScore: number;

  @ApiProperty()
  isPassed: boolean;

  @ApiProperty()
  totalTimeSpent: number;

  @ApiProperty()
  lastAttemptDate: Date;
}

export class ClassQuizAnalyticsDto {
  @ApiProperty()
  quizId: string;

  @ApiProperty()
  quizTitle: string;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  studentsAttempted: number;

  @ApiProperty()
  studentsPassed: number;

  @ApiProperty()
  passRate: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  highestScore: number;

  @ApiProperty()
  lowestScore: number;

  @ApiProperty({ type: [StudentQuizPerformanceDto] })
  studentPerformances: StudentQuizPerformanceDto[];

  @ApiProperty({ type: [QuestionAnalyticsDto] })
  questionAnalytics: QuestionAnalyticsDto[];
}
