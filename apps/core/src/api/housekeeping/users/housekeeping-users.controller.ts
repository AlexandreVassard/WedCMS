import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Like } from 'typeorm';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { UsersService } from '../../users/users.service';

@Controller('api/housekeeping/users')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const users = await this.usersService.find({
      where: search ? { username: Like(`%${search}%`) } : undefined,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
      order: { id: 'DESC' },
    });
    return users.map(({ password, ...rest }) => rest);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne({ where: { id: parseInt(id, 10) } });
    if (!user) throw new NotFoundException();
    const { password, ...rest } = user;
    return rest;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { credits?: number; rank?: number; motto?: string; figure?: string; sex?: string },
  ) {
    const user = await this.usersService.findOne({ where: { id: parseInt(id, 10) } });
    if (!user) throw new NotFoundException();
    if (body.credits !== undefined) user.credits = body.credits;
    if (body.rank !== undefined) user.rank = body.rank;
    if (body.motto !== undefined) user.motto = body.motto;
    if (body.figure !== undefined) user.figure = body.figure;
    if (body.sex !== undefined) user.sex = body.sex;
    const saved = await this.usersService.save(user);
    const { password, ...rest } = saved;
    return rest;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(parseInt(id, 10));
  }
}
