import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, APP_INITIALIZER, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { app_config } from './core/config/app-config';
import { provideServiceWorker } from '@angular/service-worker';

import { ThemeService } from './core/services/theme/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};