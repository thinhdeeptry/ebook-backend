import { Module } from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { StudentProgressController } from './student-progress.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [StudentProgressController],
  providers: [StudentProgressService, PrismaService],
  exports: [StudentProgressService],
})
export class StudentProgressModule {}