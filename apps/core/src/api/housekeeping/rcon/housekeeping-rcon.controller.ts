import { BadRequestException, Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { RconService } from '../../rcon/rcon.service';

@Controller('api/housekeeping/rcon')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingRconController {
  constructor(private readonly rconService: RconService) {}

  @Post('hotel-alert')
  hotelAlert(@Body('message') message: string, @Body('sender') sender?: string) {
    return this.rconService.hotelAlert(message, sender);
  }

  @Post('refresh/:userId')
  refresh(
    @Param('userId') userId: string,
    @Body('type') type: 'credits' | 'looks' | 'club' | 'hand' | 'motto' | 'badge',
  ) {
    const id = parseInt(userId, 10);
    switch (type) {
      case 'credits':
        return this.rconService.refreshCredits(id);
      case 'looks':
        return this.rconService.refreshLooks(id);
      case 'club':
        return this.rconService.refreshClub(id);
      case 'hand':
        return this.rconService.refreshHand(id);
      case 'motto':
        return this.rconService.refreshMotto(id);
      case 'badge':
        return this.rconService.refreshBadge(id);
      default:
        throw new BadRequestException('Invalid refresh type');
    }
  }

  @Post('user-alert')
  userAlert(@Body('userId') userId: number, @Body('message') message: string) {
    return this.rconService.userAlert(userId, message);
  }

  @Post('room-alert')
  roomAlert(@Body('roomId') roomId: number, @Body('message') message: string) {
    return this.rconService.roomAlert(roomId, message);
  }

  @Post('disconnect/:userId')
  disconnect(@Param('userId') userId: string) {
    return this.rconService.disconnectUser(parseInt(userId, 10));
  }

  @Post('kick/:userId')
  kick(@Param('userId') userId: string) {
    return this.rconService.kickUser(parseInt(userId, 10));
  }

  @Post('mute/:userId')
  mute(@Param('userId') userId: string, @Body('minutes') minutes: number) {
    return this.rconService.muteUser(parseInt(userId, 10), minutes);
  }

  @Post('unmute/:userId')
  unmute(@Param('userId') userId: string) {
    return this.rconService.unmuteUser(parseInt(userId, 10));
  }

  @Post('forward/:userId')
  forward(
    @Param('userId') userId: string,
    @Body('type') type: 1 | 2,
    @Body('roomId') roomId: string,
  ) {
    return this.rconService.forward(parseInt(userId, 10), type, roomId);
  }

  @Post('mass-event')
  massEvent(@Body('roomId') roomId: number) {
    return this.rconService.massEvent(roomId);
  }

  @Post('refresh-catalogue')
  refreshCatalogue() {
    return this.rconService.refreshCatalogue();
  }

  @Post('reload-settings')
  reloadSettings() {
    return this.rconService.reloadSettings();
  }

  @Post('shutdown')
  shutdown(@Body('minutes') minutes: number, @Body('message') message?: string) {
    return this.rconService.shutdown(minutes, message);
  }

  @Post('shutdown-cancel')
  shutdownCancel(@Body('message') message?: string) {
    return this.rconService.shutdownCancel(message);
  }
}
