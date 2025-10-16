import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo khóa học mới
   */
  async createCourse(createCourseDto: CreateCourseDto) {
    try {
      // Kiểm tra lớp học có tồn tại không
      const classExists = await this.prisma.class.findUnique({
        where: { id: createCourseDto.classId },
      });

      if (!classExists) {
        throw new NotFoundException(`Không tìm thấy lớp học có ID: ${createCourseDto.classId}`);
      }

      const newCourse = await this.prisma.course.create({
        data: createCourseDto,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
              description: true,
            },
          },
          _count: {
            select: { lessons: true },
          },
        },
      });

      return newCourse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tạo khóa học: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách tất cả khóa học
   */
  async getAllCourses(includeCount = true, classId?: string, isPublished?: boolean) {
    try {
      const whereConditions: any = {};
      
      if (classId) {
        whereConditions.classId = classId;
      }
      
      if (isPublished !== undefined) {
        whereConditions.isPublished = isPublished;
      }

      const courses = await this.prisma.course.findMany({
        where: whereConditions,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
              description: true,
            },
          },
          ...(includeCount && {
            _count: {
              select: { lessons: true },
            },
          }),
        },
        orderBy: [
          { class: { gradeLevel: 'asc' } },
          { createdAt: 'desc' },
        ],
      });

      return courses;
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách khóa học: ${error.message}`);
    }
  }

  /**
   * Lấy khóa học theo lớp
   */
  async getCoursesByClass(classId: string, isPublished?: boolean) {
    try {
      const whereConditions: any = { classId };
      
      if (isPublished !== undefined) {
        whereConditions.isPublished = isPublished;
      }

      const courses = await this.prisma.course.findMany({
        where: whereConditions,
        include: {
          _count: {
            select: { lessons: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return courses;
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách khóa học: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin chi tiết khóa học
   */
  async getCourseById(courseId: string) {
    try {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
              description: true,
            },
          },
          _count: {
            select: { lessons: true },
          },
        },
      });

      if (!course) {
        throw new NotFoundException(`Không tìm thấy khóa học có ID: ${courseId}`);
      }

      return course;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy thông tin khóa học: ${error.message}`);
    }
  }

  /**
   * Lấy khóa học với danh sách bài học
   */
  async getCourseWithLessons(courseId: string) {
    try {
      const courseWithLessons = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
              description: true,
            },
          },
          lessons: {
            include: {
              _count: {
                select: { steps: true },
              },
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { lessons: true },
          },
        },
      });

      if (!courseWithLessons) {
        throw new NotFoundException(`Không tìm thấy khóa học có ID: ${courseId}`);
      }

      return courseWithLessons;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy danh sách bài học: ${error.message}`);
    }
  }

  /**
   * Cập nhật thông tin khóa học
   */
  async updateCourse(courseId: string, updateCourseDto: UpdateCourseDto) {
    try {
      // Kiểm tra khóa học có tồn tại không
      await this.getCourseById(courseId);

      // Nếu cập nhật classId, kiểm tra lớp học mới có tồn tại không
      if (updateCourseDto.classId) {
        const classExists = await this.prisma.class.findUnique({
          where: { id: updateCourseDto.classId },
        });

        if (!classExists) {
          throw new NotFoundException(`Không tìm thấy lớp học có ID: ${updateCourseDto.classId}`);
        }
      }

      const updatedCourse = await this.prisma.course.update({
        where: { id: courseId },
        data: updateCourseDto,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
              description: true,
            },
          },
          _count: {
            select: { lessons: true },
          },
        },
      });

      return updatedCourse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể cập nhật khóa học: ${error.message}`);
    }
  }

  /**
   * Xóa khóa học
   */
  async deleteCourse(courseId: string) {
    try {
      // Kiểm tra khóa học có tồn tại không
      await this.getCourseById(courseId);

      // Kiểm tra xem có bài học nào đang sử dụng khóa học này không
      const lessonsCount = await this.prisma.lesson.count({
        where: { courseId },
      });

      if (lessonsCount > 0) {
        throw new ConflictException(
          `Không thể xóa khóa học này vì có ${lessonsCount} bài học đang sử dụng`
        );
      }

      await this.prisma.course.delete({
        where: { id: courseId },
      });

      return { message: 'Xóa khóa học thành công' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa khóa học: ${error.message}`);
    }
  }

  /**
   * Xuất bản/hủy xuất bản khóa học
   */
  async togglePublishCourse(courseId: string) {
    try {
      const course = await this.getCourseById(courseId);
      
      const updatedCourse = await this.prisma.course.update({
        where: { id: courseId },
        data: { isPublished: !course.isPublished },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
              description: true,
            },
          },
          _count: {
            select: { lessons: true },
          },
        },
      });

      return updatedCourse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể thay đổi trạng thái xuất bản: ${error.message}`);
    }
  }

  /**
   * Tìm kiếm khóa học
   */
  async searchCourses(keyword: string, classId?: string, isPublished?: boolean) {
    try {
      const whereConditions: any = {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      };

      if (classId) {
        whereConditions.classId = classId;
      }

      if (isPublished !== undefined) {
        whereConditions.isPublished = isPublished;
      }

      const courses = await this.prisma.course.findMany({
        where: whereConditions,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
              description: true,
            },
          },
          _count: {
            select: { lessons: true },
          },
        },
        orderBy: [
          { class: { gradeLevel: 'asc' } },
          { createdAt: 'desc' },
        ],
      });

      return courses;
    } catch (error) {
      throw new BadRequestException(`Không thể tìm kiếm khóa học: ${error.message}`);
    }
  }
}