import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizAnalyticsController } from './quiz-analytics.controller';
import { QuizService } from './quiz.service';
import { QuizAnalyticsService } from './quiz-analytics.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [QuizController, QuizAnalyticsController],
  providers: [QuizService, QuizAnalyticsService, PrismaService],
  exports: [QuizService, QuizAnalyticsService]
})
export class QuizModule {}
