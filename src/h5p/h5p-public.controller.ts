import {
  Controller,
  Get,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('h5p')
export class H5pPublicController {
  /**
   * Serve H5P core CSS file (public access)
   */
  @Get('core/styles/h5p.css')
  async getCoreCSS(@Res() res: Response) {
    try {
      const path = require('path');
      const fs = require('fs-extra');
      
      const cssPath = path.join(process.cwd(), 'public', 'h5p', 'core', 'styles', 'h5p.css');
      
      if (await fs.pathExists(cssPath)) {
        const cssContent = await fs.readFile(cssPath, 'utf8');
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.send(cssContent);
      } else {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'H5P core CSS not found',
        });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Serve H5P core JavaScript file (public access)
   */
  @Get('core/js/h5p.js')
  async getCoreJS(@Res() res: Response) {
    try {
      const path = require('path');
      const fs = require('fs-extra');
      
      const jsPath = path.join(process.cwd(), 'public', 'h5p', 'core', 'js', 'h5p.js');
      
      if (await fs.pathExists(jsPath)) {
        const jsContent = await fs.readFile(jsPath, 'utf8');
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.send(jsContent);
      } else {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'H5P core JavaScript not found',
        });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Serve H5P library files (public access)
   */
  @Get('libraries/:library/:version/:file(*)')
  async getLibraryFile(
    @Param('library') library: string,
    @Param('version') version: string,
    @Param('file') file: string,
    @Res() res: Response,
  ) {
    try {
      const path = require('path');
      const fs = require('fs-extra');
      
      // Construct library path
      const libraryPath = path.join(
        process.cwd(),
        'public',
        'h5p',
        'libraries',
        `${library}-${version}`,
        file
      );
      
      if (await fs.pathExists(libraryPath)) {
        const stats = await fs.stat(libraryPath);
        
        if (stats.isFile()) {
          // Determine content type based on file extension
          const ext = path.extname(file).toLowerCase();
          let contentType = 'application/octet-stream';
          
          switch (ext) {
            case '.css':
              contentType = 'text/css';
              break;
            case '.js':
              contentType = 'application/javascript';
              break;
            case '.json':
              contentType = 'application/json';
              break;
            case '.png':
              contentType = 'image/png';
              break;
            case '.jpg':
            case '.jpeg':
              contentType = 'image/jpeg';
              break;
            case '.gif':
              contentType = 'image/gif';
              break;
            case '.svg':
              contentType = 'image/svg+xml';
              break;
          }
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000');
          
          const fileStream = fs.createReadStream(libraryPath);
          fileStream.pipe(res);
        } else {
          res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: 'File not found',
          });
        }
      } else {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Library file not found',
        });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Serve H5P content files (images, etc.) - public access for playback
   */
  @Get('content/:contentId/:file(*)')
  async getContentFile(
    @Param('contentId') contentId: string,
    @Param('file') file: string,
    @Res() res: Response,
  ) {
    try {
      const path = require('path');
      const fs = require('fs-extra');
      
      // Construct content file path
      const contentPath = path.join(
        process.cwd(),
        'uploads',
        'h5p',
        'content',
        contentId,
        file
      );
      
      if (await fs.pathExists(contentPath)) {
        const stats = await fs.stat(contentPath);
        
        if (stats.isFile()) {
          // Determine content type
          const ext = path.extname(file).toLowerCase();
          let contentType = 'application/octet-stream';
          
          switch (ext) {
            case '.png':
              contentType = 'image/png';
              break;
            case '.jpg':
            case '.jpeg':
              contentType = 'image/jpeg';
              break;
            case '.gif':
              contentType = 'image/gif';
              break;
            case '.svg':
              contentType = 'image/svg+xml';
              break;
            case '.mp4':
              contentType = 'video/mp4';
              break;
            case '.mp3':
              contentType = 'audio/mpeg';
              break;
            case '.pdf':
              contentType = 'application/pdf';
              break;
          }
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
          
          const fileStream = fs.createReadStream(contentPath);
          fileStream.pipe(res);
        } else {
          res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: 'File not found',
          });
        }
      } else {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Content file not found',
        });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}