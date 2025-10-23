import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { 
  CreateStudentProgressDto, 
  UpdateStudentProgressDto, 
  CreateQuizAttemptDto, 
  UpdateQuizAttemptDto,
  ProgressSummaryDto 
} from './dto/student-progress.dto';
import { ProgressStatus, Role } from '@prisma/client';

@Injectable()
export class StudentProgressService {
  constructor(private prisma: PrismaService) {}

  // Tạo tiến độ học sinh mới
  async createProgress(createProgressDto: CreateStudentProgressDto, currentUserId?: string, currentUserRole?: Role) {
    const { userId, pageBlockId, status = ProgressStatus.NOT_STARTED } = createProgressDto;

    // Kiểm tra quyền: chỉ ADMIN/TEACHER hoặc chính học sinh mới có thể tạo tiến độ
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== userId) {
      throw new ForbiddenException('Bạn không có quyền tạo tiến độ cho người dùng khác');
    }

    // Kiểm tra user và pageBlock có tồn tại không
    const [user, pageBlock] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.pageBlock.findUnique({ 
        where: { id: pageBlockId },
        include: {
          page: {
            include: {
              lesson: {
                include: {
                  book: {
                    include: {
                      classes: true,
                    },
                  },
                  chapter: {
                    include: {
                      book: {
                        include: {
                          classes: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    if (!pageBlock) {
      throw new NotFoundException('Không tìm thấy khối trang');
    }

    // Kiểm tra học sinh có trong lớp của sách không
    if (user.role === Role.STUDENT) {
      const userClasses = await this.prisma.classMembership.findMany({
        where: { userId },
        select: { classId: true },
      });
      const userClassIds = userClasses.map(c => c.classId);

      const bookClasses = pageBlock.page.lesson.book?.classes || 
                         pageBlock.page.lesson.chapter?.book?.classes || [];
      const bookClassIds = bookClasses.map(c => c.id);

      const hasAccess = userClassIds.some(classId => bookClassIds.includes(classId));
      if (!hasAccess) {
        throw new ForbiddenException('Học sinh không có quyền truy cập sách này');
      }
    }

    // Kiểm tra tiến độ đã tồn tại chưa
    const existingProgress = await this.prisma.studentProgress.findUnique({
      where: {
        userId_pageBlockId: {
          userId,
          pageBlockId,
        },
      },
    });

    if (existingProgress) {
      throw new BadRequestException('Tiến độ học tập cho khối trang này đã tồn tại');
    }

    // Tạo tiến độ mới
    const progress = await this.prisma.studentProgress.create({
      data: {
        userId,
        pageBlockId,
        status,
        completedAt: status === ProgressStatus.COMPLETED ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        pageBlock: {
          include: {
            page: {
              include: {
                lesson: {
                  select: {
                    id: true,
                    title: true,
                    order: true,
                  },
                },
              },
            },
            h5pContent: {
              select: {
                id: true,
                title: true,
                library: true,
              },
            },
          },
        },
      },
    });

    return progress;
  }

  // Cập nhật tiến độ học sinh
  async updateProgress(
    userId: string, 
    pageBlockId: string, 
    updateProgressDto: UpdateStudentProgressDto,
    currentUserId?: string,
    currentUserRole?: Role
  ) {
    // Kiểm tra quyền
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật tiến độ của người dùng khác');
    }

    // Tìm tiến độ hiện tại
    const existingProgress = await this.prisma.studentProgress.findUnique({
      where: {
        userId_pageBlockId: {
          userId,
          pageBlockId,
        },
      },
      include: {
        pageBlock: {
          include: {
            page: {
              include: {
                lesson: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingProgress) {
      throw new NotFoundException('Không tìm thấy tiến độ học tập');
    }

    // Cập nhật tiến độ
    const updatedProgress = await this.prisma.studentProgress.update({
      where: {
        userId_pageBlockId: {
          userId,
          pageBlockId,
        },
      },
      data: {
        ...updateProgressDto,
        completedAt: updateProgressDto.status === ProgressStatus.COMPLETED 
          ? (existingProgress.completedAt || new Date())
          : updateProgressDto.status === ProgressStatus.NOT_STARTED || updateProgressDto.status === ProgressStatus.IN_PROGRESS
          ? null
          : existingProgress.completedAt,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        pageBlock: {
          include: {
            page: {
              include: {
                lesson: {
                  select: {
                    id: true,
                    title: true,
                    order: true,
                  },
                },
              },
            },
            h5pContent: {
              select: {
                id: true,
                title: true,
                library: true,
              },
            },
          },
        },
      },
    });

    return updatedProgress;
  }

  // Lấy tiến độ theo user và pageBlock
  async getProgress(userId: string, pageBlockId: string, currentUserId?: string, currentUserRole?: Role) {
    // Kiểm tra quyền
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem tiến độ của người dùng khác');
    }

    const progress = await this.prisma.studentProgress.findUnique({
      where: {
        userId_pageBlockId: {
          userId,
          pageBlockId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        pageBlock: {
          include: {
            page: {
              include: {
                lesson: {
                  select: {
                    id: true,
                    title: true,
                    order: true,
                  },
                },
              },
            },
            h5pContent: {
              select: {
                id: true,
                title: true,
                library: true,
              },
            },
          },
        },
        quizAttempts: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!progress) {
      throw new NotFoundException('Không tìm thấy tiến độ học tập');
    }

    return progress;
  }

  // Lấy tất cả tiến độ của một user
  async getUserProgress(userId: string, currentUserId?: string, currentUserRole?: Role) {
    // Kiểm tra quyền
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem tiến độ của người dùng khác');
    }

    const progress = await this.prisma.studentProgress.findMany({
      where: { userId },
      include: {
        pageBlock: {
          include: {
            page: {
              include: {
                lesson: {
                  select: {
                    id: true,
                    title: true,
                    order: true,
                  },
                },
              },
            },
            h5pContent: {
              select: {
                id: true,
                title: true,
                library: true,
              },
            },
          },
        },
        quizAttempts: {
          orderBy: { submittedAt: 'desc' },
          take: 1, // Lấy attempt gần nhất
        },
      },
      orderBy: [
        { pageBlock: { page: { lesson: { order: 'asc' } } } },
        { pageBlock: { page: { order: 'asc' } } },
        { pageBlock: { order: 'asc' } },
      ],
    });

    return progress;
  }

  // Lấy tiến độ theo bài học
  async getProgressByLesson(lessonId: string, userId?: string) {
    const whereCondition: any = {
      pageBlock: {
        page: {
          lessonId,
        },
      },
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    const progress = await this.prisma.studentProgress.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        pageBlock: {
          include: {
            page: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
            h5pContent: {
              select: {
                id: true,
                title: true,
                library: true,
              },
            },
          },
        },
        quizAttempts: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [
        { pageBlock: { page: { order: 'asc' } } },
        { pageBlock: { order: 'asc' } },
      ],
    });

    return progress;
  }

  // Lấy tóm tắt tiến độ
  async getProgressSummary(filters: ProgressSummaryDto) {
    const { userId, classId, bookId, lessonId, pageId } = filters;

    // Build where condition
    let whereCondition: any = {};

    if (userId) {
      whereCondition.userId = userId;
    }

    if (pageId) {
      whereCondition.pageBlock = {
        pageId,
      };
    } else if (lessonId) {
      whereCondition.pageBlock = {
        page: {
          lessonId,
        },
      };
    } else if (bookId) {
      whereCondition.pageBlock = {
        page: {
          lesson: {
            OR: [
              { bookId },
              { chapter: { bookId } },
            ],
          },
        },
      };
    }

    if (classId) {
      whereCondition.user = {
        classMemberships: {
          some: {
            classId,
          },
        },
      };
    }

    const [totalProgress, completedProgress, inProgressProgress] = await Promise.all([
      this.prisma.studentProgress.count({
        where: whereCondition,
      }),
      this.prisma.studentProgress.count({
        where: {
          ...whereCondition,
          status: ProgressStatus.COMPLETED,
        },
      }),
      this.prisma.studentProgress.count({
        where: {
          ...whereCondition,
          status: ProgressStatus.IN_PROGRESS,
        },
      }),
    ]);

    const notStartedProgress = totalProgress - completedProgress - inProgressProgress;
    const completionRate = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;

    return {
      total: totalProgress,
      completed: completedProgress,
      inProgress: inProgressProgress,
      notStarted: notStartedProgress,
      completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
    };
  }

  // Tạo quiz attempt
  async createQuizAttempt(createAttemptDto: CreateQuizAttemptDto, currentUserId?: string, currentUserRole?: Role) {
    const { studentProgressId, score, isPass, statement } = createAttemptDto;

    // Tìm student progress
    const studentProgress = await this.prisma.studentProgress.findUnique({
      where: { id: studentProgressId },
      include: {
        user: true,
        quizAttempts: {
          orderBy: { attemptNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!studentProgress) {
      throw new NotFoundException('Không tìm thấy tiến độ học tập');
    }

    // Kiểm tra quyền
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== studentProgress.userId) {
      throw new ForbiddenException('Bạn không có quyền tạo attempt cho tiến độ này');
    }

    // Tính attempt number
    const attemptNumber = studentProgress.quizAttempts.length > 0 
      ? studentProgress.quizAttempts[0].attemptNumber + 1 
      : 1;

    // Tạo quiz attempt
    const quizAttempt = await this.prisma.quizAttempt.create({
      data: {
        studentProgressId,
        attemptNumber,
        score,
        isPass,
        statement,
      },
    });

    // Cập nhật trạng thái tiến độ nếu pass
    if (isPass && studentProgress.status !== ProgressStatus.COMPLETED) {
      await this.prisma.studentProgress.update({
        where: { id: studentProgressId },
        data: {
          status: ProgressStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    return quizAttempt;
  }

  // Lấy quiz attempts của một progress
  async getQuizAttempts(studentProgressId: string, currentUserId?: string, currentUserRole?: Role) {
    // Tìm student progress để kiểm tra quyền
    const studentProgress = await this.prisma.studentProgress.findUnique({
      where: { id: studentProgressId },
      select: { userId: true },
    });

    if (!studentProgress) {
      throw new NotFoundException('Không tìm thấy tiến độ học tập');
    }

    // Kiểm tra quyền
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== studentProgress.userId) {
      throw new ForbiddenException('Bạn không có quyền xem attempts của tiến độ này');
    }

    const attempts = await this.prisma.quizAttempt.findMany({
      where: { studentProgressId },
      orderBy: { submittedAt: 'desc' },
    });

    return attempts;
  }

  // Xóa tiến độ
  async deleteProgress(userId: string, pageBlockId: string, currentUserId?: string, currentUserRole?: Role) {
    // Chỉ ADMIN mới có thể xóa tiến độ
    if (currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Chỉ Admin mới có thể xóa tiến độ học tập');
    }

    const existingProgress = await this.prisma.studentProgress.findUnique({
      where: {
        userId_pageBlockId: {
          userId,
          pageBlockId,
        },
      },
    });

    if (!existingProgress) {
      throw new NotFoundException('Không tìm thấy tiến độ học tập');
    }

    // Xóa quiz attempts trước
    await this.prisma.quizAttempt.deleteMany({
      where: { studentProgressId: existingProgress.id },
    });

    // Xóa progress
    await this.prisma.studentProgress.delete({
      where: {
        userId_pageBlockId: {
          userId,
          pageBlockId,
        },
      },
    });

    return { message: 'Xóa tiến độ học tập thành công' };
  }
}