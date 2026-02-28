import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Like } from 'typeorm';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { UsersService } from '../../users/users.service';
import { RconService } from '../../rcon/rcon.service';
import { BansService } from '../../bans/bans.service';
import { UserBan } from '../../bans/entities/user-ban.entity';

@Controller('api/housekeeping/users')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rconService: RconService,
    private readonly bansService: BansService,
  ) {}

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
    return users.map(({ password, ssoTicket, ...rest }) => rest);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne({ where: { id: parseInt(id, 10) } });
    if (!user) throw new NotFoundException();
    const { password, ssoTicket, ...rest } = user;
    return rest;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      credits?: number;
      rank?: number;
      tickets?: number;
      film?: number;
      battleballPoints?: number;
      snowstormPoints?: number;
      email?: string;
      consoleMotto?: string;
      badge?: string;
      badgeActive?: number;
      allowStalking?: number;
      allowFriendRequests?: number;
      soundEnabled?: number;
      tutorialFinished?: number;
      receiveEmail?: number;
    },
  ) {
    const user = await this.usersService.findOne({ where: { id: parseInt(id, 10) } });
    if (!user) throw new NotFoundException();
    if (body.credits !== undefined) user.credits = body.credits;
    if (body.rank !== undefined) user.rank = body.rank;
    if (body.tickets !== undefined) user.tickets = body.tickets;
    if (body.film !== undefined) user.film = body.film;
    if (body.battleballPoints !== undefined) user.battleballPoints = body.battleballPoints;
    if (body.snowstormPoints !== undefined) user.snowstormPoints = body.snowstormPoints;
    if (body.email !== undefined) user.email = body.email;
    if (body.consoleMotto !== undefined) user.consoleMotto = body.consoleMotto;
    if (body.badge !== undefined) user.badge = body.badge;
    if (body.badgeActive !== undefined) user.badgeActive = body.badgeActive;
    if (body.allowStalking !== undefined) user.allowStalking = body.allowStalking;
    if (body.allowFriendRequests !== undefined) user.allowFriendRequests = body.allowFriendRequests;
    if (body.soundEnabled !== undefined) user.soundEnabled = body.soundEnabled;
    if (body.tutorialFinished !== undefined) user.tutorialFinished = body.tutorialFinished;
    if (body.receiveEmail !== undefined) user.receiveEmail = body.receiveEmail;
    const saved = await this.usersService.save(user);

    const currencyChanged = body.credits !== undefined || body.tickets !== undefined || body.film !== undefined;
    if (currencyChanged) {
      this.rconService.refreshCredits(saved.id).catch(() => {});
    }

    const { password, ssoTicket, ...rest } = saved;
    return rest;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(parseInt(id, 10));
  }

  @Get(':id/ban')
  async getBan(@Param('id') id: string) {
    const ban = await this.bansService.findByUserId(parseInt(id, 10));
    return ban ?? null;
  }

  @Post(':id/ban')
  async banUser(
    @Param('id') id: string,
    @Body() body: { message: string; bannedUntil: number },
  ) {
    const ban = new UserBan();
    ban.banType = 'USER_ID';
    ban.bannedValue = id;
    ban.message = body.message ?? '';
    ban.bannedUntil = body.bannedUntil;
    const saved = await this.bansService.save(ban);
    this.rconService.disconnectUser(parseInt(id, 10)).catch(() => {});
    return saved;
  }

  @Delete(':id/ban')
  async unbanUser(@Param('id') id: string) {
    await this.bansService.removeByUserId(parseInt(id, 10));
    return { ok: true };
  }

  @Get(':id/ip-logs')
  getIpLogs(@Param('id') id: string) {
    return this.usersService.findIpLogs(parseInt(id, 10));
  }

  @Get(':id/is-alive')
  async isAlive(@Param('id') id: string) {
    const user = await this.usersService.findOne({
      where: { id: parseInt(id, 10) },
      select: ['id', 'online'],
    });
    if (!user) throw new NotFoundException();
    return { online: user.online === 1 };
  }
}
