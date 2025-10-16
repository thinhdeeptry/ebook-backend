import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo bài học mới
   */
  async createLesson(createLessonDto: CreateLessonDto) {
    try {
      // Kiểm tra khóa học có tồn tại không
      const courseExists = await this.prisma.course.findUnique({
        where: { id: createLessonDto.courseId },
      });

      if (!courseExists) {
        throw new NotFoundException(`Không tìm thấy khóa học có ID: ${createLessonDto.courseId}`);
      }

      // Kiểm tra thứ tự đã tồn tại chưa trong khóa học
      const existingLesson = await this.prisma.lesson.findFirst({
        where: {
          courseId: createLessonDto.courseId,
          order: createLessonDto.order,
        },
      });

      if (existingLesson) {
        throw new ConflictException(
          `Thứ tự ${createLessonDto.order} đã được sử dụng trong khóa học này`
        );
      }

      const newLesson = await this.prisma.lesson.create({
        data: createLessonDto,
        include: {
          course: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  gradeLevel: true,
                },
              },
            },
          },
          _count: {
            select: { steps: true },
          },
        },
      });

      return newLesson;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tạo bài học: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách bài học theo khóa học
   */
  async getLessonsByCourse(courseId: string) {
    try {
      const lessons = await this.prisma.lesson.findMany({
        where: { courseId: courseId },
        include: {
          _count: {
            select: { steps: true },
          },
        },
        orderBy: { order: 'asc' },
      });

      return lessons;
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách bài học: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin chi tiết bài học
   */
  async getLessonById(lessonId: string) {
    try {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  gradeLevel: true,
                },
              },
            },
          },
          _count: {
            select: { steps: true },
          },
        },
      });

      if (!lesson) {
        throw new NotFoundException(`Không tìm thấy bài học có ID: ${lessonId}`);
      }

      return lesson;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy thông tin bài học: ${error.message}`);
    }
  }

  /**
   * Lấy bài học với danh sách các bước học
   */
  async getLessonWithSteps(lessonId: string) {
    try {
      const lessonWithSteps = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  gradeLevel: true,
                },
              },
            },
          },
          steps: {
            include: {
              h5pContent: {
                select: {
                  id: true,
                  title: true,
                  library: true,
                  isPublic: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { steps: true },
          },
        },
      });

      if (!lessonWithSteps) {
        throw new NotFoundException(`Không tìm thấy bài học có ID: ${lessonId}`);
      }

      return lessonWithSteps;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy danh sách bước học: ${error.message}`);
    }
  }

  /**
   * Cập nhật thông tin bài học
   */
  async updateLesson(lessonId: string, updateLessonDto: UpdateLessonDto) {
    try {
      // Kiểm tra bài học có tồn tại không
      const existingLesson = await this.getLessonById(lessonId);

      // Nếu cập nhật courseId, kiểm tra khóa học mới có tồn tại không
      if (updateLessonDto.courseId && updateLessonDto.courseId !== existingLesson.courseId) {
        const courseExists = await this.prisma.course.findUnique({
          where: { id: updateLessonDto.courseId },
        });

        if (!courseExists) {
          throw new NotFoundException(`Không tìm thấy khóa học có ID: ${updateLessonDto.courseId}`);
        }
      }

      // Nếu cập nhật order, kiểm tra trùng lặp
      if (updateLessonDto.order && updateLessonDto.order !== existingLesson.order) {
        const targetCourseId = updateLessonDto.courseId || existingLesson.courseId;
        
        const existingOrderLesson = await this.prisma.lesson.findFirst({
          where: {
            courseId: targetCourseId,
            order: updateLessonDto.order,
            id: { not: lessonId },
          },
        });

        if (existingOrderLesson) {
          throw new ConflictException(
            `Thứ tự ${updateLessonDto.order} đã được sử dụng trong khóa học này`
          );
        }
      }

      const updatedLesson = await this.prisma.lesson.update({
        where: { id: lessonId },
        data: updateLessonDto,
        include: {
          course: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  gradeLevel: true,
                },
              },
            },
          },
          _count: {
            select: { steps: true },
          },
        },
      });

      return updatedLesson;
    } catch (error) {
      if (
        error instanceof NotFoundException || 
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(`Không thể cập nhật bài học: ${error.message}`);
    }
  }

  /**
   * Xóa bài học
   */
  async deleteLesson(lessonId: string) {
    try {
      // Kiểm tra bài học có tồn tại không
      await this.getLessonById(lessonId);

      // Kiểm tra xem có bước học nào đang sử dụng bài học này không
      const stepsCount = await this.prisma.lessonStep.count({
        where: { lessonId },
      });

      if (stepsCount > 0) {
        throw new ConflictException(
          `Không thể xóa bài học này vì có ${stepsCount} bước học đang sử dụng`
        );
      }

      await this.prisma.lesson.delete({
        where: { id: lessonId },
      });

      return { message: 'Xóa bài học thành công' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa bài học: ${error.message}`);
    }
  }

  /**
   * Sắp xếp lại thứ tự các bài học
   */
  async reorderLessons(courseId: string, lessonIds: string[]) {
    try {
      // Kiểm tra khóa học có tồn tại không
      const courseExists = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!courseExists) {
        throw new NotFoundException(`Không tìm thấy khóa học có ID: ${courseId}`);
      }

      // Kiểm tra tất cả lessonIds có thuộc courseId không
      const existingLessons = await this.prisma.lesson.findMany({
        where: {
          id: { in: lessonIds },
          courseId,
        },
      });

      if (existingLessons.length !== lessonIds.length) {
        throw new BadRequestException('Một số bài học không thuộc khóa học này');
      }

      // Cập nhật thứ tự theo transaction
      const updatePromises = lessonIds.map((lessonId, index) =>
        this.prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index + 1 },
        })
      );

      await this.prisma.$transaction(updatePromises);

      return { message: 'Sắp xếp lại thứ tự bài học thành công' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Không thể sắp xếp lại thứ tự bài học: ${error.message}`);
    }
  }

  /**
   * Sao chép bài học
   */
  async duplicateLesson(lessonId: string, newTitle?: string) {
    try {
      const originalLesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          steps: {
            include: {
              h5pContent: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!originalLesson) {
        throw new NotFoundException(`Không tìm thấy bài học có ID: ${lessonId}`);
      }

      // Tìm thứ tự cao nhất trong khóa học
      const maxOrderLesson = await this.prisma.lesson.findFirst({
        where: { courseId: originalLesson.courseId },
        orderBy: { order: 'desc' },
      });

      const newOrder = (maxOrderLesson?.order || 0) + 1;

      // Tạo bài học mới với transaction
      const duplicatedLesson = await this.prisma.$transaction(async (tx) => {
        // Tạo bài học mới
        const newLesson = await tx.lesson.create({
          data: {
            title: newTitle || `${originalLesson.title} (Bản sao)`,
            description: originalLesson.description,
            order: newOrder,
            courseId: originalLesson.courseId,
          },
        });

        // Sao chép các bước học
        for (const step of originalLesson.steps) {
          await tx.lessonStep.create({
            data: {
              title: step.title,
              order: step.order,
              contentType: step.contentType,
              contentJson: step.contentJson,
              lessonId: newLesson.id,
              h5pContentId: step.h5pContentId,
            },
          });
        }

        return newLesson;
      });

      // Lấy thông tin chi tiết bài học mới
      return this.getLessonById(duplicatedLesson.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể sao chép bài học: ${error.message}`);
    }
  }

  /**
   * Tìm kiếm bài học
   */
  async searchLessons(keyword: string, courseId?: string) {
    try {
      const whereConditions: any = {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      };

      if (courseId) {
        whereConditions.courseId = courseId;
      }

      const lessons = await this.prisma.lesson.findMany({
        where: whereConditions,
        include: {
          course: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  gradeLevel: true,
                },
              },
            },
          },
          _count: {
            select: { steps: true },
          },
        },
        orderBy: [
          { course: { class: { gradeLevel: 'asc' } } },
          { order: 'asc' },
        ],
      });

      return lessons;
    } catch (error) {
      throw new BadRequestException(`Không thể tìm kiếm bài học: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin navigation cho bài học (trước/sau)
   */
  async getLessonNavigation(lessonId: string) {
    try {
      // Lấy thông tin bài học hiện tại
      const currentLesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!currentLesson) {
        throw new NotFoundException(`Không tìm thấy bài học có ID: ${lessonId}`);
      }

      // Lấy tổng số bài học trong khóa học
      const totalLessons = await this.prisma.lesson.count({
        where: { courseId: currentLesson.courseId },
      });

      // Lấy bài học trước đó (order nhỏ hơn và gần nhất)
      const previousLesson = await this.prisma.lesson.findFirst({
        where: {
          courseId: currentLesson.courseId,
          order: { lt: currentLesson.order },
        },
        orderBy: { order: 'desc' },
        select: {
          id: true,
          title: true,
          order: true,
        },
      });

      // Lấy bài học tiếp theo (order lớn hơn và gần nhất)
      const nextLesson = await this.prisma.lesson.findFirst({
        where: {
          courseId: currentLesson.courseId,
          order: { gt: currentLesson.order },
        },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          order: true,
        },
      });

      return {
        current: {
          id: currentLesson.id,
          title: currentLesson.title,
          order: currentLesson.order,
        },
        previous: previousLesson || null,
        next: nextLesson || null,
        course: {
          id: currentLesson.course.id,
          title: currentLesson.course.title,
          totalLessons,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy thông tin navigation: ${error.message}`);
    }
  }
}