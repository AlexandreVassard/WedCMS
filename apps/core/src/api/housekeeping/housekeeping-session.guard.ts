import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class HousekeepingSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const user = (req.session as any).user;

    if (!user || user.rank < 5) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
