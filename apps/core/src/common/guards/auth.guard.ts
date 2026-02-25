import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if ((req.session as any).user) {
      return true;
    }

    const redirect = encodeURIComponent(req.originalUrl);
    res.redirect(`/login?redirect=${redirect}`);
    return false;
  }
}
