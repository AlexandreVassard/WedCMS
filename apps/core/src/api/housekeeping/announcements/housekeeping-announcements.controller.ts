import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { AnnouncementsService } from '../../announcements/announcements.service';
import { readdirSync } from 'fs';
import { join } from 'path';

@Controller('api/housekeeping/announcements')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingAnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get('images')
  listImages() {
    const dir = join(process.cwd(), 'public', 'images', 'announcement');
    const files = readdirSync(dir).sort((a, b) => a.localeCompare(b));
    return files;
  }

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
  async create(
    @Body()
    body: {
      image: string;
      content: string;
      links: { url: string; text: string }[];
    },
  ) {
    const all = await this.announcementsService.find();
    const maxPosition = all.reduce((max, a) => Math.max(max, a.position), -1);
    return this.announcementsService.save({ ...body, position: maxPosition + 1 });
  }

  @Patch('reorder')
  @HttpCode(204)
  async reorder(@Body() body: { ids: number[] }) {
    const all = await this.announcementsService.find();
    const byId = new Map(all.map((a) => [a.id, a]));
    await Promise.all(
      body.ids.map((id, index) => {
        const a = byId.get(id);
        if (!a) return;
        return this.announcementsService.save({ ...a, position: index });
      }),
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      image?: string;
      content?: string;
      links?: { url: string; text: string }[];
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
