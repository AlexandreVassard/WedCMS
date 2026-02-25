import { Module } from '@nestjs/common';
import { SettingsModule } from './api/settings/settings.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ViewDataInterceptor } from './common/interceptors/view-data.interceptor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { HotelModule } from './frontend/hotel/hotel.module';
import { NewsModule } from './frontend/news/news.module';
import { HomeModule } from './frontend/home/home.module';
import { ClientModule } from './frontend/client/client.module';
import { LoginModule } from './frontend/login/login.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogoutModule } from './frontend/logout/logout.module';
import { IndexModule } from './frontend/index/index.module';
import { PreferencesModule } from './frontend/preferences/preferences.module';
import { HabboImagingModule } from './frontend/habbo-imaging/habbo-imaging.module';
import { BadgesModule } from './frontend/badges/badges.module';
import { CreditsModule } from './frontend/credits/credits.module';
import { ClubModule } from './frontend/club/club.module';
import { IotModule } from './frontend/iot/iot.module';
import { RegisterModule } from './frontend/register/register.module';
import { MessengerFriendsModule } from './api/messenger-friends/messenger-friends.module';
import { RoomsModule } from './api/rooms/rooms.module';
import { UsersModule } from './api/users/users.module';
import { HousekeepingModule } from './api/housekeeping/housekeeping.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOSTNAME'),
        port: +configService.get('MYSQL_PORT'),
        username: configService.get('MYSQL_USER'),
        password: configService.get('MYSQL_PASSWORD'),
        database: configService.get('MYSQL_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    IndexModule,
    SettingsModule,
    HotelModule,
    NewsModule,
    HomeModule,
    ClientModule,
    LoginModule,
    LogoutModule,
    PreferencesModule,
    HabboImagingModule,
    BadgesModule,
    CreditsModule,
    ClubModule,
    IotModule,
    RegisterModule,
    MessengerFriendsModule,
    RoomsModule,
    UsersModule,
    HousekeepingModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ViewDataInterceptor,
    },
  ],
})
export class AppModule {}
