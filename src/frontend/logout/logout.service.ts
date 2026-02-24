import { Injectable } from '@nestjs/common';

@Injectable()
export class LogoutService {
  getHello(): string {
    return 'Hello World!';
  }
}
