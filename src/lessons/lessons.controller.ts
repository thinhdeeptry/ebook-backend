import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { LessonsService } from './lessons.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  ReorderLessonsDto,
  LessonResponseDto,
  LessonWithCourseDto,
  LessonWithStepsDto,
  LessonDetailDto,
  NavigationResponseDto,
} from './dto/lesson.dto';

@Controller('lessons')
@UseGuards(AuthGuard('jwt'))
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * Tạo bài học mới
   * Chỉ admin và giáo viên mới có thể tạo
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async createLesson(@Body() createLessonDto: CreateLessonDto): Promise<LessonWithCourseDto> {
    return this.lessonsService.createLesson(createLessonDto);
  }

  /**
   * Tìm kiếm bài học
   */
  @Get('search')
  async searchLessons(
    @Query('keyword') keyword: string,
    @Query('courseId') courseId?: string
  ): Promise<LessonWithCourseDto[]> {
    if (!keyword || keyword.trim() === '') {
      return [];
    }

    return this.lessonsService.searchLessons(keyword.trim(), courseId);
  }

  /**
   * Lấy bài học theo khóa học
   */
  @Get('by-course/:courseId')
  async getLessonsByCourse(
    @Param('courseId') courseId: string
  ): Promise<LessonResponseDto[]> {
    return this.lessonsService.getLessonsByCourse(courseId);
  }

  /**
   * Lấy thông tin chi tiết bài học
   */
  @Get(':lessonId')
  async getLessonById(@Param('lessonId') lessonId: string): Promise<LessonWithCourseDto> {
    return this.lessonsService.getLessonById(lessonId);
  }

  /**
   * Lấy bài học với danh sách các bước học
   */
  @Get(':lessonId/steps')
  async getLessonWithSteps(@Param('lessonId') lessonId: string): Promise<LessonDetailDto> {
    return this.lessonsService.getLessonWithSteps(lessonId);
  }

  /**
   * Lấy thông tin navigation cho bài học (trước/sau)
   */
  @Get(':lessonId/navigation')
  async getLessonNavigation(@Param('lessonId') lessonId: string): Promise<NavigationResponseDto> {
    return this.lessonsService.getLessonNavigation(lessonId);
  }

  /**
   * Cập nhật thông tin bài học
   * Chỉ admin và giáo viên mới có thể cập nhật
   */
  @Put(':lessonId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto
  ): Promise<LessonWithCourseDto> {
    return this.lessonsService.updateLesson(lessonId, updateLessonDto);
  }

  /**
   * Sao chép bài học
   * Chỉ admin và giáo viên mới có thể thực hiện
   */
  @Post(':lessonId/duplicate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async duplicateLesson(
    @Param('lessonId') lessonId: string,
    @Body('newTitle') newTitle?: string
  ): Promise<LessonWithCourseDto> {
    return this.lessonsService.duplicateLesson(lessonId, newTitle);
  }

  /**
   * Sắp xếp lại thứ tự các bài học trong khóa học
   * Chỉ admin và giáo viên mới có thể thực hiện
   */
  @Patch('course/:courseId/reorder')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async reorderLessons(
    @Param('courseId') courseId: string,
    @Body() reorderDto: ReorderLessonsDto
  ) {
    return this.lessonsService.reorderLessons(courseId, reorderDto.lessonIds);
  }

  /**
   * Xóa bài học
   * Chỉ admin mới có thể xóa
   */
  @Delete(':lessonId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteLesson(@Param('lessonId') lessonId: string) {
    return this.lessonsService.deleteLesson(lessonId);
  }
}