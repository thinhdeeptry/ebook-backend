import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { H5pModule } from './h5p/h5p.module';
import { TrackingModule } from './tracking/tracking.module';
import { ClassesModule } from './classes/classes.module';
import { BooksModule } from './books/books.module';
import { LessonsModule } from './lessons/lessons.module';
import { StudentProgressModule } from './student-progress/student-progress.module';
import { QuizModule } from './quiz/quiz.module';
import { PrismaService } from './common/prisma.service';

@Global()
@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Serve static files (uploads)
    // Use different paths for development vs production to avoid EROFS errors
    ServeStaticModule.forRoot({
      rootPath: process.env.NODE_ENV === 'production' 
        ? join('/tmp', 'uploads') 
        : join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    H5pModule,
    TrackingModule,
    
    // Educational management modules
    ClassesModule,
    BooksModule,
    LessonsModule,
    StudentProgressModule,
    QuizModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}