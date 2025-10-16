import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TrackingService } from './tracking.service';
import { CreateTrackingDto, TrackingQueryDto } from './dto/tracking.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('tracking')
@UseGuards(AuthGuard('jwt'))
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  create(@Body() createTrackingDto: CreateTrackingDto, @Request() req) {
    return this.trackingService.create(createTrackingDto, req.user.id);
  }

  @Get()
  findAll(@Query() queryDto: TrackingQueryDto, @Request() req) {
    return this.trackingService.findAll(queryDto, req.user.id, req.user.role);
  }

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  getAnalytics(@Query() queryDto: TrackingQueryDto, @Request() req) {
    return this.trackingService.getAnalytics(queryDto, req.user.id, req.user.role);
  }

  @Get('progress/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN)
  getUserProgress(
    @Param('userId') userId: string,
    @Query('contentId') contentId?: string,
    @Request() req?) {
    return this.trackingService.getUserProgress(
      userId, 
      contentId, 
      req.user.id, 
      req.user.role
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.trackingService.findOne(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.trackingService.remove(id, req.user.id, req.user.role);
  }
}