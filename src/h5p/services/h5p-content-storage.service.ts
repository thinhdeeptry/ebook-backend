import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IContentMetadata, IUser } from '@lumieducation/h5p-server';

// Helper function to get the correct base path for different environments
function getBasePath(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? '/tmp' : process.cwd();
}

interface H5PUser {
  id: string;
  name: string;
  type: string;
}

interface H5PContentMetadata {
  title: string;
  mainLibrary: string;
  embedTypes?: string[];
  language?: string;
  preloadedDependencies?: any[];
  dynamicDependencies?: any[];
  editorDependencies?: any[];
  isPublic?: boolean;
}

@Injectable()
export class H5pContentStorage {
  constructor(private prisma: PrismaService) {}

  async addContent(
    metadata: H5PContentMetadata,
    content: any,
    user: H5PUser,
    lessonStepId?: string,
    contentId?: string
  ): Promise<string> {
    try {
      const h5pContent = await this.prisma.h5PContent.create({
        data: {
          id: contentId,
          title: metadata.title,
          library: metadata.mainLibrary,
          params: content,
          metadata: metadata as any,
          uploaderId: user.id,
          isPublic: metadata.isPublic || false,
        },
      });

      // If lessonStepId is provided, update the lesson step to link to this H5P content
      if (lessonStepId) {
        await this.prisma.lessonStep.update({
          where: { id: lessonStepId },
          data: { h5pContentId: h5pContent.id },
        });
      }

      return h5pContent.id;
    } catch (error) {
      throw new Error(`Failed to add H5P content: ${error.message}`);
    }
  }

  async contentExists(contentId: string): Promise<boolean> {
    const content = await this.prisma.h5PContent.findUnique({
      where: { id: contentId },
    });
    return !!content;
  }

  async deleteContent(contentId: string): Promise<void> {
    try {
      await this.prisma.h5PContent.delete({
        where: { id: contentId },
      });
    } catch (error) {
      throw new Error(`Failed to delete H5P content: ${error.message}`);
    }
  }

  async getContentFileStream(
    contentId: string,
    file: string
  ): Promise<NodeJS.ReadableStream> {
    // Files are stored in database only, no file system access needed
    throw new Error(`File system access disabled. Content files stored in database only: ${file}`);
  }

  async getContentMetadata(contentId: string): Promise<H5PContentMetadata> {
    const content = await this.prisma.h5PContent.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error(`H5P content not found: ${contentId}`);
    }

    return content.metadata as unknown as H5PContentMetadata;
  }

  async getContentObject(contentId: string): Promise<any> {
    const content = await this.prisma.h5PContent.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error(`H5P content not found: ${contentId}`);
    }

    return content.params;
  }

  async getParameters(contentId: string): Promise<any> {
    return this.getContentObject(contentId);
  }

  async listContent(user?: IUser): Promise<string[]> {
    const whereClause = user ? { uploaderId: user.id } : {};
    
    const contents = await this.prisma.h5PContent.findMany({
      where: whereClause,
      select: { id: true },
    });

    return contents.map(content => content.id);
  }

  async getUserContents(userId: string): Promise<any[]> {
    const contents = await this.prisma.h5PContent.findMany({
      where: { uploaderId: userId },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contents;
  }

  async getAllContents(): Promise<any[]> {
    const contents = await this.prisma.h5PContent.findMany({
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contents;
  }

  async saveContentFile(
    contentId: string,
    filename: string,
    dataStream: NodeJS.ReadableStream
  ): Promise<void> {
    // Files are stored in database only, no file system storage
    console.log(`Skipping file save to filesystem: ${filename} for content ${contentId}`);
  }

  async updateContent(
    contentId: string,
    metadata: IContentMetadata,
    content: any,
    user: IUser
  ): Promise<void> {
    try {
      await this.prisma.h5PContent.update({
        where: { id: contentId },
        data: {
          title: metadata.title,
          library: metadata.mainLibrary,
          params: content,
          metadata: metadata as any,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to update H5P content: ${error.message}`);
    }
  }

  async getUserPermissions(contentId: string, user: IUser): Promise<any> {
    const content = await this.prisma.h5PContent.findUnique({
      where: { id: contentId },
      include: { uploader: true },
    });

    if (!content) {
      throw new Error(`H5P content not found: ${contentId}`);
    }

    // Basic permissions - owner can edit, everyone can view public content
    return {
      canEdit: content.uploaderId === user.id || user.type === 'ADMIN',
      canView: content.isPublic || content.uploaderId === user.id || user.type === 'ADMIN',
    };
  }

  async contentFileExists(contentId: string, filename: string): Promise<boolean> {
    // Files are stored in database only, always return false for file system
    return false;
  }

  async deleteContentFile(contentId: string, filename: string): Promise<void> {
    // Files are stored in database only, no file system cleanup needed
    console.log(`Skipping file deletion from filesystem: ${filename} for content ${contentId}`);
  }

  async getContentFileStats(contentId: string, file: string): Promise<{ size: number; birthtime: Date; }> {
    // Files are stored in database only, return default stats
    return {
      size: 0,
      birthtime: new Date(),
    };
  }

  // ===== LESSON-SPECIFIC METHODS =====

  /**
   * Get H5P content for a specific lesson step
   */
  async getContentByLessonStep(lessonStepId: string): Promise<any> {
    try {
      const lessonStep = await this.prisma.lessonStep.findUnique({
        where: { id: lessonStepId },
        include: {
          h5pContent: {
            include: {
              uploader: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            }
          }
        }
      });

      if (!lessonStep || !lessonStep.h5pContent) {
        return null;
      }

      return {
        ...lessonStep.h5pContent,
        lessonStep: {
          id: lessonStep.id,
          title: lessonStep.title,
          order: lessonStep.order,
          contentType: lessonStep.contentType
        }
      };
    } catch (error) {
      throw new Error(`Failed to get content by lesson step: ${error.message}`);
    }
  }

  /**
   * Get all H5P contents for a specific lesson (all lesson steps)
   */
  async getContentByLesson(lessonId: string): Promise<any[]> {
    try {
      const lessonSteps = await this.prisma.lessonStep.findMany({
        where: { 
          lessonId: lessonId,
          contentType: 'H5P',
          h5pContentId: { not: null }
        },
        include: {
          h5pContent: {
            include: {
              uploader: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            }
          },
          lesson: {
            select: { id: true, title: true, description: true, order: true }
          }
        },
        orderBy: { order: 'asc' }
      });

      return lessonSteps.map(step => ({
        ...step.h5pContent,
        lessonStep: {
          id: step.id,
          title: step.title,
          order: step.order,
          contentType: step.contentType,
          lesson: step.lesson
        }
      }));
    } catch (error) {
      throw new Error(`Failed to get contents by lesson: ${error.message}`);
    }
  }

  /**
   * Get all H5P contents for a specific course (all lessons)
   */
  async getContentByCourse(courseId: string): Promise<any[]> {
    try {
      const lessonSteps = await this.prisma.lessonStep.findMany({
        where: { 
          lesson: { courseId: courseId },
          contentType: 'H5P',
          h5pContentId: { not: null }
        },
        include: {
          h5pContent: {
            include: {
              uploader: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            }
          },
          lesson: {
            select: { 
              id: true, 
              title: true, 
              description: true, 
              order: true,
              course: {
                select: { id: true, title: true, description: true }
              }
            }
          }
        },
        orderBy: [
          { lesson: { order: 'asc' } },
          { order: 'asc' }
        ]
      });

      return lessonSteps.map(step => ({
        ...step.h5pContent,
        lessonStep: {
          id: step.id,
          title: step.title,
          order: step.order,
          contentType: step.contentType,
          lesson: step.lesson
        }
      }));
    } catch (error) {
      throw new Error(`Failed to get contents by course: ${error.message}`);
    }
  }

  /**
   * Get all H5P contents for a specific class (all courses)
   */
  async getContentByClass(classId: string): Promise<any[]> {
    try {
      const lessonSteps = await this.prisma.lessonStep.findMany({
        where: { 
          lesson: { 
            course: { classId: classId }
          },
          contentType: 'H5P',
          h5pContentId: { not: null }
        },
        include: {
          h5pContent: {
            include: {
              uploader: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            }
          },
          lesson: {
            select: { 
              id: true, 
              title: true, 
              description: true, 
              order: true,
              course: {
                select: { 
                  id: true, 
                  title: true, 
                  description: true,
                  class: {
                    select: { id: true, name: true, gradeLevel: true }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { lesson: { course: { class: { gradeLevel: 'asc' } } } },
          { lesson: { order: 'asc' } },
          { order: 'asc' }
        ]
      });

      return lessonSteps.map(step => ({
        ...step.h5pContent,
        lessonStep: {
          id: step.id,
          title: step.title,
          order: step.order,
          contentType: step.contentType,
          lesson: step.lesson
        }
      }));
    } catch (error) {
      throw new Error(`Failed to get contents by class: ${error.message}`);
    }
  }
}