import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { RconService } from './rcon.service';
import { RequireAuth } from 'src/common/decorators/require-auth.decorator';
import { SessionUserId } from 'src/common/decorators/session-user.decorator';

@Controller('api/rcon')
export class RconController {
  constructor(private readonly rconService: RconService) {}

  @Post('forward')
  @RequireAuth()
  postForward(
    @SessionUserId() userId: number,
    @Body('type') type: 1 | 2,
    @Body('roomId') roomId: string,
  ) {
    return this.rconService.forward(userId, type, roomId);
  }
}
