import { Module } from '@nestjs/common';
import { LessonStepsService } from './lesson-steps.service';
import { LessonStepsController } from './lesson-steps.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [LessonStepsController],
  providers: [LessonStepsService, PrismaService],
  exports: [LessonStepsService],
})
export class LessonStepsModule {}