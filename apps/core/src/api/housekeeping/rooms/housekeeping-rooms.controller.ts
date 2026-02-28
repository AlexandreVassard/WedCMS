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
import { In, Like, Not } from 'typeorm';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { RoomsService } from '../../rooms/rooms.service';
import { UsersService } from '../../users/users.service';

@Controller('api/housekeeping/rooms')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingRoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('type') type?: string,
  ) {
    const isPublic = type === 'public';
    const typeFilter = isPublic ? { ownerId: '0' } : { ownerId: Not('0') };
    const where = search
      ? { ...typeFilter, name: Like(`%${search}%`) }
      : typeFilter;

    const rooms = await this.roomsService.find({
      where,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
      order: { id: 'DESC' },
    });

    if (isPublic) return rooms;

    const ownerIds = [...new Set(rooms.map((r) => parseInt(r.ownerId, 10)))].filter((id) => id > 0);
    if (ownerIds.length === 0) return rooms;

    const owners = await this.usersService.find({ where: { id: In(ownerIds) } });
    const ownerMap = new Map(owners.map((u) => [String(u.id), u.username]));

    return rooms.map((room) => ({
      ...room,
      ownerUsername: ownerMap.get(room.ownerId) ?? null,
    }));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { isHidden?: number }) {
    const room = await this.roomsService.findOne({ where: { id: parseInt(id, 10) } });
    if (!room) throw new NotFoundException();
    if (body.isHidden !== undefined) room.isHidden = body.isHidden;
    return this.roomsService.save(room);
  }
}
