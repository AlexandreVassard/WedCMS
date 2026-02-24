import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

export const RequireAuth = () => UseGuards(AuthGuard);
