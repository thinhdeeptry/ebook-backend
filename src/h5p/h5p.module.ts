import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { H5pController } from './h5p.controller';
import { H5pPublicController } from './h5p-public.controller';
import { PrismaService } from '../common/prisma.service';
// Import new H5P services
import { H5pService } from './services/h5p-basic.service';
import { H5pConfigService } from './services/h5p-config.service';
import { H5pContentStorage } from './services/h5p-content-storage.service';
import { H5pLibraryStorage } from './services/h5p-library-storage.service';
import { H5pTemporaryStorage } from './services/h5p-temporary-storage.service';
import { H5pInstallerService } from './services/h5p-installer.service';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(), // Use memory storage for serverless compatibility
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
  ],
  controllers: [H5pController, H5pPublicController],
  providers: [
    PrismaService,
    H5pConfigService,
    H5pContentStorage,
    H5pLibraryStorage, 
    H5pTemporaryStorage,
    H5pInstallerService,
    H5pService,
  ],
  exports: [H5pService, H5pConfigService, H5pContentStorage, H5pLibraryStorage, H5pTemporaryStorage, H5pInstallerService],
})
export class H5pModule {}