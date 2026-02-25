import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { AnnouncementsService } from '../../announcements/announcements.service';

@Controller('api/housekeeping/announcements')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingAnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  findAll() {
    return this.announcementsService.find({ order: { position: 'ASC' } });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const announcement = await this.announcementsService.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!announcement) throw new NotFoundException();
    return announcement;
  }

  @Post()
  create(
    @Body()
    body: {
      image: string;
      content: string;
      links: { url: string; text: string }[];
      position: number;
    },
  ) {
    return this.announcementsService.save(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      image?: string;
      content?: string;
      links?: { url: string; text: string }[];
      position?: number;
    },
  ) {
    const announcement = await this.announcementsService.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!announcement) throw new NotFoundException();
    return this.announcementsService.save({ ...announcement, ...body });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcementsService.delete(parseInt(id, 10));
  }
}
