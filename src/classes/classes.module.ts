import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, PrismaService],
  exports: [ClassesService],
})
export class ClassesModule {}