import { Module } from '@nestjs/common';
import { PreferencesController } from './preferences.controller';
import { UsersModule } from 'src/api/users/users.module';
import { RconModule } from 'src/api/rcon/rcon.module';

@Module({
  imports: [UsersModule, RconModule],
  controllers: [PreferencesController],
})
export class PreferencesModule {}
