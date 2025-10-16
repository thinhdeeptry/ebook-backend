import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class H5pConfigService {
  constructor(private configService: ConfigService) {}

  // Base URL for H5P content
  get baseUrl(): string {
    return this.configService.get<string>('H5P_BASE_URL', 'http://localhost:3001');
  }

  // URL path for H5P routes
  get url(): string {
    return '/h5p';
  }

  // Directory paths
  get librariesPath(): string {
    return path.join(process.cwd(), 'uploads', 'h5p', 'libraries');
  }

  get contentPath(): string {
    return path.join(process.cwd(), 'uploads', 'h5p', 'content');
  }

  get temporaryPath(): string {
    return path.join(process.cwd(), 'uploads', 'h5p', 'temp');
  }

  get workPath(): string {
    return path.join(process.cwd(), 'uploads', 'h5p', 'work');
  }

  // Content settings
  get maxFileSize(): number {
    return this.configService.get<number>('H5P_MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
  }

  get maxTotalSize(): number {
    return this.configService.get<number>('H5P_MAX_TOTAL_SIZE', 100 * 1024 * 1024); // 100MB
  }

  // Enable/disable features
  get enableLtiApi(): boolean {
    return this.configService.get<boolean>('H5P_ENABLE_LTI_API', false);
  }

  get enableHubApi(): boolean {
    return this.configService.get<boolean>('H5P_ENABLE_HUB_API', true);
  }

  // Hub settings
  get hubRegistrationEndpoint(): string {
    return 'https://api.h5p.org/v1/sites';
  }

  get hubContentTypesEndpoint(): string {
    return 'https://api.h5p.org/v1/content-types/';
  }

  // User permissions
  get canInstallRecommended(): boolean {
    return true;
  }

  get canUpdateAndInstallLibraries(): boolean {
    return true;
  }

  // Content type cache settings
  get contentTypeCacheRefreshInterval(): number {
    return 1000 * 60 * 60 * 24; // 24 hours
  }

  // Security settings
  get enableCsrf(): boolean {
    return this.configService.get<boolean>('H5P_ENABLE_CSRF', false);
  }

  // Debug settings
  get debug(): boolean {
    return this.configService.get<boolean>('H5P_DEBUG', false);
  }

  // Create H5P config object
  createH5PConfig() {
    return {
      baseUrl: this.baseUrl,
      url: this.url,
      librariesPath: this.librariesPath,
      contentPath: this.contentPath,
      temporaryPath: this.temporaryPath,
      workPath: this.workPath,
      maxFileSize: this.maxFileSize,
      maxTotalSize: this.maxTotalSize,
      enableLtiApi: this.enableLtiApi,
      enableHubApi: this.enableHubApi,
      hubRegistrationEndpoint: this.hubRegistrationEndpoint,
      hubContentTypesEndpoint: this.hubContentTypesEndpoint,
      canInstallRecommended: this.canInstallRecommended,
      canUpdateAndInstallLibraries: this.canUpdateAndInstallLibraries,
      contentTypeCacheRefreshInterval: this.contentTypeCacheRefreshInterval,
      enableCsrf: this.enableCsrf,
      debug: this.debug,
      sendUsageStatistics: false,
      uuid: 'h5p-nestjs-server',
      siteType: 'local' as const,
      contentUserDataUrl: '/h5p/contentUserData',
      setFinishedUrl: '/h5p/setFinished',
      downloadUrl: '/h5p/download',
      embedUrl: '/h5p/embed',
      resizeUrl: '/h5p/resize',
      libraryUrl: '/h5p/libraries',
      ajaxUrl: '/h5p/ajax',
      coreApiVersion: { major: 1, minor: 24 },
      h5pVersion: '1.24.0'
    };
  }
}