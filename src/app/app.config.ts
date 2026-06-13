import { APP_INITIALIZER, LOCALE_ID, ApplicationConfig } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { AppDataService } from './core/app-data.service';

registerLocaleData(localeFr);

function initializeApplication(data: AppDataService): () => Promise<void> {
  return () => data.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-CA' },
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApplication,
      deps: [AppDataService],
      multi: true
    },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }))
  ]
};
