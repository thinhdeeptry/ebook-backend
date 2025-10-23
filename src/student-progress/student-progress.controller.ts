import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentProgressService } from './student-progress.service';
import { 
  CreateStudentProgressDto, 
  UpdateStudentProgressDto, 
  CreateQuizAttemptDto,
  ProgressSummaryDto 
} from './dto/student-progress.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('student-progress')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentProgressController {
  constructor(private readonly studentProgressService: StudentProgressService) {}

  @Post()
  async createProgress(
    @Body() createProgressDto: CreateStudentProgressDto,
    @Request() req,
  ) {
    return this.studentProgressService.createProgress(
      createProgressDto,
      req.user.id,
      req.user.role,
    );
  }

  @Get('user/:userId')
  async getStudentProgress(
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.studentProgressService.getUserProgress(
      userId,
      req.user.id,
      req.user.role,
    );
  }

  @Get('my-progress')
  async getMyProgress(@Request() req) {
    return this.studentProgressService.getUserProgress(
      req.user.id,
      req.user.id,
      req.user.role,
    );
  }

  @Get('summary')
  async getProgressSummary(
    @Query() filters: ProgressSummaryDto,
    @Request() req,
  ) {
    return this.studentProgressService.getProgressSummary(filters);
  }

  @Get('lesson/:lessonId')
  async getLessonProgress(
    @Param('lessonId') lessonId: string,
    @Request() req,
  ) {
    return this.studentProgressService.getProgressByLesson(
      lessonId,
      req.user.id,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Có thể thêm logic kiểm tra quyền ở đây
    return { message: 'Chi tiết tiến độ học tập', id };
  }

  @Patch(':userId/:pageBlockId')
  async updateProgress(
    @Param('userId') userId: string,
    @Param('pageBlockId') pageBlockId: string,
    @Body() updateProgressDto: UpdateStudentProgressDto,
    @Request() req,
  ) {
    return this.studentProgressService.updateProgress(
      userId,
      pageBlockId,
      updateProgressDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':userId/:pageBlockId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProgress(
    @Param('userId') userId: string,
    @Param('pageBlockId') pageBlockId: string,
    @Request() req
  ) {
    return this.studentProgressService.deleteProgress(userId, pageBlockId, req.user.id, req.user.role);
  }

  // Quiz Attempts endpoints
  @Post('quiz-attempt')
  async createQuizAttempt(
    @Body() createAttemptDto: CreateQuizAttemptDto,
    @Request() req,
  ) {
    return this.studentProgressService.createQuizAttempt(
      createAttemptDto,
      req.user.id,
      req.user.role,
    );
  }

  @Get(':progressId/quiz-attempts')
  async getQuizAttempts(
    @Param('progressId') progressId: string,
    @Request() req,
  ) {
    return this.studentProgressService.getQuizAttempts(
      progressId,
      req.user.id,
      req.user.role,
    );
  }
}