import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Like } from 'typeorm';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { RoomsService } from '../../rooms/rooms.service';

@Controller('api/housekeeping/rooms')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingRoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.roomsService.find({
      where: search ? { name: Like(`%${search}%`) } : undefined,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
      order: { id: 'DESC' },
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { isHidden?: number }) {
    const room = await this.roomsService.findOne({ where: { id: parseInt(id, 10) } });
    if (!room) throw new NotFoundException();
    if (body.isHidden !== undefined) room.isHidden = body.isHidden;
    return this.roomsService.save(room);
  }
}
