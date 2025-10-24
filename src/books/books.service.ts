import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateBookDto, UpdateBookDto, BookQueryDto } from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo sách giáo khoa mới
   */
  async createBook(createBookDto: CreateBookDto) {
    try {
      const { classIds, ...bookData } = createBookDto;

      // Kiểm tra các lớp học có tồn tại không (nếu có)
      if (classIds && classIds.length > 0) {
        const existingClasses = await this.prisma.class.findMany({
          where: { id: { in: classIds } },
        });

        if (existingClasses.length !== classIds.length) {
          const missingIds = classIds.filter((id) => !existingClasses.find((cls) => cls.id === id));
          throw new NotFoundException(`Không tìm thấy các lớp học có ID: ${missingIds.join(', ')}`);
        }
      }

      const newBook = await this.prisma.book.create({
        data: {
          ...bookData,
          ...(classIds &&
            classIds.length > 0 && {
              classes: {
                connect: classIds.map((id) => ({ id })),
              },
            }),
        },
        include: {
          classes: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              lessons: true,
            },
          },
        },
      });

      return newBook;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tạo sách: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách tất cả sách
   */
  async getAllBooks(query: BookQueryDto = {}) {
    try {
      const { search, subject, grade, isPublished, classId } = query;

      const whereConditions: any = {};

      if (search) {
        whereConditions.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { publisher: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (subject) {
        whereConditions.subject = { contains: subject, mode: 'insensitive' };
      }

      if (grade !== undefined) {
        whereConditions.grade = grade;
      }

      if (isPublished !== undefined) {
        whereConditions.isPublished = isPublished;
      }

      if (classId) {
        whereConditions.classes = {
          some: { id: classId },
        };
      }

      const books = await this.prisma.book.findMany({
        where: whereConditions,
        include: {
          classes: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              lessons: true,
            },
          },
        },
        orderBy: [{ grade: 'asc' }, { subject: 'asc' }, { createdAt: 'desc' }],
      });

      return books;
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách sách: ${error.message}`);
    }
  }

  /**
   * Lấy sách theo ID
   */
  async getBookById(bookId: string) {
    try {
      const book = await this.prisma.book.findUnique({
        where: { id: bookId },
        include: {
          chapters: {
            select: {
              id: true,
              title: true,
              order: true,
              description: true,
              lessons: {
                select: {
                  id: true,
                  title: true,
                  order: true,
                  pages: {
                    include: {
                      blocks: true,
                    },
                  },
                  _count: {
                    select: { pages: true },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
          classes: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              lessons: true,
            },
          },
        },
      });

      if (!book) {
        throw new NotFoundException(`Không tìm thấy sách có ID: ${bookId}`);
      }

      return book;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy thông tin sách: ${error.message}`);
    }
  }

  /**
   * Lấy sách với danh sách chương và bài học
   */
  async getBookWithChaptersAndLessons(bookId: string) {
    try {
      const bookWithContent = await this.prisma.book.findUnique({
        where: { id: bookId },
        include: {
          classes: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
            },
          },
          chapters: {
            include: {
              lessons: {
                include: {
                  _count: {
                    select: { pages: true },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
          lessons: {
            where: { chapterId: null }, // Lessons không thuộc chapter nào
            include: {
              _count: {
                select: { pages: true },
              },
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              chapters: true,
              lessons: true,
            },
          },
        },
      });

      if (!bookWithContent) {
        throw new NotFoundException(`Không tìm thấy sách có ID: ${bookId}`);
      }

      return bookWithContent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy nội dung sách: ${error.message}`);
    }
  }

  /**
   * Cập nhật sách
   */
  async updateBook(bookId: string, updateBookDto: UpdateBookDto) {
    try {
      // Kiểm tra sách có tồn tại không
      await this.getBookById(bookId);

      const { classIds, ...bookData } = updateBookDto;

      // Kiểm tra các lớp học có tồn tại không (nếu có)
      if (classIds && classIds.length > 0) {
        const existingClasses = await this.prisma.class.findMany({
          where: { id: { in: classIds } },
        });

        if (existingClasses.length !== classIds.length) {
          const missingIds = classIds.filter((id) => !existingClasses.find((cls) => cls.id === id));
          throw new NotFoundException(`Không tìm thấy các lớp học có ID: ${missingIds.join(', ')}`);
        }
      }

      // Cập nhật sách
      const updatedBook = await this.prisma.book.update({
        where: { id: bookId },
        data: {
          ...bookData,
          ...(classIds !== undefined && {
            classes: {
              set: classIds.map((id) => ({ id })),
            },
          }),
        },
        include: {
          classes: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              lessons: true,
            },
          },
        },
      });

      return updatedBook;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể cập nhật sách: ${error.message}`);
    }
  }

  /**
   * Xóa sách
   */
  async deleteBook(bookId: string) {
    try {
      // Kiểm tra sách có tồn tại không
      await this.getBookById(bookId);

      // Kiểm tra xem có chương hoặc bài học nào đang sử dụng sách này không
      const chaptersCount = await this.prisma.chapter.count({
        where: { bookId },
      });

      const lessonsCount = await this.prisma.lesson.count({
        where: { bookId },
      });

      if (chaptersCount > 0 || lessonsCount > 0) {
        throw new BadRequestException(
          `Không thể xóa sách này vì có ${chaptersCount} chương và ${lessonsCount} bài học đang sử dụng`,
        );
      }

      await this.prisma.book.delete({
        where: { id: bookId },
      });

      return { message: 'Xóa sách thành công' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa sách: ${error.message}`);
    }
  }

  /**
   * Xuất bản/hủy xuất bản sách
   */
  async togglePublishBook(bookId: string) {
    try {
      const book = await this.getBookById(bookId);

      const updatedBook = await this.prisma.book.update({
        where: { id: bookId },
        data: { isPublished: !book.isPublished },
        include: {
          classes: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              lessons: true,
            },
          },
        },
      });

      return updatedBook;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể thay đổi trạng thái xuất bản: ${error.message}`);
    }
  }

  /**
   * Lấy sách theo lớp học
   */
  async getBooksByClass(classId: string, isPublished?: boolean) {
    try {
      const whereConditions: any = {
        classes: {
          some: { id: classId },
        },
      };

      if (isPublished !== undefined) {
        whereConditions.isPublished = isPublished;
      }

      const books = await this.prisma.book.findMany({
        where: whereConditions,
        include: {
          _count: {
            select: {
              chapters: true,
              lessons: true,
            },
          },
        },
        orderBy: [{ subject: 'asc' }, { createdAt: 'desc' }],
      });

      return books;
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách sách theo lớp: ${error.message}`);
    }
  }

  /**
   * Lấy sách theo môn học và khối lớp
   */
  async getBooksBySubjectAndGrade(subject: string, grade: number, isPublished?: boolean) {
    try {
      const whereConditions: any = {
        subject: { contains: subject, mode: 'insensitive' },
        grade: grade,
      };

      if (isPublished !== undefined) {
        whereConditions.isPublished = isPublished;
      }

      const books = await this.prisma.book.findMany({
        where: whereConditions,
        include: {
          classes: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              lessons: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return books;
    } catch (error) {
      throw new BadRequestException(
        `Không thể lấy sách theo môn học và khối lớp: ${error.message}`,
      );
    }
  }
}
