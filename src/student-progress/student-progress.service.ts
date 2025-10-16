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
    const { userId, lessonStepId, status = ProgressStatus.NOT_STARTED } = createProgressDto;

    // Kiểm tra quyền: chỉ ADMIN/TEACHER hoặc chính học sinh mới có thể tạo tiến độ
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== userId) {
      throw new ForbiddenException('Bạn không có quyền tạo tiến độ cho người dùng khác');
    }

    // Kiểm tra user và lessonStep có tồn tại không
    const [user, lessonStep] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.lessonStep.findUnique({ 
        where: { id: lessonStepId },
        include: {
          lesson: {
            include: {
              course: {
                include: {
                  class: true,
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
    if (!lessonStep) {
      throw new NotFoundException('Không tìm thấy bước học');
    }

    // Kiểm tra học sinh có trong lớp của khóa học không
    const classMembership = await this.prisma.classMembership.findFirst({
      where: {
        userId,
        classId: lessonStep.lesson.course.classId,
      },
    });

    if (!classMembership && currentUserRole === Role.STUDENT) {
      throw new ForbiddenException('Bạn không thuộc lớp học của bài học này');
    }

    // Tạo tiến độ (nếu chưa tồn tại)
    return this.prisma.studentProgress.upsert({
      where: {
        userId_lessonStepId: {
          userId,
          lessonStepId,
        },
      },
      update: {
        status,
        lastAccessed: new Date(),
        ...(status === ProgressStatus.COMPLETED && { completedAt: new Date() }),
      },
      create: {
        userId,
        lessonStepId,
        status,
        lastAccessed: new Date(),
        ...(status === ProgressStatus.COMPLETED && { completedAt: new Date() }),
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
        lessonStep: {
          select: {
            id: true,
            title: true,
            contentType: true,
            lesson: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    class: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Lấy tiến độ của một học sinh
  async getStudentProgress(userId: string, currentUserId?: string, currentUserRole?: Role) {
    // Kiểm tra quyền
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem tiến độ của người dùng khác');
    }

    return this.prisma.studentProgress.findMany({
      where: { userId },
      include: {
        lessonStep: {
          select: {
            id: true,
            title: true,
            contentType: true,
            order: true,
            lesson: {
              select: {
                id: true,
                title: true,
                order: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    class: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        quizAttempts: {
          select: {
            id: true,
            attemptNumber: true,
            score: true,
            isPass: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: [
        { lessonStep: { lesson: { course: { class: { gradeLevel: 'asc' } } } } },
        { lessonStep: { lesson: { order: 'asc' } } },
        { lessonStep: { order: 'asc' } },
      ],
    });
  }

  // Cập nhật tiến độ
  async updateProgress(id: string, updateProgressDto: UpdateStudentProgressDto, currentUserId?: string, currentUserRole?: Role) {
    const existingProgress = await this.prisma.studentProgress.findUnique({
      where: { id },
      include: {
        user: { select: { id: true } },
      },
    });

    if (!existingProgress) {
      throw new NotFoundException('Không tìm thấy tiến độ học tập');
    }

    // Kiểm tra quyền
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== existingProgress.user.id) {
      throw new ForbiddenException('Bạn không có quyền cập nhật tiến độ của người dùng khác');
    }

    const { status } = updateProgressDto;

    return this.prisma.studentProgress.update({
      where: { id },
      data: {
        ...(status && { status }),
        lastAccessed: new Date(),
        ...(status === ProgressStatus.COMPLETED && { completedAt: new Date() }),
      },
      include: {
        lessonStep: {
          select: {
            id: true,
            title: true,
            contentType: true,
          },
        },
      },
    });
  }

  // Tạo lần thử quiz
  async createQuizAttempt(createAttemptDto: CreateQuizAttemptDto, currentUserId?: string, currentUserRole?: Role) {
    const { studentProgressId, score, isPass, statement } = createAttemptDto;

    const studentProgress = await this.prisma.studentProgress.findUnique({
      where: { id: studentProgressId },
      include: {
        user: { select: { id: true } },
        quizAttempts: { select: { attemptNumber: true } },
      },
    });

    if (!studentProgress) {
      throw new NotFoundException('Không tìm thấy tiến độ học tập');
    }

    // Kiểm tra quyền
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== studentProgress.user.id) {
      throw new ForbiddenException('Bạn không có quyền tạo lần thử cho người dùng khác');
    }

    // Tính số lần thử tiếp theo
    const maxAttempt = Math.max(...studentProgress.quizAttempts.map(a => a.attemptNumber), 0);
    const nextAttemptNumber = maxAttempt + 1;

    return this.prisma.quizAttempt.create({
      data: {
        studentProgressId,
        attemptNumber: nextAttemptNumber,
        score,
        isPass,
        statement,
      },
      include: {
        studentProgress: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            lessonStep: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  // Lấy lịch sử quiz attempts
  async getQuizAttempts(studentProgressId: string, currentUserId?: string, currentUserRole?: Role) {
    const studentProgress = await this.prisma.studentProgress.findUnique({
      where: { id: studentProgressId },
      include: {
        user: { select: { id: true } },
      },
    });

    if (!studentProgress) {
      throw new NotFoundException('Không tìm thấy tiến độ học tập');
    }

    // Kiểm tra quyền
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.TEACHER && currentUserId !== studentProgress.user.id) {
      throw new ForbiddenException('Bạn không có quyền xem lịch sử quiz của người dùng khác');
    }

    return this.prisma.quizAttempt.findMany({
      where: { studentProgressId },
      orderBy: { submittedAt: 'desc' },
      include: {
        studentProgress: {
          select: {
            lessonStep: {
              select: {
                id: true,
                title: true,
                contentType: true,
              },
            },
          },
        },
      },
    });
  }

  // Thống kê tiến độ tổng quan
  async getProgressSummary(filters?: ProgressSummaryDto, currentUserId?: string, currentUserRole?: Role) {
    let whereCondition: any = {};

    // Xử lý quyền truy cập
    if (currentUserRole === Role.STUDENT) {
      whereCondition.userId = currentUserId;
    } else if (filters?.userId) {
      whereCondition.userId = filters.userId;
    }

    // Thêm các filter khác
    if (filters?.lessonId) {
      whereCondition.lessonStep = {
        lessonId: filters.lessonId,
      };
    } else if (filters?.courseId) {
      whereCondition.lessonStep = {
        lesson: {
          courseId: filters.courseId,
        },
      };
    } else if (filters?.classId) {
      whereCondition.lessonStep = {
        lesson: {
          course: {
            classId: filters.classId,
          },
        },
      };
    }

    const [totalProgress, progressByStatus, completedCount] = await Promise.all([
      // Tổng số tiến độ
      this.prisma.studentProgress.count({
        where: whereCondition,
      }),

      // Phân loại theo trạng thái
      this.prisma.studentProgress.groupBy({
        by: ['status'],
        where: whereCondition,
        _count: {
          id: true,
        },
      }),

      // Số lượng hoàn thành
      this.prisma.studentProgress.count({
        where: {
          ...whereCondition,
          status: ProgressStatus.COMPLETED,
          completedAt: { not: null },
        },
      }),
    ]);

    return {
      totalProgress,
      progressByStatus: progressByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {}),
      completionRate: totalProgress > 0 ? 
        ((progressByStatus.find(p => p.status === ProgressStatus.COMPLETED)?._count.id || 0) / totalProgress * 100) : 0,
    };
  }

  // Lấy tiến độ theo bài học
  async getLessonProgress(lessonId: string, currentUserId?: string, currentUserRole?: Role) {
    // Kiểm tra bài học có tồn tại không
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học');
    }

    let whereCondition: any = {
      lessonStep: {
        lessonId,
      },
    };

    // Nếu là học sinh, chỉ xem tiến độ của mình
    if (currentUserRole === Role.STUDENT) {
      whereCondition.userId = currentUserId;
    }

    return this.prisma.studentProgress.findMany({
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
        lessonStep: {
          select: {
            id: true,
            title: true,
            order: true,
            contentType: true,
          },
        },
        quizAttempts: {
          select: {
            id: true,
            attemptNumber: true,
            score: true,
            isPass: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: 'desc' },
          take: 1, // Chỉ lấy lần thử gần nhất
        },
      },
      orderBy: [
        { lessonStep: { order: 'asc' } },
        { user: { lastName: 'asc' } },
      ],
    });
  }

  // Xóa tiến độ (chỉ ADMIN)
  async removeProgress(id: string, currentUserRole?: Role) {
    if (currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền xóa tiến độ học tập');
    }

    const progress = await this.prisma.studentProgress.findUnique({
      where: { id },
    });

    if (!progress) {
      throw new NotFoundException('Không tìm thấy tiến độ học tập');
    }

    await this.prisma.studentProgress.delete({
      where: { id },
    });

    return { message: 'Đã xóa tiến độ học tập thành công' };
  }
}