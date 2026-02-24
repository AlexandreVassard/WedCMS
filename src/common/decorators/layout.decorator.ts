import { Render as NestRender, SetMetadata } from '@nestjs/common';
import { VIEW_KEY } from './render.decorator';

export const LAYOUT_KEY = 'hbs_layout';

export function Layout(layout: string): ClassDecorator & MethodDecorator {
  return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey !== undefined) {
      // Method decorator: store layout override on this method
      SetMetadata(LAYOUT_KEY, layout)(target, propertyKey, descriptor!);
      const view = Reflect.getMetadata(VIEW_KEY, descriptor!.value);
      if (view) {
        NestRender(`${layout}/${view}`)(target, propertyKey, descriptor!);
      }
    } else {
      // Class decorator: apply to all methods that don't have their own @Layout
      SetMetadata(LAYOUT_KEY, layout)(target);

      const prototype = target.prototype;
      for (const key of Object.getOwnPropertyNames(prototype)) {
        const view = Reflect.getMetadata(VIEW_KEY, prototype[key]);
        if (!view) continue;
        // Skip methods that already have a method-level @Layout (already resolved)
        const methodLayout = Reflect.getMetadata(LAYOUT_KEY, prototype[key]);
        if (methodLayout) continue;

        const desc = Object.getOwnPropertyDescriptor(prototype, key)!;
        NestRender(`${layout}/${view}`)(prototype, key, desc);
      }
    }
  };
}
