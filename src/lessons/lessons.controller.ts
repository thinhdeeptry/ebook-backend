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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { LessonsService } from './lessons.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  LessonResponseDto,
  LessonWithBookDto,
  LessonWithPagesDto,
  LessonDetailDto,
  NavigationResponseDto,
} from './dto/lesson.dto';

@ApiTags('Lessons - Quản lý bài học')
@Controller('lessons')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * Tạo bài học mới
   * Chỉ admin và giáo viên mới có thể tạo
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Tạo bài học mới' })
  @ApiResponse({ status: 201, description: 'Tạo bài học thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách hoặc chương' })
  async createLesson(@Body() createLessonDto: CreateLessonDto): Promise<LessonWithBookDto> {
    return this.lessonsService.createLesson(createLessonDto);
  }

  /**
   * Tìm kiếm bài học
   */
  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm bài học theo từ khóa' })
  @ApiResponse({ status: 200, description: 'Tìm kiếm thành công' })
  async searchLessons(
    @Query('keyword') keyword: string,
    @Query('bookId') bookId?: string,
    @Query('chapterId') chapterId?: string,
  ): Promise<LessonWithBookDto[]> {
    return this.lessonsService.searchLessons(keyword, bookId, chapterId);
  }

  /**
   * Lấy danh sách bài học theo sách
   */
  @Get('book/:bookId')
  @ApiOperation({ summary: 'Lấy danh sách bài học theo sách' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getLessonsByBook(@Param('bookId') bookId: string): Promise<LessonResponseDto[]> {
    return this.lessonsService.getLessonsByBook(bookId);
  }

  /**
   * Lấy danh sách bài học theo chương
   */
  @Get('chapter/:chapterId')
  @ApiOperation({ summary: 'Lấy danh sách bài học theo chương' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getLessonsByChapter(@Param('chapterId') chapterId: string): Promise<LessonResponseDto[]> {
    return this.lessonsService.getLessonsByChapter(chapterId);
  }

  /**
   * Lấy thông tin chi tiết bài học
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết bài học' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async getLessonById(@Param('id') id: string): Promise<LessonWithBookDto> {
    return this.lessonsService.getLessonById(id);
  }

  /**
   * Lấy bài học với danh sách trang
   */
  @Get(':id/pages')
  @ApiOperation({ summary: 'Lấy bài học với nội dung các trang' })
  @ApiResponse({ status: 200, description: 'Lấy nội dung thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async getLessonWithPages(@Param('id') id: string): Promise<LessonDetailDto> {
    return this.lessonsService.getLessonWithPages(id);
  }

  /**
   * Lấy navigation của bài học (trước/sau)
   */
  @Get(':id/navigation')
  @ApiOperation({ summary: 'Lấy thông tin navigation bài học' })
  @ApiResponse({ status: 200, description: 'Lấy navigation thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async getLessonNavigation(@Param('id') id: string): Promise<NavigationResponseDto> {
    return this.lessonsService.getLessonNavigation(id);
  }

  /**
   * Cập nhật bài học
   * Chỉ admin và giáo viên mới có thể cập nhật
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật thông tin bài học' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async updateLesson(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<LessonWithBookDto> {
    return this.lessonsService.updateLesson(id, updateLessonDto);
  }

  /**
   * Xóa bài học
   * Chỉ admin mới có thể xóa
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Xóa bài học' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 400, description: 'Không thể xóa do có trang đang sử dụng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async deleteLesson(@Param('id') id: string): Promise<{ message: string }> {
    return this.lessonsService.deleteLesson(id);
  }

  /**
   * Sắp xếp lại thứ tự bài học
   * Chỉ admin và giáo viên mới có thể sắp xếp lại
   */
  @Patch('reorder')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Sắp xếp lại thứ tự bài học' })
  @ApiResponse({ status: 200, description: 'Sắp xếp lại thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async reorderLessons(
    @Body('lessonIds') lessonIds: string[],
    @Query('chapterId') chapterId?: string,
    @Query('bookId') bookId?: string,
  ): Promise<{ message: string }> {
    return this.lessonsService.reorderLessons(lessonIds, chapterId, bookId);
  }
}