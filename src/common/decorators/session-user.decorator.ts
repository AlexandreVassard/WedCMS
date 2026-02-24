import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const SessionUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | undefined => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return (req.session as any).user?.id;
  },
);
