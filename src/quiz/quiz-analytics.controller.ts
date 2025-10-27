import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuizAnalyticsService } from './quiz-analytics.service';
import { 
  QuizAnalyticsResponseDto, 
  QuestionAnalyticsDto, 
  StudentQuizPerformanceDto,
  ClassQuizAnalyticsDto 
} from './dto/quiz-analytics.dto';

@ApiTags('Quiz Analytics')
@Controller('quiz-analytics')
@ApiBearerAuth()
export class QuizAnalyticsController {
  constructor(private readonly analyticsService: QuizAnalyticsService) {}

  @Get('quiz/:pageBlockId')
  @ApiOperation({ summary: 'Lấy analytics tổng quan của quiz' })
  @ApiQuery({ name: 'userId', required: false, description: 'Lọc theo user ID (để xem analytics cá nhân)' })
  @ApiResponse({ status: 200, description: 'Quiz analytics', type: QuizAnalyticsResponseDto })
  async getQuizAnalytics(
    @Param('pageBlockId') pageBlockId: string,
    @Query('userId') userId?: string
  ) {
    return this.analyticsService.getQuizAnalytics(pageBlockId, userId);
  }

  @Get('questions/:quizConfigId')
  @ApiOperation({ summary: 'Phân tích chi tiết từng câu hỏi' })
  @ApiResponse({ status: 200, description: 'Question analytics', type: [QuestionAnalyticsDto] })
  async getQuestionAnalytics(@Param('quizConfigId') quizConfigId: string) {
    return this.analyticsService.getQuestionAnalytics(quizConfigId);
  }

  @Get('students/:quizConfigId')
  @ApiOperation({ summary: 'Xem performance của từng học sinh' })
  @ApiResponse({ status: 200, description: 'Student performances', type: [StudentQuizPerformanceDto] })
  async getStudentQuizPerformance(@Param('quizConfigId') quizConfigId: string) {
    return this.analyticsService.getStudentQuizPerformance(quizConfigId);
  }

  @Get('class/:quizConfigId/:classId')
  @ApiOperation({ summary: 'Analytics tổng hợp cho cả lớp' })
  @ApiResponse({ status: 200, description: 'Class quiz analytics', type: ClassQuizAnalyticsDto })
  async getClassQuizAnalytics(
    @Param('quizConfigId') quizConfigId: string,
    @Param('classId') classId: string
  ) {
    return this.analyticsService.getClassQuizAnalytics(quizConfigId, classId);
  }

  @Post('calculate/:pageBlockId')
  @ApiOperation({ summary: 'Tính toán và lưu analytics (Admin/Teacher)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Tính cho user cụ thể' })
  @ApiResponse({ status: 200, description: 'Analytics đã được tính toán', type: QuizAnalyticsResponseDto })
  async calculateAnalytics(
    @Param('pageBlockId') pageBlockId: string,
    @Query('userId') userId?: string
  ) {
    return this.analyticsService.calculateAndSaveAnalytics(pageBlockId, userId);
  }
}
