// src/app/core/services/auth.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, switchMap, tap, catchError, map } from 'rxjs';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  plan_type: 'free' | 'plus' | 'premium';
  capabilities: string[];
}

export interface LoginResponse {
  message: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  currentUser     = signal<User | null>(null);
  authReady       = signal<boolean>(false);
  isAuthenticated = computed(() => !!this.currentUser());

  /**
   * Chamado via APP_INITIALIZER no bootstrap da aplicação.
   * Única fonte de verdade: o backend.
   * Sem leitura de storage. Sem heurística local.
   */
  bootstrap(): Observable<User | null> {
    return this.http.get<{ user: User }>('/api/auth/me').pipe(
      map(res => res.user),
      tap(user => {
        this.currentUser.set(user);
        this.authReady.set(true);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.authReady.set(true);
        return of(null);
      })
    );
  }

  /**
   * Login stateful via Sanctum SPA.
   * 1. Obtém CSRF cookie
   * 2. Faz login (sessão + remember me nativo do Laravel)
   * 3. Seta currentUser em memória
   */
  login(identifier: string, password: string, remember: boolean): Observable<User> {
    return this.http.get('/sanctum/csrf-cookie', { withCredentials: true }).pipe(
      switchMap(() =>
        this.http.post<LoginResponse>('/api/auth/login', { identifier, password, remember }, { withCredentials: true })
      ),
      map(res => res.user),
      tap(user => this.currentUser.set(user))
    );
  }

  /**
   * Registro de novo usuário.
   */
  register(name: string, username: string, email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/register', { name, username, email, password });
  }

  /**
   * Logout stateful.
   * O backend invalida a sessão e o cookie.
   * O frontend limpa apenas o estado em memória.
   */
  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      tap(() => this._clearState()),
      catchError(() => {
        this._clearState();
        return of(void 0);
      })
    );
  }

  /**
   * Atualiza o usuário em memória a partir do backend.
   * Útil após mudanças de perfil/plano.
   */
  refreshUser(): Observable<User | null> {
    return this.http.get<{ user: User }>('/api/auth/me').pipe(
      map(res => res.user),
      tap(user => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  private _clearState(): void {
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}