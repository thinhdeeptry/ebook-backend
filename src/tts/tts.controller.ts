import { Controller, Post, Param, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TtsService } from './tts.service';
import { TtsRequestDto } from './dto/tts-request.dto';
import { TtsResponseDto } from './dto/tts-response.dto';

@ApiTags('tts')
@Controller('api/tts')
@ApiBearerAuth()
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post(':pageBlockId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate TTS audio for a page block' })
  @ApiResponse({ status: 200, description: 'Returns the URL of the generated audio file', type: TtsResponseDto })
  @ApiResponse({ status: 404, description: 'Page block not found' })
  async generateTts(
    @Param('pageBlockId') pageBlockId: string,
    @Body() dto: TtsRequestDto,
  ): Promise<TtsResponseDto> {
    console.log("Generating TTS audio for PageBlock ID:", pageBlockId);
    return this.ttsService.generateAudio(pageBlockId, dto);
  }

  @Get(':pageBlockId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get TTS audio URL for a page block if it exists' })
  @ApiResponse({ status: 200, description: 'Returns the URL of the audio file if it exists', type: TtsResponseDto })
  @ApiResponse({ status: 404, description: 'Page block not found' })
  async getTtsUrl(
    @Param('pageBlockId') pageBlockId: string,
  ): Promise<{ audioUrl: string | null }> {
    const audioUrl = await this.ttsService.getAudioUrl(pageBlockId);
    return { audioUrl };
  }
}
