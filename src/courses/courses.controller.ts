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
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseResponseDto,
  CourseWithClassDto,
  CourseWithLessonsDto,
  CourseDetailDto,
} from './dto/course.dto';

@Controller('courses')
@UseGuards(AuthGuard('jwt'))
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * Tạo khóa học mới
   * Chỉ admin và giáo viên mới có thể tạo
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async createCourse(@Body() createCourseDto: CreateCourseDto): Promise<CourseWithClassDto> {
    return this.coursesService.createCourse(createCourseDto);
  }

  /**
   * Lấy danh sách tất cả khóa học
   * Có thể lọc theo lớp học và trạng thái xuất bản
   */
  @Get()
  async getAllCourses(
    @Query('includeCount') includeCount?: string,
    @Query('classId') classId?: string,
    @Query('isPublished') isPublished?: string
  ): Promise<CourseWithClassDto[]> {
    const shouldIncludeCount = includeCount !== 'false';
    const publishedFilter = isPublished === 'true' ? true : isPublished === 'false' ? false : undefined;
    
    return this.coursesService.getAllCourses(shouldIncludeCount, classId, publishedFilter);
  }

  /**
   * Tìm kiếm khóa học
   */
  @Get('search')
  async searchCourses(
    @Query('keyword') keyword: string,
    @Query('classId') classId?: string,
    @Query('isPublished') isPublished?: string
  ): Promise<CourseWithClassDto[]> {
    if (!keyword || keyword.trim() === '') {
      return [];
    }

    const publishedFilter = isPublished === 'true' ? true : isPublished === 'false' ? false : undefined;
    
    return this.coursesService.searchCourses(keyword.trim(), classId, publishedFilter);
  }

  /**
   * Lấy khóa học theo lớp
   */
  @Get('by-class/:classId')
  async getCoursesByClass(
    @Param('classId') classId: string,
    @Query('isPublished') isPublished?: string
  ): Promise<CourseResponseDto[]> {
    const publishedFilter = isPublished === 'true' ? true : isPublished === 'false' ? false : undefined;
    
    return this.coursesService.getCoursesByClass(classId, publishedFilter);
  }

  /**
   * Lấy thông tin chi tiết khóa học
   */
  @Get(':courseId')
  async getCourseById(@Param('courseId') courseId: string): Promise<CourseWithClassDto> {
    return this.coursesService.getCourseById(courseId);
  }

  /**
   * Lấy khóa học với danh sách bài học
   */
  @Get(':courseId/lessons')
  async getCourseWithLessons(@Param('courseId') courseId: string): Promise<CourseDetailDto> {
    return this.coursesService.getCourseWithLessons(courseId);
  }

  /**
   * Cập nhật thông tin khóa học
   * Chỉ admin và giáo viên mới có thể cập nhật
   */
  @Put(':courseId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async updateCourse(
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCourseDto
  ): Promise<CourseWithClassDto> {
    return this.coursesService.updateCourse(courseId, updateCourseDto);
  }

  /**
   * Xuất bản/hủy xuất bản khóa học
   * Chỉ admin và giáo viên mới có thể thực hiện
   */
  @Patch(':courseId/toggle-publish')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async togglePublishCourse(@Param('courseId') courseId: string): Promise<CourseWithClassDto> {
    return this.coursesService.togglePublishCourse(courseId);
  }

  /**
   * Xóa khóa học
   * Chỉ admin mới có thể xóa
   */
  @Delete(':courseId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCourse(@Param('courseId') courseId: string) {
    return this.coursesService.deleteCourse(courseId);
  }
}