import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

// Custom interfaces to avoid compatibility issues
export interface H5PLibraryMetadata {
  id?: string;
  machineName: string;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  title: string;
  author?: string;
  license?: string;
  description?: string;
  libraryJson?: any;
  semanticsJson?: any;
  languageJson?: any;
  files?: any;
  dependencies?: any;
  preloadedDependencies?: H5PLibraryDependency[];
  dynamicDependencies?: H5PLibraryDependency[];
  editorDependencies?: H5PLibraryDependency[];
}

export interface H5PLibraryDependency {
  machineName: string;
  majorVersion: number;
  minorVersion: number;
}

export interface H5PLibraryInstallResult {
  type: 'new' | 'updated' | 'already-installed';
  library: H5PLibraryMetadata;
}

@Injectable()
export class H5pLibraryStorage {
  constructor(private prisma: PrismaService) {}

  /**
   * Get library metadata by machine name and version
   */
  async getLibrary(machineName: string, majorVersion: number, minorVersion: number): Promise<H5PLibraryMetadata | null> {
    const library = await this.prisma.h5PLibrary.findFirst({
      where: {
        machineName,
        majorVersion,
        minorVersion,
      },
    });

    if (!library) {
      return null;
    }

    return this.mapLibraryToMetadata(library);
  }

  /**
   * Install a new library or update existing one
   */
  async installLibrary(
    machineName: string,
    majorVersion: number,
    minorVersion: number,
    patchVersion: number,
    metadata: Partial<H5PLibraryMetadata>,
    libraryJson?: any,
    libraryFiles?: { [filename: string]: string }
  ): Promise<H5PLibraryInstallResult> {
    // Check if library already exists with same version
    const existingLibrary = await this.getLibrary(machineName, majorVersion, minorVersion);
    
    if (existingLibrary && existingLibrary.patchVersion >= patchVersion) {
      return {
        type: 'already-installed',
        library: existingLibrary,
      };
    }

    // Prepare dependencies object - cast to JSON compatible format
    const dependencies = {
      preloaded: metadata.preloadedDependencies || [],
      dynamic: metadata.dynamicDependencies || [],
      editor: metadata.editorDependencies || [],
    } as any;

    // Prepare library data for database
    const libraryData = {
      machineName,
      majorVersion,
      minorVersion,
      patchVersion,
      title: metadata.title || machineName,
      description: metadata.description || '',
      author: metadata.author || 'Unknown',
      license: metadata.license || 'Unspecified',
      libraryJson: libraryJson || {},
      semanticsJson: metadata.semanticsJson || null,
      languageJson: metadata.languageJson || null,
      files: (libraryFiles || {}) as any,
      dependencies: dependencies,
      isPublic: true,
    };

    let library;
    let resultType: 'new' | 'updated';

    if (existingLibrary) {
      // Update existing library
      library = await this.prisma.h5PLibrary.update({
        where: {
          id: existingLibrary.id,
        },
        data: libraryData,
      });
      resultType = 'updated';
    } else {
      // Create new library
      library = await this.prisma.h5PLibrary.create({
        data: libraryData,
      });
      resultType = 'new';
    }

    return {
      type: resultType,
      library: this.mapLibraryToMetadata(library),
    };
  }

  /**
   * Get all installed libraries
   */
  async getInstalledLibraries(): Promise<H5PLibraryMetadata[]> {
    const libraries = await this.prisma.h5PLibrary.findMany({
      orderBy: [
        { machineName: 'asc' },
        { majorVersion: 'desc' },
        { minorVersion: 'desc' },
      ],
    });

    return libraries.map(library => this.mapLibraryToMetadata(library));
  }

  /**
   * Get libraries that depend on a specific library
   */
  async getLibraryDependents(machineName: string, majorVersion: number, minorVersion: number): Promise<H5PLibraryMetadata[]> {
    // Since we store dependencies as JSON, we need to query all libraries and filter
    const allLibraries = await this.prisma.h5PLibrary.findMany();
    
    const dependentLibraries = allLibraries.filter(library => {
      const deps = library.dependencies as any;
      if (!deps) return false;

      const checkDependency = (depArray: any[]) => {
        return depArray && depArray.some((dep: any) => 
          dep.machineName === machineName && 
          dep.majorVersion === majorVersion && 
          dep.minorVersion === minorVersion
        );
      };

      return checkDependency(deps.preloaded) || 
             checkDependency(deps.dynamic) || 
             checkDependency(deps.editor);
    });

    return dependentLibraries.map(library => this.mapLibraryToMetadata(library));
  }

  /**
   * Delete a library (only if no content depends on it)
   */
  async deleteLibrary(machineName: string, majorVersion: number, minorVersion: number): Promise<void> {
    // Find the library first
    const library = await this.getLibrary(machineName, majorVersion, minorVersion);
    if (!library) {
      throw new Error(`Library not found: ${machineName} ${majorVersion}.${minorVersion}`);
    }

    // Check if any content uses this library
    const contentUsingLibrary = await this.prisma.h5PContent.findFirst({
      where: {
        library: `${machineName} ${majorVersion}.${minorVersion}`,
      },
    });

    if (contentUsingLibrary) {
      throw new Error(`Cannot delete library ${machineName} ${majorVersion}.${minorVersion}: Content still depends on it`);
    }

    // Check if any other libraries depend on this one
    const dependentLibraries = await this.getLibraryDependents(machineName, majorVersion, minorVersion);
    
    if (dependentLibraries.length > 0) {
      throw new Error(`Cannot delete library ${machineName} ${majorVersion}.${minorVersion}: Other libraries depend on it`);
    }

    // Safe to delete
    await this.prisma.h5PLibrary.delete({
      where: {
        id: library.id,
      },
    });
  }

  /**
   * Get library files (JS, CSS, etc.)
   */
  async getLibraryFiles(machineName: string, majorVersion: number, minorVersion: number): Promise<{ [filename: string]: string }> {
    const library = await this.getLibrary(machineName, majorVersion, minorVersion);

    if (!library) {
      throw new Error(`Library not found: ${machineName} ${majorVersion}.${minorVersion}`);
    }

    return library.files || {};
  }

  /**
   * Update library files
   */
  async updateLibraryFiles(
    machineName: string, 
    majorVersion: number, 
    minorVersion: number,
    files: { [filename: string]: string }
  ): Promise<void> {
    const library = await this.getLibrary(machineName, majorVersion, minorVersion);
    
    if (!library) {
      throw new Error(`Library not found: ${machineName} ${majorVersion}.${minorVersion}`);
    }

    await this.prisma.h5PLibrary.update({
      where: {
        id: library.id,
      },
      data: {
        files: files as any,
      },
    });
  }

  /**
   * Get library by ID
   */
  async getLibraryById(id: string): Promise<H5PLibraryMetadata | null> {
    const library = await this.prisma.h5PLibrary.findUnique({
      where: { id },
    });

    if (!library) {
      return null;
    }

    return this.mapLibraryToMetadata(library);
  }

  /**
   * Helper method to map database model to metadata interface
   */
  private mapLibraryToMetadata(library: any): H5PLibraryMetadata {
    const dependencies = library.dependencies as any || {};
    
    return {
      id: library.id,
      machineName: library.machineName,
      majorVersion: library.majorVersion,
      minorVersion: library.minorVersion,
      patchVersion: library.patchVersion,
      title: library.title,
      author: library.author || 'Unknown',
      license: library.license || 'Unspecified',
      description: library.description || '',
      libraryJson: library.libraryJson,
      semanticsJson: library.semanticsJson,
      languageJson: library.languageJson,
      files: library.files,
      dependencies: library.dependencies,
      preloadedDependencies: dependencies.preloaded || [],
      dynamicDependencies: dependencies.dynamic || [],
      editorDependencies: dependencies.editor || [],
    };
  }

  /**
   * Check if library exists
   */
  async libraryExists(machineName: string, majorVersion: number, minorVersion: number): Promise<boolean> {
    const library = await this.getLibrary(machineName, majorVersion, minorVersion);
    return library !== null;
  }

  /**
   * Get latest version of a library
   */
  async getLatestLibraryVersion(machineName: string): Promise<H5PLibraryMetadata | null> {
    const library = await this.prisma.h5PLibrary.findFirst({
      where: {
        machineName,
      },
      orderBy: [
        { majorVersion: 'desc' },
        { minorVersion: 'desc' },
        { patchVersion: 'desc' },
      ],
    });

    if (!library) {
      return null;
    }

    return this.mapLibraryToMetadata(library);
  }
}