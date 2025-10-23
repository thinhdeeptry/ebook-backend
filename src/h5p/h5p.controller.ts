import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { H5pService } from './services/h5p-basic.service';
import { H5pLibraryStorage } from './services/h5p-library-storage.service';
import { H5pTemporaryStorage } from './services/h5p-temporary-storage.service';
import { H5pInstallerService } from './services/h5p-installer.service';
import { CreateH5PContentDto, UpdateH5PContentDto } from './dto/h5p.dto';

@Controller('h5p')
@UseGuards(AuthGuard('jwt'))
export class H5pController {
  constructor(
    private h5pService: H5pService,
    private libraryStorage: H5pLibraryStorage,
    private temporaryStorage: H5pTemporaryStorage,
    private installerService: H5pInstallerService,
  ) {}

  /**
   * Get H5P editor integration for frontend
   * Used by H5P editor to initialize
   */
  @Get('editor')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async getEditorIntegration(
    @Query('contentId') contentId?: string,
    @Query('language') language: string = 'en',
  ) {
    try {
      const model = await this.h5pService.getEditorModel(contentId, language);
      return {
        success: true,
        data: model,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get H5P player integration for frontend
   * Used to display H5P content (accessible to all authenticated users)
   */
  @Get('player/:contentId')
  async getPlayerIntegration(@Param('contentId') contentId: string) {
    try {
      const model = await this.h5pService.getPlayerModel(contentId);
      return {
        success: true,
        data: model,
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Create new H5P content
   */
  @Post('content')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async createContent(
    @Body() createContentDto: CreateH5PContentDto,
    @Request() req: any,
  ) {
    try {
      // Validate content data
      const validation = await this.h5pService.validateContent({
        library: createContentDto.library,
        params: createContentDto.params,
        metadata: createContentDto.metadata,
      });

      if (!validation.valid) {
        throw new BadRequestException({
          success: false,
          message: 'Content validation failed',
          errors: validation.errors,
        });
      }

      const contentId = await this.h5pService.createContent(
        req.user.id,
        {
          library: createContentDto.library,
          params: createContentDto.params,
          metadata: createContentDto.metadata,
          isPublic: createContentDto.isPublic,
        },
        createContentDto.title,
        createContentDto.pageBlockId, // Pass page block ID
      );

      return {
        success: true,
        data: {
          contentId,
          message: 'Content created successfully',
          pageBlockId: createContentDto.pageBlockId,
        },
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update existing H5P content
   */
  @Put('content/:contentId')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async updateContent(
    @Param('contentId') contentId: string,
    @Body() updateContentDto: UpdateH5PContentDto,
    @Request() req: any,
  ) {
    try {
      if (updateContentDto.library && updateContentDto.params) {
        const validation = await this.h5pService.validateContent({
          library: updateContentDto.library,
          params: updateContentDto.params,
          metadata: updateContentDto.metadata,
        });

        if (!validation.valid) {
          throw new BadRequestException({
            success: false,
            message: 'Content validation failed',
            errors: validation.errors,
          });
        }
      }

      await this.h5pService.updateContent(
        contentId,
        req.user.id,
        {
          library: updateContentDto.library,
          params: updateContentDto.params,
          metadata: updateContentDto.metadata,
          isPublic: updateContentDto.isPublic,
        },
        updateContentDto.title,
        updateContentDto.pageBlockId,
      );

      return {
        success: true,
        data: {
          message: 'Content updated successfully',
        },
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get H5P content for editing
   */
  @Get('content/:contentId/edit')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async getContentForEditing(
    @Param('contentId') contentId: string,
    @Request() req: any,
  ) {
    try {
      const content = await this.h5pService.getContentForEditing(contentId, req.user.id);
      return {
        success: true,
        data: content,
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get H5P content for playing
   */
  @Get('content/:contentId')
  async getContentForPlaying(@Param('contentId') contentId: string) {
    try {
      const content = await this.h5pService.getContentForPlaying(contentId);
      return {
        success: true,
        data: content,
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete H5P content
   */
  @Delete('content/:contentId')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async deleteContent(
    @Param('contentId') contentId: string,
    @Request() req: any,
  ) {
    try {
      await this.h5pService.deleteContent(contentId, req.user.id);
      return {
        success: true,
        data: {
          message: 'Content deleted successfully',
        },
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get user's H5P contents
   */
  @Get('content')
  async getUserContents(@Request() req: any) {
    try {
      const contents = await this.h5pService.getUserContents(req.user.id);
      return {
        success: true,
        data: contents,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get available content types (libraries)
   */
  @Get('content-types')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async getContentTypes() {
    try {
      const contentTypes = await this.h5pService.getContentTypes();
      return {
        success: true,
        data: contentTypes,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all installed libraries
   */
  @Get('libraries')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async getLibraries() {
    try {
      const libraries = await this.libraryStorage.getInstalledLibraries();
      return {
        success: true,
        data: libraries,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Upload temporary file for H5P content
   */
  @Post('files')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadTemporaryFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const temporaryFile = await this.temporaryStorage.saveTemporaryFile(
        {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer,
        },
        req.user.id,
      );

      return {
        success: true,
        data: {
          fileId: temporaryFile.id,
          filename: temporaryFile.filename,
          size: temporaryFile.size,
          mimetype: temporaryFile.mimetype,
        },
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get temporary file (accessible to all authenticated users for H5P playback)
   */
  @Get('files/:fileId')
  async getTemporaryFile(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    try {
      const fileContent = await this.temporaryStorage.readTemporaryFile(fileId);
      
      if (!fileContent) {
        throw new NotFoundException('File not found or expired');
      }

      const fileInfo = await this.temporaryStorage.getTemporaryFile(fileId);
      
      res.setHeader('Content-Type', fileInfo.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
      res.send(fileContent);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete temporary file
   */
  @Delete('files/:fileId')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async deleteTemporaryFile(@Param('fileId') fileId: string) {
    try {
      await this.temporaryStorage.deleteTemporaryFile(fileId);
      return {
        success: true,
        data: {
          message: 'File deleted successfully',
        },
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Process H5P AJAX requests
   * This endpoint handles various AJAX requests from H5P editor/player
   */
  @Post('ajax/:action')
  async processAjaxRequest(
    @Param('action') action: string,
    @Body() body: any,
    @Query() query: any,
    @Request() req: any,
  ) {
    try {
      const result = await this.h5pService.processAjaxRequest(
        action,
        body,
        query,
        req.user?.id || 'anonymous',
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get H5P integration object
   * This provides the integration object needed by H5P frontend
   */
  @Get('integration')
  async getIntegration(@Query('contentId') contentId?: string) {
    try {
      const integration = await this.h5pService.getIntegration(contentId);
      return {
        success: true,
        data: integration,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Upload H5P package (.h5p file)
   * This will extract and install libraries and content
   */
  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadH5PPackage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Query('installContentOnly') installContentOnly?: string,
  ) {
    const fs = require('fs-extra');
    const path = require('path');
    
    let tempFilePath: string | null = null;
    
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      console.log('📤 Upload request received:', {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        hasBuffer: !!file.buffer,
        bufferSize: file.buffer?.length || 0,
      });

      // Validate file extension
      if (!file.originalname.toLowerCase().endsWith('.h5p')) {
        throw new BadRequestException('Invalid file type. Only .h5p files are allowed');
      }

      // Validate file buffer exists and has content
      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException('Uploaded file is empty or corrupted');
      }

      // Create temporary file from buffer for processing
      const tempDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), 'uploads', 'temp');
      await fs.ensureDir(tempDir);
      
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2);
      tempFilePath = path.join(tempDir, `h5p_upload_${timestamp}_${randomSuffix}.h5p`);
      
      // Write buffer to temporary file
      await fs.writeFile(tempFilePath, file.buffer);

      console.log('📁 Temporary file created:', tempFilePath);

      // First, get package info
      const packageInfo = await this.installerService.getH5PPackageInfo(tempFilePath);

      // Validate package structure
      const validation = await this.installerService.validateH5PPackage(tempFilePath);
      if (!validation.valid) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid H5P package',
          errors: validation.errors,
        });
      }

      // Install the package
      const result = await this.installerService.uploadH5PPackage(
        tempFilePath,
        req.user.id,
        installContentOnly === 'true',
      );

      // Cleanup temporary file
      if (tempFilePath) {
        try {
          await fs.remove(tempFilePath);
          console.log('🧹 Temporary file cleaned up');
        } catch (cleanupError) {
          console.warn('Warning: Could not cleanup temporary file:', cleanupError);
        }
      }

      return {
        success: result.success,
        data: {
          packageInfo,
          ...result,
        },
      };
    } catch (error) {
      // Cleanup temporary file on error
      if (tempFilePath) {
        try {
          await fs.remove(tempFilePath);
          console.log('🧹 Temporary file cleaned up on error');
        } catch (cleanupError) {
          console.warn('Warning: Could not cleanup temporary file:', cleanupError);
        }
      }
      
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get H5P package info without installing
   */
  @Post('package-info')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async getPackageInfo(@UploadedFile() file: Express.Multer.File) {
    const fs = require('fs-extra');
    const path = require('path');
    let tempFilePath: string | null = null;
    
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      if (!file.originalname.toLowerCase().endsWith('.h5p')) {
        throw new BadRequestException('Invalid file type. Only .h5p files are allowed');
      }

      // Validate file buffer exists and has content
      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException('Uploaded file is empty or corrupted');
      }

      // Create temporary file from buffer for processing
      const tempDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), 'uploads', 'temp');
      await fs.ensureDir(tempDir);
      
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2);
      tempFilePath = path.join(tempDir, `h5p_info_${timestamp}_${randomSuffix}.h5p`);
      
      // Write buffer to temporary file
      await fs.writeFile(tempFilePath, file.buffer);

      const packageInfo = await this.installerService.getH5PPackageInfo(tempFilePath);

      // Cleanup temporary file
      if (tempFilePath) {
        try {
          await fs.remove(tempFilePath);
        } catch (cleanupError) {
          console.warn('Warning: Could not cleanup temporary file:', cleanupError);
        }
      }

      return {
        success: true,
        data: packageInfo,
      };
    } catch (error) {
      // Cleanup temporary file on error
      if (tempFilePath) {
        try {
          await fs.remove(tempFilePath);
        } catch (cleanupError) {
          console.warn('Warning: Could not cleanup temporary file:', cleanupError);
        }
      }
      
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Export H5P content as .h5p package
   */
  @Get('export/:contentId')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async exportContent(
    @Param('contentId') contentId: string,
    @Res() res: Response,
  ) {
    try {
      const exportPath = await this.installerService.exportContent(contentId);

      // Send file for download
      res.download(exportPath, `content-${contentId}.h5p`, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Cleanup exported file after sending
        const fs = require('fs-extra');
        fs.remove(exportPath).catch(console.error);
      });
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message,
      });
    }
  }



  /**
   * Health check endpoint
   */
  @Get('health')
  getHealth() {
    return {
      success: true,
      data: {
        status: 'healthy',
        service: 'H5P Service',
        ready: this.h5pService.isReady(),
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Debug endpoint to check H5P content data
   * This helps verify if ArithmeticQuiz content is stored correctly
   */
  @Get('debug/content/:contentId')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async debugContent(@Param('contentId') contentId: string) {
    try {
      // Get raw content from storage
      const rawParams = await this.h5pService.getContentForEditing(contentId, 'debug');
      const playingContent = await this.h5pService.getContentForPlaying(contentId);
      
      return {
        success: true,
        data: {
          contentId,
          message: 'Debug information for H5P content',
          rawParams,
          playingContent: {
            library: playingContent.library,
            params: playingContent.params.params,
            metadata: playingContent.params.metadata
          },
          analysis: {
            isArithmeticQuiz: rawParams.library?.includes('ArithmeticQuiz'),
            hasArithmeticType: !!rawParams.params?.arithmeticType,
            hasMaxQuestions: !!rawParams.params?.maxQuestions,
            parametersComplete: !!(rawParams.params?.arithmeticType && rawParams.params?.maxQuestions)
          }
        },
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  // ===== PAGE BLOCK SPECIFIC ENDPOINTS =====

  /**
   * Get H5P content for a specific page block
   */
  @Get('page-block/:pageBlockId/content')
  async getContentByPageBlock(@Param('pageBlockId') pageBlockId: string) {
    try {
      const content = await this.h5pService.getContentByPageBlock(pageBlockId);
      return {
        success: true,
        data: content,
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Create H5P content directly for a page block
   */
  @Post('page-block/:pageBlockId/content')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async createContentForPageBlock(
    @Param('pageBlockId') pageBlockId: string,
    @Body() createContentDto: CreateH5PContentDto,
    @Request() req: any,
  ) {
    try {
      // Validate content data
      const validation = await this.h5pService.validateContent({
        library: createContentDto.library,
        params: createContentDto.params,
        metadata: createContentDto.metadata,
      });

      if (!validation.valid) {
        throw new BadRequestException({
          success: false,
          message: 'Content validation failed',
          errors: validation.errors,
        });
      }

      // Set the pageBlockId from URL parameter
      const contentId = await this.h5pService.createContent(
        req.user.id,
        {
          library: createContentDto.library,
          params: createContentDto.params,
          metadata: createContentDto.metadata,
          isPublic: createContentDto.isPublic,
        },
        createContentDto.title,
        pageBlockId,
      );

      return {
        success: true,
        data: {
          contentId,
          pageBlockId,
          message: 'Content created and linked to page block successfully',
        },
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all H5P contents for a specific page (all page blocks)
   */
  @Get('page/:pageId/content')
  async getContentByPage(@Param('pageId') pageId: string) {
    try {
      const contents = await this.h5pService.getContentByPage(pageId);
      return {
        success: true,
        data: contents,
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all H5P contents for a specific book (all pages)
   */
  @Get('book/:bookId/content')
  async getContentByBook(@Param('bookId') bookId: string) {
    try {
      const contents = await this.h5pService.getContentByBook(bookId);
      return {
        success: true,
        data: contents,
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all H5P contents for a specific class (all books)
   */
  @Get('class/:classId/content')
  async getContentByClass(@Param('classId') classId: string) {
    try {
      const contents = await this.h5pService.getContentByClass(classId);
      return {
        success: true,
        data: contents,
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message,
      });
    }
  }
}