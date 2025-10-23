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

      // If pageBlockId is provided, update the page block to link to this H5P content
      if (lessonStepId) {
        await this.prisma.pageBlock.update({
          where: { id: lessonStepId }, // Using same variable name for compatibility
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
   * Get H5P content for a specific page block
   */
  async getContentByPageBlock(pageBlockId: string): Promise<any> {
    try {
      const pageBlock = await this.prisma.pageBlock.findUnique({
        where: { id: pageBlockId },
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

      if (!pageBlock || !pageBlock.h5pContent) {
        return null;
      }

      return {
        ...pageBlock.h5pContent,
        pageBlock: {
          id: pageBlock.id,
          blockType: pageBlock.blockType,
          order: pageBlock.order,
          contentJson: pageBlock.contentJson
        }
      };
    } catch (error) {
      throw new Error(`Failed to get content by page block: ${error.message}`);
    }
  }

  /**
   * Get all H5P contents for a specific page (all page blocks)
   */
  async getContentByPage(pageId: string): Promise<any[]> {
    try {
      const pageBlocks = await this.prisma.pageBlock.findMany({
        where: { 
          pageId: pageId,
          blockType: 'H5P',
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
          page: {
            select: { id: true, title: true, order: true }
          }
        },
        orderBy: { order: 'asc' }
      });

      return pageBlocks.map(block => ({
        ...block.h5pContent,
        pageBlock: {
          id: block.id,
          blockType: block.blockType,
          order: block.order,
          contentJson: block.contentJson,
          page: block.page
        }
      }));
    } catch (error) {
      throw new Error(`Failed to get contents by page: ${error.message}`);
    }
  }

  /**
   * Get all H5P contents for a specific course (all lessons)
   */
  async getContentByBook(bookId: string): Promise<any[]> {
    try {
      const pageBlocks = await this.prisma.pageBlock.findMany({
        where: { 
          page: { 
            lesson: { 
              chapter: { 
                bookId: bookId 
              } 
            } 
          },
          blockType: 'H5P',
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
          page: {
            select: { 
              id: true, 
              title: true, 
              order: true,
              lesson: {
                select: { 
                  id: true, 
                  title: true, 
                  order: true,
                  chapter: {
                    select: { 
                      id: true, 
                      title: true, 
                      order: true,
                      book: {
                        select: { id: true, title: true, subject: true, grade: true }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { page: { lesson: { chapter: { order: 'asc' } } } },
          { page: { lesson: { order: 'asc' } } },
          { page: { order: 'asc' } },
          { order: 'asc' }
        ]
      });

      return pageBlocks.map(block => ({
        ...block.h5pContent,
        pageBlock: {
          id: block.id,
          blockType: block.blockType,
          order: block.order,
          contentJson: block.contentJson,
          page: block.page
        }
      }));
    } catch (error) {
      throw new Error(`Failed to get contents by book: ${error.message}`);
    }
  }

  /**
   * Get all H5P contents for a specific class (all books)
   */
  async getContentByClass(classId: string): Promise<any[]> {
    try {
      const pageBlocks = await this.prisma.pageBlock.findMany({
        where: { 
          page: {
            lesson: {
              chapter: {
                book: {
                  classes: {
                    some: { id: classId }
                  }
                }
              }
            }
          },
          blockType: 'H5P',
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
          page: {
            select: { 
              id: true, 
              title: true, 
              order: true,
              lesson: {
                select: { 
                  id: true, 
                  title: true, 
                  order: true,
                  chapter: {
                    select: { 
                      id: true, 
                      title: true, 
                      order: true,
                      book: {
                        select: { 
                          id: true, 
                          title: true, 
                          subject: true,
                          grade: true,
                          classes: {
                            select: { id: true, name: true, gradeLevel: true }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { page: { lesson: { chapter: { book: { grade: 'asc' } } } } },
          { page: { lesson: { chapter: { order: 'asc' } } } },
          { page: { lesson: { order: 'asc' } } },
          { page: { order: 'asc' } },
          { order: 'asc' }
        ]
      });

      return pageBlocks.map(block => ({
        ...block.h5pContent,
        pageBlock: {
          id: block.id,
          blockType: block.blockType,
          order: block.order,
          contentJson: block.contentJson,
          page: block.page
        }
      }));
    } catch (error) {
      throw new Error(`Failed to get contents by class: ${error.message}`);
    }
  }
}