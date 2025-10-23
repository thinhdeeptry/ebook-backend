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
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto, BookQueryDto } from './dto/book.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Books - Quản lý sách giáo khoa')
@Controller('books')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Tạo sách giáo khoa mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo sách thành công',
    schema: {
      example: {
        id: 'book-id',
        title: 'Sách giáo khoa Toán lớp 1',
        subject: 'Toán học',
        grade: 1,
        description: 'Sách giáo khoa Toán học dành cho học sinh lớp 1',
        coverImage: null,
        publisher: 'Nhà xuất bản Giáo dục Việt Nam',
        isPublished: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        classes: [
          {
            id: 'class-1',
            name: 'Lớp 1',
            gradeLevel: 1
          }
        ],
        _count: {
          chapters: 2,
          lessons: 5
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.createBook(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sách giáo khoa' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo từ khóa' })
  @ApiQuery({ name: 'subject', required: false, description: 'Lọc theo môn học' })
  @ApiQuery({ name: 'grade', required: false, type: Number, description: 'Lọc theo khối lớp' })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean, description: 'Lọc theo trạng thái xuất bản' })
  @ApiQuery({ name: 'classId', required: false, description: 'Lọc theo lớp học' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sách thành công',
    schema: {
      example: [
        {
          id: 'book-id',
          title: 'Sách giáo khoa Toán lớp 1',
          subject: 'Toán học',
          grade: 1,
          description: 'Sách giáo khoa Toán học dành cho học sinh lớp 1',
          coverImage: null,
          publisher: 'Nhà xuất bản Giáo dục Việt Nam',
          isPublished: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          classes: [
            {
              id: 'class-1',
              name: 'Lớp 1',
              gradeLevel: 1
            }
          ],
          _count: {
            chapters: 2,
            lessons: 5
          }
        }
      ]
    }
  })
  findAll(@Query() query: BookQueryDto) {
    return this.booksService.getAllBooks(query);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Lấy sách theo lớp học' })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean, description: 'Lọc theo trạng thái xuất bản' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách sách theo lớp thành công' })
  findByClass(
    @Param('classId') classId: string,
    @Query('isPublished', new ParseBoolPipe({ optional: true })) isPublished?: boolean,
  ) {
    return this.booksService.getBooksByClass(classId, isPublished);
  }

  @Get('subject/:subject/grade/:grade')
  @ApiOperation({ summary: 'Lấy sách theo môn học và khối lớp' })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean, description: 'Lọc theo trạng thái xuất bản' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách sách theo môn học và khối lớp thành công' })
  findBySubjectAndGrade(
    @Param('subject') subject: string,
    @Param('grade', ParseIntPipe) grade: number,
    @Query('isPublished', new ParseBoolPipe({ optional: true })) isPublished?: boolean,
  ) {
    return this.booksService.getBooksBySubjectAndGrade(subject, grade, isPublished);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sách thành công',
    schema: {
      example: {
        id: 'book-id',
        title: 'Sách giáo khoa Toán lớp 1',
        subject: 'Toán học',
        grade: 1,
        description: 'Sách giáo khoa Toán học dành cho học sinh lớp 1',
        coverImage: null,
        publisher: 'Nhà xuất bản Giáo dục Việt Nam',
        isPublished: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        classes: [
          {
            id: 'class-1',
            name: 'Lớp 1',
            gradeLevel: 1
          }
        ],
        _count: {
          chapters: 2,
          lessons: 5
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách' })
  findOne(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }

  @Get(':id/content')
  @ApiOperation({ summary: 'Lấy nội dung sách (chương và bài học)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy nội dung sách thành công',
    schema: {
      example: {
        id: 'book-id',
        title: 'Sách giáo khoa Toán lớp 1',
        subject: 'Toán học',
        grade: 1,
        classes: [
          {
            id: 'class-1',
            name: 'Lớp 1',
            gradeLevel: 1
          }
        ],
        chapters: [
          {
            id: 'chapter-1',
            title: 'Chương 1: Những kiến thức cơ bản',
            order: 1,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Bài 1: Đếm từ 1 đến 5',
                order: 1,
                _count: { pages: 3 }
              }
            ]
          }
        ],
        lessons: [],
        _count: {
          chapters: 2,
          lessons: 5
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách' })
  getBookContent(@Param('id') id: string) {
    return this.booksService.getBookWithChaptersAndLessons(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Cập nhật thông tin sách' })
  @ApiResponse({ status: 200, description: 'Cập nhật sách thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách' })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.updateBook(id, updateBookDto);
  }

  @Patch(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Xuất bản/hủy xuất bản sách' })
  @ApiResponse({ status: 200, description: 'Thay đổi trạng thái xuất bản thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách' })
  togglePublish(@Param('id') id: string) {
    return this.booksService.togglePublishBook(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa sách' })
  @ApiResponse({ status: 204, description: 'Xóa sách thành công' })
  @ApiResponse({ status: 400, description: 'Không thể xóa sách vì có chương/bài học đang sử dụng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách' })
  remove(@Param('id') id: string) {
    return this.booksService.deleteBook(id);
  }
}