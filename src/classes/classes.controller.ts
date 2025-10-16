import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ClassesService } from './classes.service';
import {
  CreateClassDto,
  UpdateClassDto,
  AddStudentToClassDto,
  ClassResponseDto,
  ClassWithMembersDto,
  ClassWithCoursesDto,
} from './dto/class.dto';

@Controller('classes')
@UseGuards(AuthGuard('jwt'))
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  /**
   * Tạo lớp học mới
   * Chỉ admin và giáo viên mới có thể tạo
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async createClass(@Body() createClassDto: CreateClassDto): Promise<ClassResponseDto> {
    return this.classesService.createClass(createClassDto);
  }

  /**
   * Lấy danh sách tất cả các lớp học
   * Tất cả người dùng đã đăng nhập đều có thể xem
   */
  @Get()
  async getAllClasses(
    @Query('includeCount') includeCount?: string
  ): Promise<ClassResponseDto[]> {
    const shouldIncludeCount = includeCount !== 'false';
    return this.classesService.getAllClasses(shouldIncludeCount);
  }

  /**
   * Lấy thông tin chi tiết một lớp học
   */
  @Get(':classId')
  async getClassById(@Param('classId') classId: string): Promise<ClassResponseDto> {
    return this.classesService.getClassById(classId);
  }

  /**
   * Lấy thông tin lớp học bao gồm danh sách học sinh
   * Chỉ admin và giáo viên mới có thể xem danh sách học sinh
   */
  @Get(':classId/members')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async getClassWithMembers(
    @Param('classId') classId: string
  ): Promise<ClassWithMembersDto> {
    return this.classesService.getClassWithMembers(classId);
  }

  /**
   * Lấy thông tin lớp học bao gồm danh sách khóa học
   */
  @Get(':classId/courses')
  async getClassWithCourses(
    @Param('classId') classId: string
  ): Promise<ClassWithCoursesDto> {
    return this.classesService.getClassWithCourses(classId);
  }

  /**
   * Lấy danh sách học sinh có thể thêm vào lớp
   * Chỉ admin và giáo viên mới có thể thực hiện
   */
  @Get(':classId/available-students')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async getAvailableStudents(@Param('classId') classId: string) {
    return this.classesService.getAvailableStudents(classId);
  }

  /**
   * Cập nhật thông tin lớp học
   * Chỉ admin và giáo viên mới có thể cập nhật
   */
  @Put(':classId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async updateClass(
    @Param('classId') classId: string,
    @Body() updateClassDto: UpdateClassDto
  ): Promise<ClassResponseDto> {
    return this.classesService.updateClass(classId, updateClassDto);
  }

  /**
   * Xóa lớp học
   * Chỉ admin mới có thể xóa
   */
  @Delete(':classId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteClass(@Param('classId') classId: string) {
    return this.classesService.deleteClass(classId);
  }

  /**
   * Thêm học sinh vào lớp
   * Chỉ admin và giáo viên mới có thể thực hiện
   */
  @Post(':classId/students')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async addStudentToClass(
    @Param('classId') classId: string,
    @Body() addStudentDto: AddStudentToClassDto
  ) {
    return this.classesService.addStudentToClass(classId, addStudentDto.userId);
  }

  /**
   * Xóa học sinh khỏi lớp
   * Chỉ admin và giáo viên mới có thể thực hiện
   */
  @Delete(':classId/students/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async removeStudentFromClass(
    @Param('classId') classId: string,
    @Param('userId') userId: string
  ) {
    return this.classesService.removeStudentFromClass(classId, userId);
  }
}