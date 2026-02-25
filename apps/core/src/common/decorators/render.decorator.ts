import { SetMetadata } from '@nestjs/common';

export const VIEW_KEY = 'hbs_view';
export const Render = (view: string) => SetMetadata(VIEW_KEY, view);
