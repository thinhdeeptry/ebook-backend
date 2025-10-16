import { Injectable } from '@nestjs/common';
import { H5pLibraryStorage } from './h5p-library-storage.service';
import { H5pContentStorage } from './h5p-content-storage.service';
import { H5pConfigService } from './h5p-config.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import extract from 'extract-zip';
import archiver from 'archiver';

export interface H5PPackageInfo {
  title: string;
  mainLibrary: string;
  language: string;
  contentType: string;
  license: string;
  libraries: Array<{
    machineName: string;
    majorVersion: number;
    minorVersion: number;
    patchVersion: number;
  }>;
}

export interface H5PInstallResult {
  success: boolean;
  contentId?: string;
  librariesInstalled: number;
  message: string;
  errors?: string[];
}

@Injectable()
export class H5pInstallerService {
  constructor(
    private libraryStorage: H5pLibraryStorage,
    private contentStorage: H5pContentStorage,
    private configService: H5pConfigService,
  ) {}

  /**
   * Upload and extract H5P package (.h5p file)
   * This installs libraries and optionally creates content
   */
  async uploadH5PPackage(
    filePath: string,
    userId: string,
    installContentOnly: boolean = false,
  ): Promise<H5PInstallResult> {
    let tempExtractPath: string | null = null;
    
    try {
      console.log('📦 Starting H5P package upload:', filePath);
      
      // 1. Validate H5P file exists and is readable
      if (!await fs.pathExists(filePath)) {
        throw new Error('H5P file not found');
      }

      // Check file size to ensure it's not empty
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        throw new Error('H5P file is empty');
      }
      console.log(`✓ File exists (${stats.size} bytes)`);

      // 2. Extract H5P package using extract-zip
      console.log('📂 Extracting H5P package...');
      tempExtractPath = path.join(
        this.configService.workPath,
        `extract_${Date.now()}`,
      );
      
      await fs.ensureDir(tempExtractPath);
      
      try {
        await extract(filePath, { dir: path.resolve(tempExtractPath) });
        console.log('✓ Package extracted to:', tempExtractPath);
      } catch (extractError) {
        throw new Error(`Failed to extract ZIP: ${extractError.message}`);
      }

      // 3. Read h5p.json
      const h5pJsonPath = path.join(tempExtractPath, 'h5p.json');
      if (!await fs.pathExists(h5pJsonPath)) {
        throw new Error('Invalid H5P package: h5p.json not found');
      }

      const h5pJson = await fs.readJson(h5pJsonPath);
      
      // 4. Install libraries
      let librariesInstalled = 0;
      const errors: string[] = [];

      if (!installContentOnly) {
        for (const libraryDef of h5pJson.preloadedDependencies || []) {
          try {
            const libraryDirName = `${libraryDef.machineName}-${libraryDef.majorVersion}.${libraryDef.minorVersion}`;
            const librarySourcePath = path.join(tempExtractPath, libraryDirName);
            
            if (await fs.pathExists(librarySourcePath)) {
              await this.installLibraryFromDirectory(librarySourcePath, libraryDef);
              librariesInstalled++;
            }
          } catch (error) {
            errors.push(`Failed to install library ${libraryDef.machineName}: ${error.message}`);
          }
        }
      }

      // 5. Install content if present
      let contentId: string | undefined;
      const contentJsonPath = path.join(tempExtractPath, 'content', 'content.json');
      
      if (await fs.pathExists(contentJsonPath)) {
        const contentJson = await fs.readJson(contentJsonPath);
        
        // Create content in database
        contentId = await this.contentStorage.addContent(
          {
            title: h5pJson.title || 'Untitled H5P Content',
            mainLibrary: h5pJson.mainLibrary,
            embedTypes: h5pJson.embedTypes || ['iframe'],
            language: h5pJson.language || 'en',
          },
          contentJson,
          { id: userId, name: 'User', type: 'local' },
        );

        // Copy content files to content directory
        const contentSourcePath = path.join(tempExtractPath, 'content');
        const contentDestPath = path.join(this.configService.contentPath, contentId);
        
        await fs.copy(contentSourcePath, contentDestPath);
      }

      // 6. Cleanup
      console.log('🧹 Cleaning up temporary files...');
      if (tempExtractPath) {
        await fs.remove(tempExtractPath);
      }

      console.log('✅ H5P package uploaded successfully');
      return {
        success: true,
        contentId,
        librariesInstalled,
        message: `Successfully installed ${librariesInstalled} libraries${contentId ? ' and created content' : ''}`,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('❌ Failed to upload H5P package:', error);
      
      // Cleanup on error
      if (tempExtractPath) {
        try {
          await fs.remove(tempExtractPath);
        } catch (cleanupError) {
          console.error('Warning: Failed to cleanup temp directory:', cleanupError);
        }
      }
      
      return {
        success: false,
        librariesInstalled: 0,
        message: `Failed to upload H5P package: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Install a single library from extracted directory
   */
  private async installLibraryFromDirectory(
    libraryPath: string,
    libraryDef: any,
  ): Promise<void> {
    // Read library.json
    const libraryJsonPath = path.join(libraryPath, 'library.json');
    if (!await fs.pathExists(libraryJsonPath)) {
      throw new Error('library.json not found');
    }

    const libraryJson = await fs.readJson(libraryJsonPath);

    // Read semantics.json if exists
    let semanticsJson = null;
    const semanticsJsonPath = path.join(libraryPath, 'semantics.json');
    if (await fs.pathExists(semanticsJsonPath)) {
      semanticsJson = await fs.readJson(semanticsJsonPath);
    }

    // Read language files if exist
    let languageJson = null;
    const languagePath = path.join(libraryPath, 'language');
    if (await fs.pathExists(languagePath)) {
      const languageFiles = await fs.readdir(languagePath);
      languageJson = {};
      for (const file of languageFiles) {
        if (file.endsWith('.json')) {
          const lang = path.basename(file, '.json');
          languageJson[lang] = await fs.readJson(path.join(languagePath, file));
        }
      }
    }

    // Collect all library files (JS, CSS, etc.)
    const libraryFiles: { [filename: string]: string } = {};
    const files = await fs.readdir(libraryPath);
    
    for (const file of files) {
      const filePath = path.join(libraryPath, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.css'))) {
        libraryFiles[file] = await fs.readFile(filePath, 'utf8');
      }
    }

    // Install library in database
    await this.libraryStorage.installLibrary(
      libraryDef.machineName,
      libraryDef.majorVersion,
      libraryDef.minorVersion,
      libraryDef.patchVersion || 0,
      {
        title: libraryJson.title,
        description: libraryJson.description,
        author: libraryJson.author,
        license: libraryJson.license,
        preloadedDependencies: libraryJson.preloadedDependencies,
        dynamicDependencies: libraryJson.dynamicDependencies,
        editorDependencies: libraryJson.editorDependencies,
        semanticsJson,
        languageJson,
      },
      libraryJson,
      libraryFiles,
    );

    // Copy library files to libraries directory
    const libraryDestPath = path.join(
      this.configService.librariesPath,
      `${libraryDef.machineName}-${libraryDef.majorVersion}.${libraryDef.minorVersion}`,
    );
    
    await fs.copy(libraryPath, libraryDestPath);
  }

  /**
   * Get H5P package info without installing
   */
  async getH5PPackageInfo(filePath: string): Promise<H5PPackageInfo> {
    try {
      // Extract to temporary directory to read h5p.json
      const tempReadPath = path.join(
        this.configService.workPath,
        `read_${Date.now()}`,
      );
      
      await fs.ensureDir(tempReadPath);
      await extract(filePath, { dir: path.resolve(tempReadPath) });
      
      const h5pJsonPath = path.join(tempReadPath, 'h5p.json');
      if (!await fs.pathExists(h5pJsonPath)) {
        await fs.remove(tempReadPath);
        throw new Error('Invalid H5P package: h5p.json not found');
      }

      const h5pJson = await fs.readJson(h5pJsonPath);
      
      // Cleanup
      await fs.remove(tempReadPath);

      return {
        title: h5pJson.title || 'Untitled',
        mainLibrary: h5pJson.mainLibrary,
        language: h5pJson.language || 'en',
        contentType: h5pJson.contentType || 'Unknown',
        license: h5pJson.license || 'Unspecified',
        libraries: h5pJson.preloadedDependencies || [],
      };
    } catch (error) {
      throw new Error(`Failed to read H5P package: ${error.message}`);
    }
  }

  /**
   * Export H5P content as .h5p package
   */
  async exportContent(contentId: string): Promise<string> {
    try {
      // Get content data
      const content = await this.contentStorage.getParameters(contentId);
      const metadata = await this.contentStorage.getContentMetadata(contentId);

      // Create temporary directory for export
      const tempExportPath = path.join(
        this.configService.workPath,
        `export_${contentId}_${Date.now()}`,
      );
      await fs.ensureDir(tempExportPath);

      // Create h5p.json
      const h5pJson = {
        title: metadata.title,
        language: metadata.language || 'en',
        mainLibrary: metadata.mainLibrary,
        embedTypes: metadata.embedTypes || ['iframe'],
        preloadedDependencies: metadata.preloadedDependencies || [],
      };

      await fs.writeJson(path.join(tempExportPath, 'h5p.json'), h5pJson);

      // Create content/content.json
      const contentDir = path.join(tempExportPath, 'content');
      await fs.ensureDir(contentDir);
      await fs.writeJson(path.join(contentDir, 'content.json'), content);

      // Copy content files if they exist
      const contentFilesPath = path.join(this.configService.contentPath, contentId);
      if (await fs.pathExists(contentFilesPath)) {
        await fs.copy(contentFilesPath, contentDir);
      }

      // Create ZIP package using archiver
      const exportFileName = `${contentId}.h5p`;
      const exportFilePath = path.join(this.configService.workPath, exportFileName);
      
      await this.createZipFromDirectory(tempExportPath, exportFilePath);

      // Cleanup temp directory
      await fs.remove(tempExportPath);

      return exportFilePath;
    } catch (error) {
      throw new Error(`Failed to export H5P content: ${error.message}`);
    }
  }

  /**
   * Validate H5P package structure
   */
  async validateH5PPackage(filePath: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    let tempValidatePath: string | null = null;

    try {
      // Extract to temporary directory to validate structure
      tempValidatePath = path.join(
        this.configService.workPath,
        `validate_${Date.now()}`,
      );
      
      await fs.ensureDir(tempValidatePath);
      await extract(filePath, { dir: path.resolve(tempValidatePath) });
      
      // Check for h5p.json
      if (!await fs.pathExists(path.join(tempValidatePath, 'h5p.json'))) {
        errors.push('Missing h5p.json');
      }

      // Check for content/content.json
      if (!await fs.pathExists(path.join(tempValidatePath, 'content', 'content.json'))) {
        errors.push('Missing content/content.json');
      }

      // Cleanup
      await fs.remove(tempValidatePath);

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      // Cleanup on error
      if (tempValidatePath) {
        try {
          await fs.remove(tempValidatePath);
        } catch {}
      }
      
      errors.push(`Failed to read H5P package: ${error.message}`);
      return {
        valid: false,
        errors,
      };
    }
  }

  /**
   * Helper method to create ZIP file from directory using archiver
   */
  private createZipFromDirectory(sourceDir: string, outPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        console.log(`ZIP created: ${archive.pointer()} bytes`);
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
}
