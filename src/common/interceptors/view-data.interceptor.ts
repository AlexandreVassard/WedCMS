import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SettingsService } from 'src/api/settings/settings.service';
import { TextsService } from 'src/api/settings/texts.service';
import { LAYOUT_KEY } from 'src/common/decorators/layout.decorator';
import { from, map, Observable, switchMap } from 'rxjs';
import { VIEW_KEY } from '../decorators/render.decorator';
import session from 'express-session';

/**
 * Interceptor that enriches view data returned by controllers with global
 * application settings and an optional Handlebars layout path.
 *
 * For every response, it fetches the current app settings via
 * {@link SettingsService} and merges them into the view data under the `app`
 * key. If a layout is specified through the {@link LAYOUT_KEY} decorator, it
 * is resolved to a `layouts/<name>` path and included as well.
 */
@Injectable()
export class ViewDataInterceptor implements NestInterceptor {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly textsService: TextsService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const layout = this.reflector.getAllAndOverride<string | undefined>(
      LAYOUT_KEY,
      [context.getHandler(), context.getClass()],
    );
    const view = this.reflector.getAllAndOverride<string | undefined>(
      VIEW_KEY,
      [context.getHandler(), context.getClass()],
    );

    const req = context.switchToHttp().getRequest();

    if (req.url?.startsWith('/api/')) {
      return next.handle();
    }

    const sessionUser = req.session?.user;

    return next.handle().pipe(
      map(async (data) => {
        const app = await this.settingsService.getAppSettings();
        const text = layout
          ? this.textsService.getTextsByLayout(layout)
          : undefined;
        const subPage = view
          ? view.includes('/')
            ? view.split('/')[view.split('/').length - 1]
            : view
          : undefined;

        const env = {
          kepler_hostname: process.env.KEPLER_HOSTNAME || '192.168.1.41',
          kepler_server_port: process.env.KEPLER_SERVER_PORT || '12321',
          kepler_mus_port: process.env.KEPLER_MUS_PORT || '12322',
        };

        let clubDaysLeft = 0;
        if (sessionUser && sessionUser.clubExpiration > 0) {
          if (sessionUser.clubExpiration * 1000 > Date.now()) {
            const oneDay = 24 * 60 * 60 * 1000;
            const today = new Date(Date.now());
            const expirationDate = new Date(sessionUser.clubExpiration * 1000);
            clubDaysLeft = Math.floor(
              Math.abs((today.getTime() - expirationDate.getTime()) / oneDay),
            );
          }
        }

        return {
          ...data,
          app,
          env,
          ...(sessionUser && {
            user: sessionUser,
            clubDaysLeft,
          }),
          ...(text !== undefined && { text }),
          ...(layout !== undefined && { layout: `layouts/${layout}` }),
          ...(view !== undefined && { page: view }),
          ...(subPage !== undefined && { subPage }),
        };
      }),
      switchMap((promise) => from(promise)),
    );
  }
}
