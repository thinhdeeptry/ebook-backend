import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateLessonStepDto, UpdateLessonStepDto, ReorderLessonStepsDto } from './dto/lesson-step.dto';
import { LessonStepType } from '@prisma/client';

@Injectable()
export class LessonStepsService {
  constructor(private prisma: PrismaService) {}

  // Tạo bước học mới
  async create(createLessonStepDto: CreateLessonStepDto) {
    const { lessonId, contentType, textContent, videoUrl, h5pContentId, ...rest } = createLessonStepDto;

    // Kiểm tra bài học có tồn tại không
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học');
    }

    // Nếu không có order, tự động tính order tiếp theo
    let order = rest.order;
    if (order === undefined) {
      const maxOrder = await this.prisma.lessonStep.findFirst({
        where: { lessonId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (maxOrder?.order ?? 0) + 1;
    }

    // Tạo contentJson dựa trên loại nội dung
    let contentJson: any = {};
    
    switch (contentType) {
      case LessonStepType.TEXT:
        if (!textContent) {
          throw new BadRequestException('Nội dung văn bản không được để trống khi loại bước học là TEXT');
        }
        contentJson = { text: textContent };
        break;
      
      case LessonStepType.VIDEO:
        if (!videoUrl) {
          throw new BadRequestException('URL video không được để trống khi loại bước học là VIDEO');
        }
        contentJson = { url: videoUrl };
        break;
      
      case LessonStepType.H5P:
        if (!h5pContentId) {
          throw new BadRequestException('ID nội dung H5P không được để trống khi loại bước học là H5P');
        }
        // Kiểm tra H5P content có tồn tại không
        const h5pContent = await this.prisma.h5PContent.findUnique({
          where: { id: h5pContentId },
        });
        if (!h5pContent) {
          throw new NotFoundException('Không tìm thấy nội dung H5P');
        }
        contentJson = { h5pContentId };
        break;
    }

    return this.prisma.lessonStep.create({
      data: {
        ...rest,
        lessonId,
        order,
        contentType,
        contentJson,
        h5pContentId: contentType === LessonStepType.H5P ? h5pContentId : null,
      },
      include: {
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
        h5pContent: contentType === LessonStepType.H5P ? {
          select: {
            id: true,
            title: true,
            library: true,
          },
        } : false,
      },
    });
  }

  // Lấy tất cả bước học của một bài học
  async findAllByLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học');
    }

    return this.prisma.lessonStep.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' },
      include: {
        h5pContent: true,
        _count: {
          select: {
            studentProgress: true,
          },
        },
      },
    });
  }

  // Lấy một bước học theo ID
  async findOne(id: string) {
    const lessonStep = await this.prisma.lessonStep.findUnique({
      where: { id },
      include: {
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
        h5pContent: {
          select: {
            id: true,
            title: true,
            library: true,
            params: true,
          },
        },
        _count: {
          select: {
            studentProgress: true,
          },
        },
      },
    });

    if (!lessonStep) {
      throw new NotFoundException('Không tìm thấy bước học');
    }

    return lessonStep;
  }

  // Cập nhật bước học
  async update(id: string, updateLessonStepDto: UpdateLessonStepDto) {
    const existingStep = await this.prisma.lessonStep.findUnique({
      where: { id },
    });

    if (!existingStep) {
      throw new NotFoundException('Không tìm thấy bước học');
    }

    const { contentType, textContent, videoUrl, h5pContentId, ...rest } = updateLessonStepDto;

    let contentJson = existingStep.contentJson;
    let newH5pContentId = existingStep.h5pContentId;

    // Nếu có thay đổi loại nội dung, cập nhật contentJson
    if (contentType !== undefined) {
      switch (contentType) {
        case LessonStepType.TEXT:
          if (textContent !== undefined) {
            contentJson = { text: textContent };
          }
          newH5pContentId = null;
          break;
        
        case LessonStepType.VIDEO:
          if (videoUrl !== undefined) {
            contentJson = { url: videoUrl };
          }
          newH5pContentId = null;
          break;
        
        case LessonStepType.H5P:
          if (h5pContentId !== undefined) {
            // Kiểm tra H5P content có tồn tại không
            const h5pContent = await this.prisma.h5PContent.findUnique({
              where: { id: h5pContentId },
            });
            if (!h5pContent) {
              throw new NotFoundException('Không tìm thấy nội dung H5P');
            }
            contentJson = { h5pContentId };
            newH5pContentId = h5pContentId;
          }
          break;
      }
    } else {
      // Nếu không thay đổi loại nội dung nhưng có cập nhật nội dung
      if (textContent !== undefined && existingStep.contentType === LessonStepType.TEXT) {
        contentJson = { text: textContent };
      }
      if (videoUrl !== undefined && existingStep.contentType === LessonStepType.VIDEO) {
        contentJson = { url: videoUrl };
      }
      if (h5pContentId !== undefined && existingStep.contentType === LessonStepType.H5P) {
        const h5pContent = await this.prisma.h5PContent.findUnique({
          where: { id: h5pContentId },
        });
        if (!h5pContent) {
          throw new NotFoundException('Không tìm thấy nội dung H5P');
        }
        contentJson = { h5pContentId };
        newH5pContentId = h5pContentId;
      }
    }

    return this.prisma.lessonStep.update({
      where: { id },
      data: {
        ...rest,
        ...(contentType !== undefined && { contentType }),
        contentJson,
        h5pContentId: newH5pContentId,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
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
    });
  }

  // Xóa bước học
  async remove(id: string) {
    const lessonStep = await this.prisma.lessonStep.findUnique({
      where: { id },
      select: {
        id: true,
        order: true,
        lessonId: true,
      },
    });

    if (!lessonStep) {
      throw new NotFoundException('Không tìm thấy bước học');
    }

    // Xóa bước học và cập nhật lại thứ tự các bước còn lại
    await this.prisma.$transaction(async (tx) => {
      // Xóa bước học
      await tx.lessonStep.delete({
        where: { id },
      });

      // Cập nhật lại thứ tự các bước học sau bước bị xóa
      await tx.lessonStep.updateMany({
        where: {
          lessonId: lessonStep.lessonId,
          order: {
            gt: lessonStep.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });
    });

    return { message: 'Đã xóa bước học thành công' };
  }

  // Sắp xếp lại thứ tự các bước học
  async reorderSteps(lessonId: string, reorderDto: ReorderLessonStepsDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học');
    }

    const { stepIds } = reorderDto;

    // Kiểm tra tất cả stepIds có thuộc về lesson này không
    const steps = await this.prisma.lessonStep.findMany({
      where: {
        id: { in: stepIds },
        lessonId,
      },
    });

    if (steps.length !== stepIds.length) {
      throw new BadRequestException('Một hoặc nhiều bước học không thuộc về bài học này');
    }

    // Cập nhật thứ tự
    await this.prisma.$transaction(
      stepIds.map((stepId, index) =>
        this.prisma.lessonStep.update({
          where: { id: stepId },
          data: { order: index + 1 },
        })
      )
    );

    return { message: 'Đã cập nhật thứ tự bước học thành công' };
  }

  // Sao chép bước học
  async duplicateStep(id: string) {
    const originalStep = await this.prisma.lessonStep.findUnique({
      where: { id },
    });

    if (!originalStep) {
      throw new NotFoundException('Không tìm thấy bước học');
    }

    // Tìm order tiếp theo
    const maxOrder = await this.prisma.lessonStep.findFirst({
      where: { lessonId: originalStep.lessonId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (maxOrder?.order ?? 0) + 1;

    return this.prisma.lessonStep.create({
      data: {
        title: `${originalStep.title} (Bản sao)`,
        order: newOrder,
        contentType: originalStep.contentType,
        contentJson: originalStep.contentJson,
        lessonId: originalStep.lessonId,
        h5pContentId: originalStep.h5pContentId,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
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
    });
  }

  // Tìm kiếm bước học theo từ khóa
  async searchSteps(lessonId?: string, searchTerm?: string) {
    const whereConditions: any = {};

    if (lessonId) {
      whereConditions.lessonId = lessonId;
    }

    if (searchTerm) {
      whereConditions.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    return this.prisma.lessonStep.findMany({
      where: whereConditions,
      orderBy: [
        { lessonId: 'asc' },
        { order: 'asc' },
      ],
      include: {
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
        h5pContent: {
          select: {
            id: true,
            title: true,
            library: true,
          },
        },
        _count: {
          select: {
            studentProgress: true,
          },
        },
      },
    });
  }

  // Thống kê bước học
  async getStepsStatistics(lessonId?: string) {
    const whereCondition = lessonId ? { lessonId } : {};

    const [totalSteps, stepsByType, stepsWithProgress] = await Promise.all([
      // Tổng số bước học
      this.prisma.lessonStep.count({
        where: whereCondition,
      }),

      // Phân loại theo loại nội dung
      this.prisma.lessonStep.groupBy({
        by: ['contentType'],
        where: whereCondition,
        _count: {
          id: true,
        },
      }),

      // Bước học có tiến độ học sinh
      this.prisma.lessonStep.count({
        where: {
          ...whereCondition,
          studentProgress: {
            some: {},
          },
        },
      }),
    ]);

    return {
      totalSteps,
      stepsByType: stepsByType.reduce((acc, item) => {
        acc[item.contentType] = item._count.id;
        return acc;
      }, {}),
      stepsWithProgress,
      stepsWithoutProgress: totalSteps - stepsWithProgress,
    };
  }
}