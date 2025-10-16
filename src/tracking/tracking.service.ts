import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTrackingDto, TrackingQueryDto } from './dto/tracking.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async create(createTrackingDto: CreateTrackingDto, actorId: string) {
    // Validate xAPI statement structure
    this.validateXAPIStatement(createTrackingDto.statement);

    // Check if content exists if contentId is provided
    if (createTrackingDto.contentId) {
      const content = await this.prisma.h5PContent.findUnique({
        where: { id: createTrackingDto.contentId },
      });
      
      if (!content) {
        throw new NotFoundException('Content not found');
      }
    }

    const trackingEvent = await this.prisma.trackingEvent.create({
      data: {
        ...createTrackingDto,
        actorId,
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            library: true,
          },
        },
      },
    });

    return trackingEvent;
  }

  async findAll(queryDto: TrackingQueryDto, requesterId: string, requesterRole: Role) {
    // Students can only see their own tracking data
    // Teachers can see data for their content
    // Admins can see all data
    
    const where: any = {};

    if (requesterRole === Role.STUDENT) {
      where.actorId = requesterId;
    } else if (requesterRole === Role.TEACHER) {
      if (queryDto.userId) {
        where.actorId = queryDto.userId;
        // Verify teacher has access to this data (through content ownership)
        if (queryDto.contentId) {
          const content = await this.prisma.h5PContent.findFirst({
            where: {
              id: queryDto.contentId,
              uploaderId: requesterId,
            },
          });
          if (!content) {
            throw new ForbiddenException('Access denied to this content data');
          }
        }
      } else {
        // Show data for teacher's content
        const teacherContent = await this.prisma.h5PContent.findMany({
          where: { uploaderId: requesterId },
          select: { id: true },
        });
        where.contentId = { in: teacherContent.map(c => c.id) };
      }
    }
    // Admin role has no restrictions

    // Apply additional filters
    if (queryDto.contentId) {
      where.contentId = queryDto.contentId;
    }
    if (queryDto.verb) {
      where.verb = queryDto.verb;
    }
    if (queryDto.startDate || queryDto.endDate) {
      where.timestamp = {};
      if (queryDto.startDate) {
        where.timestamp.gte = new Date(queryDto.startDate);
      }
      if (queryDto.endDate) {
        where.timestamp.lte = new Date(queryDto.endDate);
      }
    }

    return this.prisma.trackingEvent.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            library: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findOne(id: string, requesterId: string, requesterRole: Role) {
    const trackingEvent = await this.prisma.trackingEvent.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            library: true,
          },
        },
      },
    });

    if (!trackingEvent) {
      throw new NotFoundException('Tracking event not found');
    }

    // Check access permissions
    if (requesterRole === Role.STUDENT && trackingEvent.actorId !== requesterId) {
      throw new ForbiddenException('Access denied');
    }

    if (requesterRole === Role.TEACHER) {
      // Teacher can access if it's their content or their own data
      const isOwnData = trackingEvent.actorId === requesterId;
      const isOwnContent = trackingEvent.content && 
        await this.prisma.h5PContent.findFirst({
          where: {
            id: trackingEvent.contentId,
            uploaderId: requesterId,
          },
        });
      
      if (!isOwnData && !isOwnContent) {
        throw new ForbiddenException('Access denied');
      }
    }

    return trackingEvent;
  }

  async getAnalytics(queryDto: TrackingQueryDto, requesterId: string, requesterRole: Role) {
    // Similar access control as findAll
    const where: any = {};

    if (requesterRole === Role.STUDENT) {
      where.actorId = requesterId;
    } else if (requesterRole === Role.TEACHER) {
      if (queryDto.userId) {
        where.actorId = queryDto.userId;
      } else {
        const teacherContent = await this.prisma.h5PContent.findMany({
          where: { uploaderId: requesterId },
          select: { id: true },
        });
        where.contentId = { in: teacherContent.map(c => c.id) };
      }
    }

    if (queryDto.contentId) {
      where.contentId = queryDto.contentId;
    }

    // Get basic statistics
    const totalEvents = await this.prisma.trackingEvent.count({ where });
    
    const verbStats = await this.prisma.trackingEvent.groupBy({
      by: ['verb'],
      where,
      _count: {
        verb: true,
      },
    });

    const userStats = await this.prisma.trackingEvent.groupBy({
      by: ['actorId'],
      where,
      _count: {
        actorId: true,
      },
    });

    const contentStats = await this.prisma.trackingEvent.groupBy({
      by: ['contentId'],
      where: {
        ...where,
        contentId: { not: null },
      },
      _count: {
        contentId: true,
      },
    });

    return {
      totalEvents,
      verbDistribution: verbStats.map(stat => ({
        verb: stat.verb,
        count: stat._count.verb,
      })),
      activeUsers: userStats.length,
      contentEngagement: contentStats.map(stat => ({
        contentId: stat.contentId,
        interactions: stat._count.contentId,
      })),
    };
  }

  async getUserProgress(userId: string, contentId?: string, requesterId?: string, requesterRole?: Role) {
    // Check access permissions
    if (requesterRole === Role.STUDENT && userId !== requesterId) {
      throw new ForbiddenException('Access denied');
    }

    const where: any = { actorId: userId };
    if (contentId) {
      where.contentId = contentId;
    }

    const events = await this.prisma.trackingEvent.findMany({
      where,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            library: true,
          },
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Process events to calculate progress
    const progress = this.calculateUserProgress(events);
    
    return progress;
  }

  private validateXAPIStatement(statement: any) {
    if (!statement || typeof statement !== 'object') {
      throw new BadRequestException('Invalid xAPI statement structure');
    }

    if (!statement.actor || !statement.verb || !statement.object) {
      throw new BadRequestException('xAPI statement must contain actor, verb, and object');
    }

    // Additional validation can be added here
    return true;
  }

  private calculateUserProgress(events: any[]) {
    // Group events by content
    const contentProgress = new Map();

    events.forEach(event => {
      const contentId = event.contentId || 'unknown';
      
      if (!contentProgress.has(contentId)) {
        contentProgress.set(contentId, {
          contentId,
          contentTitle: event.content?.title || 'Unknown',
          totalInteractions: 0,
          completedSections: new Set(),
          lastActivity: event.timestamp,
          progress: 0,
        });
      }

      const progress = contentProgress.get(contentId);
      progress.totalInteractions++;
      progress.lastActivity = event.timestamp;

      // Calculate progress based on verb types
      if (event.verb === 'completed') {
        progress.completedSections.add(event.objectId);
      }
    });

    // Convert to array and calculate final progress
    return Array.from(contentProgress.values()).map(progress => ({
      ...progress,
      completedSections: progress.completedSections.size,
      progress: Math.min(100, (progress.completedSections / Math.max(1, progress.totalInteractions)) * 100),
    }));
  }

  async remove(id: string, requesterId: string, requesterRole: Role) {
    const trackingEvent = await this.findOne(id, requesterId, requesterRole);

    // Only admin can delete tracking events
    if (requesterRole !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can delete tracking events');
    }

    await this.prisma.trackingEvent.delete({
      where: { id },
    });

    return { message: 'Tracking event deleted successfully' };
  }
}