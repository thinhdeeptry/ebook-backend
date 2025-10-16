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
import { diskStorage } from 'multer';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule,
    // MulterModule.register({
    //   storage: diskStorage({
    //     destination: './uploads/h5p/temp',
    //     filename: (req, file, cb) => {
    //       // Generate unique filename
    //       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    //       const ext = path.extname(file.originalname);
    //       cb(null, `h5p-${uniqueSuffix}${ext}`);
    //     },
    //   }),
    //   limits: {
    //     fileSize: 100 * 1024 * 1024, // 100MB
    //   },
    // }),
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