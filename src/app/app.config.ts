// src/app/app.config.ts
import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  LOCALE_ID,
} from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth/auth.service';

import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';

registerLocaleData(localePtBr, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),

    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([authInterceptor])
    ),

    { provide: LOCALE_ID, useValue: 'pt-BR' },

    // Bootstrap de autenticação — executado antes de qualquer rota ativar
    // Garante que currentUser e authReady estejam corretos no primeiro render
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        return () => firstValueFrom(authService.bootstrap());
      },
      multi: true,
    },
  ],
};