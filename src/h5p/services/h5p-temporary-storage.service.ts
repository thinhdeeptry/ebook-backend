import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as path from 'path';
import * as fs from 'fs/promises';

// Custom interfaces for temporary storage
export interface H5PTemporaryFile {
  id: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface H5PUploadedFile {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class H5pTemporaryStorage {
  private readonly uploadDir: string;

  constructor(private prisma: PrismaService) {
    // Use /tmp for production to avoid EROFS errors on serverless
    const isProduction = process.env.NODE_ENV === 'production';
    const basePath = isProduction ? '/tmp' : process.cwd();
    this.uploadDir = path.join(basePath, 'uploads', 'h5p', 'temp');
    this.ensureUploadDir();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Store a temporary file
   */
  async saveTemporaryFile(
    file: H5PUploadedFile,
    userId: string,
    expirationHours: number = 24
  ): Promise<H5PTemporaryFile> {
    await this.ensureUploadDir();

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2);
    const extension = path.extname(file.filename);
    const basename = path.basename(file.filename, extension);
    const uniqueFilename = `${basename}_${timestamp}_${randomSuffix}${extension}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    // Write file to disk
    await fs.writeFile(filePath, file.buffer);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Store in database
    const temporaryFile = await this.prisma.h5PTemporaryFile.create({
      data: {
        filename: file.filename,
        path: filePath,
        size: BigInt(file.size),
        mimetype: file.mimetype,
        userId: userId,
        expiresAt: expiresAt,
      },
    });

    return {
      id: temporaryFile.id,
      filename: temporaryFile.filename,
      path: temporaryFile.path,
      size: Number(temporaryFile.size),
      mimetype: temporaryFile.mimetype,
      userId: temporaryFile.userId,
      createdAt: temporaryFile.createdAt,
      expiresAt: temporaryFile.expiresAt,
    };
  }

  /**
   * Get temporary file by ID
   */
  async getTemporaryFile(id: string): Promise<H5PTemporaryFile | null> {
    const temporaryFile = await this.prisma.h5PTemporaryFile.findUnique({
      where: { id },
    });

    if (!temporaryFile) {
      return null;
    }

    return {
      id: temporaryFile.id,
      filename: temporaryFile.filename,
      path: temporaryFile.path,
      size: Number(temporaryFile.size),
      mimetype: temporaryFile.mimetype,
      userId: temporaryFile.userId,
      createdAt: temporaryFile.createdAt,
      expiresAt: temporaryFile.expiresAt,
    };
  }

  /**
   * Get temporary files by user ID
   */
  async getUserTemporaryFiles(userId: string): Promise<H5PTemporaryFile[]> {
    const temporaryFiles = await this.prisma.h5PTemporaryFile.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(), // Only non-expired files
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return temporaryFiles.map(file => ({
      id: file.id,
      filename: file.filename,
      path: file.path,
      size: Number(file.size),
      mimetype: file.mimetype,
      userId: file.userId,
      createdAt: file.createdAt,
      expiresAt: file.expiresAt,
    }));
  }

  /**
   * Read temporary file content
   */
  async readTemporaryFile(id: string): Promise<Buffer | null> {
    const temporaryFile = await this.getTemporaryFile(id);
    
    if (!temporaryFile) {
      return null;
    }

    // Check if file has expired
    if (new Date() > temporaryFile.expiresAt) {
      await this.deleteTemporaryFile(id);
      return null;
    }

    try {
      return await fs.readFile(temporaryFile.path);
    } catch (error) {
      console.error('Error reading temporary file:', error);
      return null;
    }
  }

  /**
   * Delete temporary file
   */
  async deleteTemporaryFile(id: string): Promise<void> {
    const temporaryFile = await this.getTemporaryFile(id);
    
    if (!temporaryFile) {
      return;
    }

    // Delete from filesystem
    try {
      await fs.unlink(temporaryFile.path);
    } catch (error) {
      console.error('Error deleting temporary file from filesystem:', error);
    }

    // Delete from database
    await this.prisma.h5PTemporaryFile.delete({
      where: { id },
    });
  }

  /**
   * Delete user's temporary files
   */
  async deleteUserTemporaryFiles(userId: string): Promise<void> {
    const userFiles = await this.prisma.h5PTemporaryFile.findMany({
      where: { userId },
    });

    // Delete files from filesystem
    for (const file of userFiles) {
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error('Error deleting temporary file from filesystem:', error);
      }
    }

    // Delete from database
    await this.prisma.h5PTemporaryFile.deleteMany({
      where: { userId },
    });
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await this.prisma.h5PTemporaryFile.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    let cleanedCount = 0;

    for (const file of expiredFiles) {
      try {
        await fs.unlink(file.path);
        await this.prisma.h5PTemporaryFile.delete({
          where: { id: file.id },
        });
        cleanedCount++;
      } catch (error) {
        console.error('Error cleaning up expired file:', error);
      }
    }

    return cleanedCount;
  }

  /**
   * Get temporary file path
   */
  async getTemporaryFilePath(id: string): Promise<string | null> {
    const temporaryFile = await this.getTemporaryFile(id);
    return temporaryFile ? temporaryFile.path : null;
  }

  /**
   * Check if temporary file exists
   */
  async temporaryFileExists(id: string): Promise<boolean> {
    const temporaryFile = await this.getTemporaryFile(id);
    
    if (!temporaryFile) {
      return false;
    }

    // Check if file has expired
    if (new Date() > temporaryFile.expiresAt) {
      await this.deleteTemporaryFile(id);
      return false;
    }

    // Check if file exists on filesystem
    try {
      await fs.access(temporaryFile.path);
      return true;
    } catch {
      // File doesn't exist on filesystem, clean up database record
      await this.prisma.h5PTemporaryFile.delete({
        where: { id },
      });
      return false;
    }
  }

  /**
   * Extend temporary file expiration
   */
  async extendTemporaryFile(id: string, additionalHours: number = 24): Promise<H5PTemporaryFile | null> {
    const temporaryFile = await this.getTemporaryFile(id);
    
    if (!temporaryFile) {
      return null;
    }

    const newExpiresAt = new Date(temporaryFile.expiresAt);
    newExpiresAt.setHours(newExpiresAt.getHours() + additionalHours);

    const updatedFile = await this.prisma.h5PTemporaryFile.update({
      where: { id },
      data: {
        expiresAt: newExpiresAt,
      },
    });

    return {
      id: updatedFile.id,
      filename: updatedFile.filename,
      path: updatedFile.path,
      size: Number(updatedFile.size),
      mimetype: updatedFile.mimetype,
      userId: updatedFile.userId,
      createdAt: updatedFile.createdAt,
      expiresAt: updatedFile.expiresAt,
    };
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    expiredFiles: number;
    activeFiles: number;
  }> {
    const now = new Date();
    
    const [totalFiles, expiredFiles] = await Promise.all([
      this.prisma.h5PTemporaryFile.count(),
      this.prisma.h5PTemporaryFile.count({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      }),
    ]);

    const activeFiles = totalFiles - expiredFiles;

    const sizeAgg = await this.prisma.h5PTemporaryFile.aggregate({
      _sum: {
        size: true,
      },
    });

    return {
      totalFiles,
      totalSize: Number(sizeAgg._sum.size || 0),
      expiredFiles,
      activeFiles,
    };
  }
}