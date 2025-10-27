import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import {
  CreateQuizConfigDto,
  UpdateQuizConfigDto,
  QuizConfigResponseDto,
} from './dto/quiz-config.dto';
import {
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  QuizQuestionResponseDto,
} from './dto/quiz-question.dto';
import {
  StartQuizAttemptDto,
  SubmitAnswerDto,
  CompleteQuizAttemptDto,
  QuizResultDto,
} from './dto/quiz-attempt.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Quiz')
@Controller('quiz')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // ==================== QUIZ CONFIG ====================

  @Post('config')
  @ApiOperation({ summary: 'Tạo cấu hình quiz mới (Teacher/Admin)' })
  @ApiResponse({ status: 201, description: 'Quiz config đã được tạo', type: QuizConfigResponseDto })
  async createQuizConfig(@Body() dto: CreateQuizConfigDto) {
    return this.quizService.createQuizConfig(dto);
  }

  @Get('config/page-block/:pageBlockId')
  @ApiOperation({ summary: 'Lấy quiz config theo PageBlock ID' })
  @ApiResponse({ status: 200, description: 'Quiz config', type: QuizConfigResponseDto })
  async getQuizConfigByPageBlock(@Param('pageBlockId') pageBlockId: string) {
    return this.quizService.getQuizConfigByPageBlock(pageBlockId);
  }

  @Put('config/:id')
  @ApiOperation({ summary: 'Cập nhật quiz config (Teacher/Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Quiz config đã được cập nhật',
    type: QuizConfigResponseDto,
  })
  async updateQuizConfig(@Param('id') id: string, @Body() dto: UpdateQuizConfigDto) {
    return this.quizService.updateQuizConfig(id, dto);
  }

  @Delete('config/:id')
  @ApiOperation({ summary: 'Xóa quiz config (Teacher/Admin)' })
  @ApiResponse({ status: 200, description: 'Quiz config đã được xóa' })
  async deleteQuizConfig(@Param('id') id: string) {
    return this.quizService.deleteQuizConfig(id);
  }

  // ==================== QUIZ QUESTIONS ====================

  @Post('question')
  @ApiOperation({ summary: 'Tạo câu hỏi mới (Teacher/Admin)' })
  @ApiResponse({ status: 201, description: 'Câu hỏi đã được tạo', type: QuizQuestionResponseDto })
  async createQuestion(@Body() dto: CreateQuizQuestionDto) {
    return this.quizService.createQuestion(dto);
  }

  @Get('question/quiz-config/:quizConfigId')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi theo quiz config' })
  @ApiResponse({ status: 200, description: 'Danh sách câu hỏi', type: [QuizQuestionResponseDto] })
  async getQuestionsByQuizConfig(@Param('quizConfigId') quizConfigId: string) {
    return this.quizService.getQuestionsByQuizConfig(quizConfigId);
  }

  @Put('question/:id')
  @ApiOperation({ summary: 'Cập nhật câu hỏi (Teacher/Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Câu hỏi đã được cập nhật',
    type: QuizQuestionResponseDto,
  })
  async updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuizQuestionDto) {
    return this.quizService.updateQuestion(id, dto);
  }

  @Delete('question/:id')
  @ApiOperation({ summary: 'Xóa câu hỏi (Teacher/Admin)' })
  @ApiResponse({ status: 200, description: 'Câu hỏi đã được xóa' })
  async deleteQuestion(@Param('id') id: string) {
    return this.quizService.deleteQuestion(id);
  }

  // ==================== QUIZ ATTEMPTS ====================

  @Post('attempt/start')
  @ApiOperation({ summary: 'Bắt đầu làm bài quiz (Student)' })
  @ApiResponse({ status: 201, description: 'Quiz attempt đã được tạo' })
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN, Role.STUDENT)
  async startQuizAttempt(@Body() dto: StartQuizAttemptDto, @Request() req: any) {
    const userId = req.user.id;
    return this.quizService.startQuizAttempt(userId, dto);
  }

  @Post('attempt/submit-answer')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Submit câu trả lời (Student)' })
  @ApiResponse({ status: 200, description: 'Câu trả lời đã được lưu' })
  async submitAnswer(@Body() dto: SubmitAnswerDto, @Request() req: any) {
    const userId = req.user.id;
    return this.quizService.submitAnswer(userId, dto);
  }

  @Post('attempt/complete')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Hoàn thành bài quiz (Student)' })
  @ApiResponse({ status: 200, description: 'Kết quả quiz', type: QuizResultDto })
  async completeQuizAttempt(@Body() dto: CompleteQuizAttemptDto, @Req() req: any) {
    const userId = req.user.id;
    return this.quizService.completeQuizAttempt(userId, dto);
  }
}
