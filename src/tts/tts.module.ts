import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TtsController } from './tts.controller';
import { TtsService } from './tts.service';
import { PrismaModule } from '../common/prisma.module';
import { SupabaseService } from '../common/storage/supabase.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
  ],
  controllers: [TtsController],
  providers: [TtsService, SupabaseService],
  exports: [TtsService],
})
export class TtsModule {}
