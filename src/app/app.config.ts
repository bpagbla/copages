import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapBlockquoteLeft,
  bootstrapBook,
  bootstrapMailbox,
  bootstrapMailboxFlag,
  bootstrapPersonFill,
  bootstrapPersonFillGear,
  bootstrapPower,
  bootstrapHouseHeart,
} from '@ng-icons/bootstrap-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIcons({
      bootstrapBlockquoteLeft,
      bootstrapBook,
      bootstrapMailbox,
      bootstrapMailboxFlag,
      bootstrapPersonFill,
      bootstrapPersonFillGear,
      bootstrapPower,
      bootstrapHouseHeart,
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
  ],
};
