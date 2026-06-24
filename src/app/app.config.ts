import { APP_INITIALIZER, LOCALE_ID, ApplicationConfig } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AppDataService } from './core/app-data.service';
import { authInterceptor } from './core/auth.interceptor';
import { InactivityTimeoutService } from './core/inactivity-timeout.service';

registerLocaleData(localeFr);

function initializeApplication(data: AppDataService): () => Promise<void> {
  return () => data.initialize();
}

function initializeInactivityTimeout(
  inactivityTimeoutService: InactivityTimeoutService
): () => void {
  return () => inactivityTimeoutService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-CA' },

    provideHttpClient(withInterceptors([authInterceptor])),

    {
      provide: APP_INITIALIZER,
      useFactory: initializeApplication,
      deps: [AppDataService],
      multi: true
    },

    {
      provide: APP_INITIALIZER,
      useFactory: initializeInactivityTimeout,
      deps: [InactivityTimeoutService],
      multi: true
    },

    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }))
  ]
};