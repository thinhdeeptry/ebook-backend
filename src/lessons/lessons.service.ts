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
      // Kiểm tra chapter hoặc book có tồn tại không
      if (createLessonDto.chapterId) {
        const chapterExists = await this.prisma.chapter.findUnique({
          where: { id: createLessonDto.chapterId },
        });

        if (!chapterExists) {
          throw new NotFoundException(`Không tìm thấy chương có ID: ${createLessonDto.chapterId}`);
        }
      }

      if (createLessonDto.bookId) {
        const bookExists = await this.prisma.book.findUnique({
          where: { id: createLessonDto.bookId },
        });

        if (!bookExists) {
          throw new NotFoundException(`Không tìm thấy sách có ID: ${createLessonDto.bookId}`);
        }
      }

      // Kiểm tra thứ tự đã tồn tại chưa
      const whereCondition: any = { order: createLessonDto.order };
      if (createLessonDto.chapterId) {
        whereCondition.chapterId = createLessonDto.chapterId;
      } else if (createLessonDto.bookId) {
        whereCondition.bookId = createLessonDto.bookId;
        whereCondition.chapterId = null;
      }

      const existingLesson = await this.prisma.lesson.findFirst({
        where: whereCondition,
      });

      if (existingLesson) {
        throw new ConflictException(
          `Thứ tự ${createLessonDto.order} đã được sử dụng`
        );
      }

      const newLesson = await this.prisma.lesson.create({
        data: createLessonDto,
        include: {
          chapter: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              subject: true,
              grade: true,
              description: true,
              isPublished: true,
            },
          },
          _count: {
            select: { pages: true },
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
   * Lấy danh sách bài học theo sách
   */
  async getLessonsByBook(bookId: string) {
    try {
      const lessons = await this.prisma.lesson.findMany({
        where: { 
          OR: [
            { bookId: bookId, chapterId: null }, // Lessons directly under book
            { chapter: { bookId: bookId } } // Lessons under chapters of this book
          ]
        },
        include: {
          chapter: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
          _count: {
            select: { pages: true },
          },
        },
        orderBy: [
          { chapter: { order: 'asc' } },
          { order: 'asc' },
        ],
      });

      return lessons;
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách bài học: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách bài học theo chương
   */
  async getLessonsByChapter(chapterId: string) {
    try {
      const lessons = await this.prisma.lesson.findMany({
        where: { chapterId: chapterId },
        include: {
          _count: {
            select: { pages: true },
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
          chapter: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              subject: true,
              grade: true,
              description: true,
              isPublished: true,
            },
          },
          _count: {
            select: { pages: true },
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
   * Lấy bài học với danh sách trang
   */
  async getLessonWithPages(lessonId: string) {
    try {
      const lessonWithPages = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          chapter: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              subject: true,
              grade: true,
              description: true,
              isPublished: true,
            },
          },
          pages: {
            include: {
              blocks: {
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
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { pages: true },
          },
        },
      });

      if (!lessonWithPages) {
        throw new NotFoundException(`Không tìm thấy bài học có ID: ${lessonId}`);
      }

      return lessonWithPages;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy nội dung bài học: ${error.message}`);
    }
  }

  /**
   * Cập nhật bài học
   */
  async updateLesson(lessonId: string, updateLessonDto: UpdateLessonDto) {
    try {
      // Kiểm tra bài học có tồn tại không
      await this.getLessonById(lessonId);

      // Kiểm tra chapter hoặc book mới có tồn tại không (nếu được cập nhật)
      if (updateLessonDto.chapterId) {
        const chapterExists = await this.prisma.chapter.findUnique({
          where: { id: updateLessonDto.chapterId },
        });

        if (!chapterExists) {
          throw new NotFoundException(`Không tìm thấy chương có ID: ${updateLessonDto.chapterId}`);
        }
      }

      if (updateLessonDto.bookId) {
        const bookExists = await this.prisma.book.findUnique({
          where: { id: updateLessonDto.bookId },
        });

        if (!bookExists) {
          throw new NotFoundException(`Không tìm thấy sách có ID: ${updateLessonDto.bookId}`);
        }
      }

      // Kiểm tra thứ tự mới có bị trùng không (nếu được cập nhật)
      if (updateLessonDto.order !== undefined) {
        const whereCondition: any = { 
          order: updateLessonDto.order,
          id: { not: lessonId },
        };

        if (updateLessonDto.chapterId) {
          whereCondition.chapterId = updateLessonDto.chapterId;
        } else if (updateLessonDto.bookId) {
          whereCondition.bookId = updateLessonDto.bookId;
          whereCondition.chapterId = null;
        }

        const existingLesson = await this.prisma.lesson.findFirst({
          where: whereCondition,
        });

        if (existingLesson) {
          throw new ConflictException(
            `Thứ tự ${updateLessonDto.order} đã được sử dụng`
          );
        }
      }

      const updatedLesson = await this.prisma.lesson.update({
        where: { id: lessonId },
        data: updateLessonDto,
        include: {
          chapter: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              subject: true,
              grade: true,
              description: true,
              isPublished: true,
            },
          },
          _count: {
            select: { pages: true },
          },
        },
      });

      return updatedLesson;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
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

      // Kiểm tra xem có trang nào đang sử dụng bài học này không
      const pagesCount = await this.prisma.page.count({
        where: { lessonId },
      });

      if (pagesCount > 0) {
        throw new ConflictException(
          `Không thể xóa bài học này vì có ${pagesCount} trang đang sử dụng`
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
   * Sắp xếp lại thứ tự bài học
   */
  async reorderLessons(lessonIds: string[], chapterId?: string, bookId?: string) {
    try {
      // Kiểm tra tất cả các bài học có tồn tại không
      const lessons = await this.prisma.lesson.findMany({
        where: { 
          id: { in: lessonIds },
          ...(chapterId ? { chapterId } : {}),
          ...(bookId ? { bookId } : {}),
        },
      });

      if (lessons.length !== lessonIds.length) {
        throw new NotFoundException('Một số bài học không tồn tại');
      }

      // Cập nhật thứ tự
      const updatePromises = lessonIds.map((lessonId, index) => 
        this.prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      return { message: 'Sắp xếp lại thứ tự bài học thành công' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể sắp xếp lại thứ tự: ${error.message}`);
    }
  }

  /**
   * Lấy navigation (bài học trước/sau)
   */
  async getLessonNavigation(lessonId: string) {
    try {
      const currentLesson = await this.getLessonById(lessonId);

      let whereCondition: any = {};
      let contextInfo: any = {};

      if (currentLesson.chapterId) {
        // Lessons within a chapter
        whereCondition = { chapterId: currentLesson.chapterId };
        const chapter = await this.prisma.chapter.findUnique({
          where: { id: currentLesson.chapterId },
          include: { _count: { select: { lessons: true } } },
        });
        contextInfo = {
          chapter: {
            id: chapter?.id,
            title: chapter?.title,
            totalLessons: chapter?._count.lessons || 0,
          }
        };
      } else if (currentLesson.bookId) {
        // Lessons directly under a book
        whereCondition = { bookId: currentLesson.bookId, chapterId: null };
        const book = await this.prisma.book.findUnique({
          where: { id: currentLesson.bookId },
          include: { _count: { select: { lessons: true } } },
        });
        contextInfo = {
          book: {
            id: book?.id,
            title: book?.title,
            totalLessons: book?._count.lessons || 0,
          }
        };
      }

      // Find previous lesson
      const previousLesson = await this.prisma.lesson.findFirst({
        where: {
          ...whereCondition,
          order: { lt: currentLesson.order },
        },
        orderBy: { order: 'desc' },
        select: { id: true, title: true, order: true },
      });

      // Find next lesson
      const nextLesson = await this.prisma.lesson.findFirst({
        where: {
          ...whereCondition,
          order: { gt: currentLesson.order },
        },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, order: true },
      });

      return {
        current: {
          id: currentLesson.id,
          title: currentLesson.title,
          order: currentLesson.order,
        },
        previous: previousLesson,
        next: nextLesson,
        ...contextInfo,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy thông tin navigation: ${error.message}`);
    }
  }

  /**
   * Tìm kiếm bài học
   */
  async searchLessons(keyword: string, bookId?: string, chapterId?: string) {
    try {
      const whereConditions: any = {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      };

      if (bookId) {
        whereConditions.OR = [
          { ...whereConditions.OR[0], bookId },
          { ...whereConditions.OR[1], bookId },
          { ...whereConditions.OR[0], chapter: { bookId } },
          { ...whereConditions.OR[1], chapter: { bookId } },
        ];
      }

      if (chapterId) {
        whereConditions.chapterId = chapterId;
      }

      const lessons = await this.prisma.lesson.findMany({
        where: whereConditions,
        include: {
          chapter: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              subject: true,
              grade: true,
              isPublished: true,
            },
          },
          _count: {
            select: { pages: true },
          },
        },
        orderBy: [
          { book: { grade: 'asc' } },
          { chapter: { order: 'asc' } },
          { order: 'asc' },
        ],
      });

      return lessons;
    } catch (error) {
      throw new BadRequestException(`Không thể tìm kiếm bài học: ${error.message}`);
    }
  }
}