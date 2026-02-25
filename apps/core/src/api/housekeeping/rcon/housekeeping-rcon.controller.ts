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
    @Body('type') type: 'credits' | 'looks' | 'club' | 'hand',
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
      default:
        throw new BadRequestException('Invalid refresh type');
    }
  }
}
