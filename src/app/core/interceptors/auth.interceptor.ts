// src/app/core/interceptors/auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  const isApiCall =
    req.url.startsWith('/api') ||
    req.url.startsWith('/sanctum');

  // Anexa withCredentials em todas as chamadas de API/Sanctum
  // É isso que permite o cookie de sessão ser enviado e recebido
  if (isApiCall) {
    req = req.clone({ withCredentials: true });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isPublicCall =
          req.url.includes('/auth/login')          ||
          req.url.includes('/auth/register')       ||
          req.url.includes('/sanctum/csrf-cookie');

        // Limpa estado em memória (sem tocar em storage)
        authService.currentUser.set(null);

        // Redireciona apenas se não for rota pública
        // Evita loop de redirect no login
        if (!isPublicCall) {
          router.navigate(['/home']);
        }
      }

      return throwError(() => error);
    })
  );
};