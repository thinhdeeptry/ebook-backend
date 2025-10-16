import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LessonStepsService } from './lesson-steps.service';
import { CreateLessonStepDto, UpdateLessonStepDto, ReorderLessonStepsDto } from './dto/lesson-step.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('lesson-steps')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LessonStepsController {
  constructor(private readonly lessonStepsService: LessonStepsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  async create(@Body() createLessonStepDto: CreateLessonStepDto) {
    return this.lessonStepsService.create(createLessonStepDto);
  }

  @Get('lesson/:lessonId')
  async findAllByLesson(@Param('lessonId') lessonId: string) {
    return this.lessonStepsService.findAllByLesson(lessonId);
  }

  @Get('search')
  async searchSteps(
    @Query('lessonId') lessonId?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return this.lessonStepsService.searchSteps(lessonId, searchTerm);
  }

  @Get('statistics')
  async getStepsStatistics(@Query('lessonId') lessonId?: string) {
    return this.lessonStepsService.getStepsStatistics(lessonId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.lessonStepsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async update(
    @Param('id') id: string,
    @Body() updateLessonStepDto: UpdateLessonStepDto,
  ) {
    return this.lessonStepsService.update(id, updateLessonStepDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.lessonStepsService.remove(id);
  }

  @Post('lesson/:lessonId/reorder')
  @Roles(Role.ADMIN, Role.TEACHER)
  async reorderSteps(
    @Param('lessonId') lessonId: string,
    @Body() reorderDto: ReorderLessonStepsDto,
  ) {
    return this.lessonStepsService.reorderSteps(lessonId, reorderDto);
  }

  @Post(':id/duplicate')
  @Roles(Role.ADMIN, Role.TEACHER)
  async duplicateStep(@Param('id') id: string) {
    return this.lessonStepsService.duplicateStep(id);
  }
}