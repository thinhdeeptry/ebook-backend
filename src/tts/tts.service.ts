import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { SupabaseService } from '../common/storage/supabase.service';
import { TtsRequestDto } from './dto/tts-request.dto';
import { TtsResponseDto } from './dto/tts-response.dto';
import * as textToSpeech from '@google-cloud/text-to-speech';

@Injectable()
export class TtsService {
  private ttsClient: textToSpeech.TextToSpeechClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    // Initialize Google TTS client
    this.ttsClient = new textToSpeech.TextToSpeechClient({
      keyFilename: this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS') || 'tts-service-account-476410-e8c637725652.json',
    });
  }

  async generateAudio(pageBlockId: string, dto: TtsRequestDto): Promise<TtsResponseDto> {
    console.log("Generating audio for PageBlock ID:", pageBlockId);
    // Check if audio already exists
    const existingBlock = await this.prisma.pageBlock.findUnique({
      where: { id: pageBlockId },
      select: { audioUrl: true },
    });

    if (!existingBlock) {
      throw new NotFoundException(`PageBlock with ID ${pageBlockId} not found`);
    }

    // Return existing audio URL if it exists
    if (existingBlock.audioUrl) {
        console.log("Audio URL already exists")
      return { audioUrl: existingBlock.audioUrl };
    }

    // Generate audio using Google TTS
    const [response] = await this.ttsClient.synthesizeSpeech({
      input: { text: dto.text },
      voice: { 
        languageCode: dto.lang || 'vi-VN', // Default to Vietnamese
        ssmlGender: 'NEUTRAL' as const,
      },
      audioConfig: { 
        audioEncoding: 'MP3' as const,
        speakingRate: 1.0,
        pitch: 0,
      },
    });

    if (!response.audioContent) {
      throw new Error('Failed to generate TTS audio');
    }

    // Upload to Supabase Storage
    let publicUrl: string;
    try {
      const filename = `pageblock-${pageBlockId}.mp3`;
      const { publicUrl: url } = await this.supabaseService.uploadAudio(
      filename,
      response.audioContent as Buffer,
      'audio/mpeg',
      );
      publicUrl = url;
    } catch (error) {
      console.error('Error uploading audio to Supabase:', error);
      throw error;
    }

    // Update the page block with the audio URL
    await this.prisma.pageBlock.update({
      where: { id: pageBlockId },
      data: { audioUrl: publicUrl },
    });

    return { audioUrl: publicUrl };
  }

  async getAudioUrl(pageBlockId: string): Promise<string | null> {
    const block = await this.prisma.pageBlock.findUnique({
      where: { id: pageBlockId },
      select: { audioUrl: true },
    });

    return block?.audioUrl || null;
  }
}
