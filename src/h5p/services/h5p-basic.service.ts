import { Injectable, OnModuleInit } from '@nestjs/common';
import { H5pConfigService } from './h5p-config.service';
import { H5pContentStorage } from './h5p-content-storage.service';
import { H5pLibraryStorage } from './h5p-library-storage.service';
import { H5pTemporaryStorage } from './h5p-temporary-storage.service';

export interface H5PContentData {
  library: string;
  params: any;
  metadata?: any;
  isPublic?: boolean;
}

export interface H5PEditorModel {
  integration: any;
  scripts: string[];
  styles: string[];
}

export interface H5PPlayerModel {
  integration: any;
  scripts: string[];
  styles: string[];
  contentId: string;
}

export interface H5PValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

@Injectable()
export class H5pService implements OnModuleInit {
  private isInitialized = false;

  constructor(
    private configService: H5pConfigService,
    private contentStorage: H5pContentStorage,
    private libraryStorage: H5pLibraryStorage,
    private temporaryStorage: H5pTemporaryStorage,
  ) {}

  async onModuleInit() {
    await this.initialize();
  }

  /**
   * Initialize H5P service
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing H5P Service...');
      
      // 1. Ensure all required directories exist
      await this.ensureDirectories();
      
      // 2. Validate storage services are ready
      await this.validateStorageServices();
      
      // 3. Check if core libraries are installed
      const installedLibraries = await this.libraryStorage.getInstalledLibraries();
      if (installedLibraries.length === 0) {
        console.warn('⚠️  No H5P libraries installed yet. Please install libraries via:');
        console.warn('   - Upload .h5p files via POST /h5p/upload');
        console.warn('   - Or download from H5P Hub (coming soon)');
      } else {
        console.log(`✓ Found ${installedLibraries.length} installed H5P libraries`);
      }
      
      this.isInitialized = true;
      console.log('✓ H5P Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize H5P services:', error);
      throw error;
    }
  }

  /**
   * Ensure all required directories exist (disabled for serverless)
   */
  private async ensureDirectories(): Promise<void> {
    // Skip directory creation for serverless environments like Vercel
    // Files are stored in database only
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('✓ H5P directories skipped (serverless mode - database storage only)');
      return;
    }

    // Only create directories in development
    const fs = require('fs-extra');
    const directories = [
      this.configService.librariesPath,
      this.configService.contentPath,
      this.configService.temporaryPath,
      this.configService.workPath,
    ];

    for (const dir of directories) {
      try {
        await fs.ensureDir(dir);
      } catch (error) {
        console.warn(`Warning: Could not create directory ${dir}:`, error.message);
      }
    }
    
    console.log('✓ H5P directories created/verified');
  }

  /**
   * Validate that storage services are ready
   */
  private async validateStorageServices(): Promise<void> {
    // Test database connection by trying to list content
    try {
      await this.contentStorage.listContent();
      console.log('✓ Content storage ready');
    } catch (error) {
      throw new Error(`Content storage not ready: ${error.message}`);
    }

    try {
      await this.libraryStorage.getInstalledLibraries();
      console.log('✓ Library storage ready');
    } catch (error) {
      throw new Error(`Library storage not ready: ${error.message}`);
    }

    try {
      await this.temporaryStorage.getStorageStats();
      console.log('✓ Temporary storage ready');
    } catch (error) {
      throw new Error(`Temporary storage not ready: ${error.message}`);
    }
  }

  /**
   * Create new H5P content
   */
  async createContent(
    userId: string,
    contentData: H5PContentData,
    title?: string,
    lessonStepId?: string,
  ): Promise<string> {
    await this.ensureInitialized();

    try {
      const user = { id: userId, name: 'User', type: 'local' };
      
      const contentId = await this.contentStorage.addContent(
        {
          title: title || 'Untitled',
          mainLibrary: contentData.library,
          embedTypes: ['iframe'],
          language: 'en',
          isPublic: contentData.isPublic || false,
        },
        contentData.params,
        user,
        lessonStepId, // Pass lesson step ID to storage
      );

      return contentId;
    } catch (error) {
      console.error('Error creating H5P content:', error);
      throw new Error(`Failed to create H5P content: ${error.message}`);
    }
  }

  /**
   * Update existing H5P content
   */
  async updateContent(
    contentId: string,
    userId: string,
    contentData: H5PContentData,
    title?: string,
    lessonStepId?: string,
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      const user = { id: userId, name: 'User', type: 'local' };
      
      // Check if content exists
      const existingContent = await this.contentStorage.getContentMetadata(contentId);
      
      // Update content - we'll use the same addContent method with contentId
      await this.contentStorage.addContent(
        {
          title: title || existingContent.title,
          mainLibrary: contentData.library,
          embedTypes: ['iframe'],
          language: 'en',
          isPublic: contentData.isPublic || false,
        },
        contentData.params,
        user,
        lessonStepId, // Pass lesson step ID to storage
        contentId,
      );
    } catch (error) {
      console.error('Error updating H5P content:', error);
      throw new Error(`Failed to update H5P content: ${error.message}`);
    }
  }

  /**
   * Get H5P content for editing
   */
  async getContentForEditing(contentId: string, userId: string): Promise<any> {
    await this.ensureInitialized();

    try {
      const content = await this.contentStorage.getParameters(contentId);
      const metadata = await this.contentStorage.getContentMetadata(contentId);

      return {
        library: metadata.mainLibrary,
        params: content,
        metadata: metadata,
      };
    } catch (error) {
      console.error('Error getting content for editing:', error);
      throw new Error(`Failed to get content for editing: ${error.message}`);
    }
  }

  /**
   * Get H5P content for playing - compatible with Lumi Education format
   */
  async getContentForPlaying(contentId: string): Promise<any> {
    await this.ensureInitialized();

    try {
      // Get content and metadata from database
      const content = await this.contentStorage.getParameters(contentId);
      const metadata = await this.contentStorage.getContentMetadata(contentId);

      // Format for Lumi Education H5P React component
      return {
        contentId,
        
        // H5P metadata structure expected by Lumi components
        h5p: {
          title: metadata.title || 'H5P Content',
          mainLibrary: metadata.mainLibrary,
          preloadedDependencies: metadata.preloadedDependencies || [],
          dynamicDependencies: metadata.dynamicDependencies || [],
          embedTypes: metadata.embedTypes || ['iframe'],
          language: metadata.language || 'en',
          license: 'U', // Default license
          defaultLanguage: 'en',
          a11yTitle: metadata.title || 'H5P Content',
        },

        // Library information
        library: metadata.mainLibrary,

        // Content parameters - this is what gets passed to H5P content
        params: {
          metadata: {
            title: metadata.title || 'H5P Content',
            a11yTitle: metadata.title || 'H5P Content',
            license: 'U',
            licenseVersion: '4.0',
            yearFrom: undefined,
            yearTo: undefined,
            source: '',
            authors: [],
            licenseExtras: '',
            changes: [],
            authorComments: '',
            contentType: 'Interactive Content',
            defaultLanguage: 'en',
          },
          params: content,
        },

        // Integration settings for H5P player
        integration: {
          url: this.configService.baseUrl,
          postUserStatistics: true,
          saveFreq: false,
          user: {
            name: 'User',
            mail: 'user@example.com',
          },
          contents: {
            [contentId]: {
              library: metadata.mainLibrary,
              params: content,
              metadata: metadata,
              jsonContent: JSON.stringify(content),
              fullScreen: false,
              exportUrl: `${this.configService.baseUrl}/h5p/export/${contentId}`,
              embedCode: '',
              resizeCode: '',
              title: metadata.title || 'H5P Content',
              displayOptions: {
                frame: true,
                export: false,
                embed: false,
                copyright: true,
                icon: true,
              },
            },
          },
          core: {
            styles: ['http://localhost:3001/h5p/core/styles/h5p.css'],
            scripts: ['http://localhost:3001/h5p/core/js/h5p.js'],
          },
          loadedJs: [],
          loadedCss: [],
        },
      };
    } catch (error) {
      console.error('Error getting content for playing:', error);
      throw new Error(`Failed to get content for playing: ${error.message}`);
    }
  }

  /**
   * Get basic editor model - simplified version
   */
  async getEditorModel(
    contentId?: string,
    language: string = 'en',
  ): Promise<H5PEditorModel> {
    await this.ensureInitialized();

    try {
      // Return basic editor model structure
      const integration = {
        editor: {
          libraryUrl: this.configService.baseUrl + '/h5p/libraries',
          ajaxPath: this.configService.baseUrl + '/h5p/ajax',
          filesPath: this.configService.baseUrl + '/h5p/content',
          language: language,
          apiVersion: { major: 1, minor: 24 },
        },
      };

      return {
        integration: integration,
        scripts: [],
        styles: [],
      };
    } catch (error) {
      console.error('Error getting editor model:', error);
      throw new Error(`Failed to get editor model: ${error.message}`);
    }
  }

  /**
   * Get basic player model - simplified version
   */
  async getPlayerModel(contentId: string): Promise<H5PPlayerModel> {
    await this.ensureInitialized();

    try {
      const integration = {
        contents: {
          [contentId]: {
            library: 'H5P.Example 1.0',
            jsonContent: '{}',
            fullScreen: false,
            exportUrl: '',
            embedCode: '',
            resizeCode: '',
            title: 'H5P Content',
          }
        },
      };

      return {
        integration: integration,
        scripts: [],
        styles: [],
        contentId: contentId,
      };
    } catch (error) {
      console.error('Error getting player model:', error);
      throw new Error(`Failed to get player model: ${error.message}`);
    }
  }

  /**
   * Validate H5P content
   */
  async validateContent(contentData: H5PContentData): Promise<H5PValidationResult> {
    await this.ensureInitialized();

    try {
      // Basic validation - check if library exists
      const libraryParts = contentData.library.split(' ');
      if (libraryParts.length !== 2) {
        return {
          valid: false,
          errors: ['Invalid library format'],
        };
      }

      const [machineName, version] = libraryParts;
      const [majorVersion, minorVersion] = version.split('.').map(v => parseInt(v));
      
      const libraryExists = await this.libraryStorage.libraryExists(
        machineName,
        majorVersion,
        minorVersion,
      );

      if (!libraryExists) {
        return {
          valid: false,
          errors: [`Library ${contentData.library} not found`],
        };
      }

      return {
        valid: true,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Get available content types (libraries)
   */
  async getContentTypes(): Promise<any[]> {
    await this.ensureInitialized();

    try {
      const libraries = await this.libraryStorage.getInstalledLibraries();
      
      return libraries
        .filter(lib => lib.title && !lib.title.startsWith('H5P.'))
        .map(lib => ({
          machineName: lib.machineName,
          majorVersion: lib.majorVersion,
          minorVersion: lib.minorVersion,
          title: lib.title,
          description: lib.description,
          icon: null,
        }));
    } catch (error) {
      console.error('Error getting content types:', error);
      return [];
    }
  }

  /**
   * Delete H5P content
   */
  async deleteContent(contentId: string, userId: string): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.contentStorage.deleteContent(contentId);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new Error(`Failed to delete content: ${error.message}`);
    }
  }

  /**
   * Get user's H5P contents
   */
  async getUserContents(userId: string): Promise<any[]> {
    await this.ensureInitialized();

    try {
      return await this.contentStorage.getUserContents(userId);
    } catch (error) {
      console.error('Error getting user contents:', error);
      return [];
    }
  }

  /**
   * Get all H5P contents (for admin/teacher)
   */
  async getAllContents(): Promise<any[]> {
    await this.ensureInitialized();

    try {
      return await this.contentStorage.getAllContents();
    } catch (error) {
      console.error('Error getting all contents:', error);
      return [];
    }
  }

  /**
   * Check if H5P services are initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get basic H5P integration object for frontend
   */
  async getIntegration(contentId?: string): Promise<any> {
    await this.ensureInitialized();

    try {
      if (contentId) {
        const playerModel = await this.getPlayerModel(contentId);
        return playerModel.integration;
      } else {
        const editorModel = await this.getEditorModel();
        return editorModel.integration;
      }
    } catch (error) {
      console.error('Error getting integration:', error);
      return {};
    }
  }

  /**
   * Process H5P AJAX requests
   * These are called by H5P Editor and Player
   */
  async processAjaxRequest(
    action: string,
    body: any,
    query: any,
    userId: string,
  ): Promise<any> {
    await this.ensureInitialized();

    try {
      switch (action) {
        // Content type cache - Get available content types
        case 'content-type-cache':
          return this.handleContentTypeCache();

        // Libraries - Get library data
        case 'libraries':
          return this.handleLibrariesRequest(query);

        // Library install - Install library
        case 'library-install':
          return this.handleLibraryInstall(body, userId);

        // Library upload - Upload library package
        case 'library-upload':
          return this.handleLibraryUpload(body, userId);

        // Content - Get/Save content
        case 'content':
          return this.handleContentRequest(body, query, userId);

        // Files - Handle file operations
        case 'files':
          return this.handleFilesRequest(body, query, userId);

        // Filter - Get filtered parameters
        case 'filter':
          return this.handleFilterRequest(body);

        default:
          console.warn(`Unhandled AJAX action: ${action}`);
          return {
            success: false,
            message: `Unknown AJAX action: ${action}`,
          };
      }
    } catch (error) {
      console.error(`Error processing AJAX request [${action}]:`, error);
      throw new Error(`AJAX request failed: ${error.message}`);
    }
  }

  /**
   * Handle content-type-cache AJAX request
   */
  private async handleContentTypeCache(): Promise<any> {
    const libraries = await this.libraryStorage.getInstalledLibraries();
    
    return {
      success: true,
      data: {
        libraries: libraries.map(lib => ({
          id: lib.id,
          machineName: lib.machineName,
          majorVersion: lib.majorVersion,
          minorVersion: lib.minorVersion,
          patchVersion: lib.patchVersion,
          title: lib.title,
          summary: lib.description || '',
          description: lib.description || '',
          icon: '', // Would need to be extracted from library
          createdAt: 0,
          updatedAt: 0,
          isRecommended: false,
          popularity: 0,
          screenshots: [],
          license: lib.license || 'Unspecified',
          owner: lib.author || 'Unknown',
        })),
      },
    };
  }

  /**
   * Handle libraries AJAX request
   */
  private async handleLibrariesRequest(query: any): Promise<any> {
    const { machineName, majorVersion, minorVersion } = query;

    if (machineName && majorVersion && minorVersion) {
      // Get specific library
      const library = await this.libraryStorage.getLibrary(
        machineName,
        parseInt(majorVersion),
        parseInt(minorVersion),
      );

      if (!library) {
        throw new Error(`Library not found: ${machineName} ${majorVersion}.${minorVersion}`);
      }

      return {
        success: true,
        data: library,
      };
    } else {
      // Get all libraries
      const libraries = await this.libraryStorage.getInstalledLibraries();
      return {
        success: true,
        data: libraries,
      };
    }
  }

  /**
   * Handle library-install AJAX request
   */
  private async handleLibraryInstall(body: any, userId: string): Promise<any> {
    // This would trigger installation from H5P Hub
    return {
      success: false,
      message: 'H5P Hub installation not yet implemented. Please upload .h5p files instead.',
    };
  }

  /**
   * Handle library-upload AJAX request
   */
  private async handleLibraryUpload(body: any, userId: string): Promise<any> {
    return {
      success: false,
      message: 'Library upload should be done via POST /h5p/upload endpoint',
    };
  }

  /**
   * Handle content AJAX request
   */
  private async handleContentRequest(body: any, query: any, userId: string): Promise<any> {
    const { contentId } = query;

    if (contentId) {
      // Get content
      const content = await this.getContentForPlaying(contentId);
      return {
        success: true,
        data: content,
      };
    } else {
      // Create/Update content
      return {
        success: false,
        message: 'Content creation should be done via POST /h5p/content endpoint',
      };
    }
  }

  /**
   * Handle files AJAX request
   */
  private async handleFilesRequest(body: any, query: any, userId: string): Promise<any> {
    return {
      success: false,
      message: 'File operations should be done via POST /h5p/files endpoint',
    };
  }

  /**
   * Handle filter AJAX request
   */
  private async handleFilterRequest(body: any): Promise<any> {
    // Filter parameters - this is used by H5P to filter/sanitize content
    // For now, just return the parameters as-is
    return {
      success: true,
      data: body.libraryParameters || body.params || {},
    };
  }

  // ===== LESSON-SPECIFIC METHODS =====

  /**
   * Get H5P content for a specific page block
   */
  async getContentByPageBlock(pageBlockId: string): Promise<any> {
    await this.ensureInitialized();

    try {
      const content = await this.contentStorage.getContentByPageBlock(pageBlockId);
      return content;
    } catch (error) {
      console.error('Error getting content by page block:', error);
      throw new Error(`Failed to get content by page block: ${error.message}`);
    }
  }

  /**
   * Get all H5P contents for a specific page (all page blocks)
   */
  async getContentByPage(pageId: string): Promise<any[]> {
    await this.ensureInitialized();

    try {
      const contents = await this.contentStorage.getContentByPage(pageId);
      return contents;
    } catch (error) {
      console.error('Error getting contents by page:', error);
      throw new Error(`Failed to get contents by page: ${error.message}`);
    }
  }

  /**
   * Get all H5P contents for a specific book (all pages)
   */
  async getContentByBook(bookId: string): Promise<any[]> {
    await this.ensureInitialized();

    try {
      const contents = await this.contentStorage.getContentByBook(bookId);
      return contents;
    } catch (error) {
      console.error('Error getting contents by book:', error);
      throw new Error(`Failed to get contents by book: ${error.message}`);
    }
  }

  /**
   * Get all H5P contents for a specific class (all courses)
   */
  async getContentByClass(classId: string): Promise<any[]> {
    await this.ensureInitialized();

    try {
      const contents = await this.contentStorage.getContentByClass(classId);
      return contents;
    } catch (error) {
      console.error('Error getting contents by class:', error);
      throw new Error(`Failed to get contents by class: ${error.message}`);
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}