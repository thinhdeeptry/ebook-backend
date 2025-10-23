import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo lớp học mới
   */
  async createClass(createClassDto: CreateClassDto) {
    try {
      // Kiểm tra trùng cấp lớp
      const existingClass = await this.prisma.class.findUnique({
        where: { gradeLevel: createClassDto.gradeLevel },
      });

      if (existingClass) {
        throw new ConflictException(`Lớp ${createClassDto.gradeLevel} đã tồn tại`);
      }

      const newClass = await this.prisma.class.create({
        data: createClassDto,
        include: {
          _count: {
            select: {
              memberships: true,
              books: true,
            },
          },
        },
      });

      return newClass;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tạo lớp học: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách tất cả các lớp học
   */
  async getAllClasses(includeCount = true) {
    try {
      const classes = await this.prisma.class.findMany({
        orderBy: { gradeLevel: 'asc' },
        include: includeCount ? {
          _count: {
            select: {
              memberships: true,
              books: true,
            },
          },
        } : undefined,
      });

      return classes;
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách lớp học: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin chi tiết một lớp học
   */
  async getClassById(classId: string) {
    try {
      const classInfo = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          _count: {
            select: {
              memberships: true,
              books: true,
            },
          },
        },
      });

      if (!classInfo) {
        throw new NotFoundException(`Không tìm thấy lớp học có ID: ${classId}`);
      }

      return classInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy thông tin lớp học: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin lớp học bao gồm danh sách học sinh
   */
  async getClassWithMembers(classId: string) {
    try {
      const classWithMembers = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                  isActive: true,
                },
              },
            },
            orderBy: {
              user: { firstName: 'asc' },
            },
          },
          _count: {
            select: {
              memberships: true,
              books: true,
            },
          },
        },
      });

      if (!classWithMembers) {
        throw new NotFoundException(`Không tìm thấy lớp học có ID: ${classId}`);
      }

      return classWithMembers;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy danh sách học sinh: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin lớp học bao gồm danh sách sách
   */
  async getClassWithBooks(classId: string) {
    try {
      const classWithBooks = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          books: {
            include: {
              chapters: {
                include: {
                  _count: {
                    select: { lessons: true },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              memberships: true,
              books: true,
            },
          },
        },
      });

      if (!classWithBooks) {
        throw new NotFoundException(`Không tìm thấy lớp học có ID: ${classId}`);
      }

      return classWithBooks;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy danh sách sách: ${error.message}`);
    }
  }

  /**
   * Cập nhật thông tin lớp học
   */
  async updateClass(classId: string, updateClassDto: UpdateClassDto) {
    try {
      // Kiểm tra lớp học có tồn tại không
      await this.getClassById(classId);

      // Nếu cập nhật gradeLevel, kiểm tra trùng lặp
      if (updateClassDto.gradeLevel) {
        const existingClass = await this.prisma.class.findFirst({
          where: { 
            gradeLevel: updateClassDto.gradeLevel,
            id: { not: classId },
          },
        });

        if (existingClass) {
          throw new ConflictException(`Lớp ${updateClassDto.gradeLevel} đã tồn tại`);
        }
      }

      const updatedClass = await this.prisma.class.update({
        where: { id: classId },
        data: updateClassDto,
        include: {
          _count: {
            select: {
              memberships: true,
              books: true,
            },
          },
        },
      });

      return updatedClass;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Không thể cập nhật lớp học: ${error.message}`);
    }
  }

  /**
   * Xóa lớp học
   */
  async deleteClass(classId: string) {
    try {
      // Kiểm tra lớp học có tồn tại không
      await this.getClassById(classId);

      // Kiểm tra xem có sách nào đang gán cho lớp này không
      const booksCount = await this.prisma.book.count({
        where: { 
          classes: {
            some: { id: classId }
          }
        },
      });

      if (booksCount > 0) {
        throw new ConflictException(
          `Không thể xóa lớp học này vì có ${booksCount} sách đang được gán cho lớp`
        );
      }

      await this.prisma.class.delete({
        where: { id: classId },
      });

      return { message: 'Xóa lớp học thành công' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa lớp học: ${error.message}`);
    }
  }

  /**
   * Thêm học sinh vào lớp
   */
  async addStudentToClass(classId: string, userId: string) {
    try {
      // Kiểm tra lớp học có tồn tại không
      await this.getClassById(classId);

      // Kiểm tra user có tồn tại và có phải là học sinh không
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng có ID: ${userId}`);
      }

      if (user.role !== Role.STUDENT) {
        throw new BadRequestException('Chỉ có thể thêm học sinh vào lớp');
      }

      // Kiểm tra học sinh đã có trong lớp này chưa
      const existingMembership = await this.prisma.classMembership.findUnique({
        where: {
          userId_classId: {
            userId,
            classId,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException('Học sinh đã có trong lớp này');
      }

      const membership = await this.prisma.classMembership.create({
        data: {
          userId,
          classId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      return membership;
    } catch (error) {
      if (
        error instanceof NotFoundException || 
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(`Không thể thêm học sinh vào lớp: ${error.message}`);
    }
  }

  /**
   * Xóa học sinh khỏi lớp
   */
  async removeStudentFromClass(classId: string, userId: string) {
    try {
      // Kiểm tra membership có tồn tại không
      const membership = await this.prisma.classMembership.findUnique({
        where: {
          userId_classId: {
            userId,
            classId,
          },
        },
      });

      if (!membership) {
        throw new NotFoundException('Học sinh không có trong lớp này');
      }

      await this.prisma.classMembership.delete({
        where: {
          userId_classId: {
            userId,
            classId,
          },
        },
      });

      return { message: 'Xóa học sinh khỏi lớp thành công' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa học sinh khỏi lớp: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách học sinh có thể thêm vào lớp (chưa có trong lớp)
   */
  async getAvailableStudents(classId: string) {
    try {
      const availableStudents = await this.prisma.user.findMany({
        where: {
          role: Role.STUDENT,
          isActive: true,
          classMemberships: {
            none: {
              classId,
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
        orderBy: { firstName: 'asc' },
      });

      return availableStudents;
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách học sinh: ${error.message}`);
    }
  }
}