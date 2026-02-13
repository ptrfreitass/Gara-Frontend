import { Injectable, Injector, inject, signal, computed} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, AuthResponse } from '../../models/user/user-model';
import { Observable, tap, switchMap, of, catchError, map, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface AvailabilityResponse {
  available: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private injector = inject(Injector);
  
  // Signal para manter o estado do usuário
  public currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  // Computed para formatar o nome
  public userFirstName = computed(() => {
    const user= this.currentUserSignal();
    if (user && user.name) {
      const firstName = user.name.split( ' ')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    return 'Usuário';
  });

  getCsrfToken(): Observable<void> {
    console.log('Solicitando CSRF Cookie...');
    return this.http.get<void>('/sanctum/csrf-cookie');
  }

  // Retorna Observable para o Guard usar
  getUser(): Observable<User | null> {
    return this.http.get<{ user: User }>('/api/user').pipe(
      map(response => response.user),
      tap(user => this.currentUserSignal.set(user)),
      catchError(() => {
        this.currentUserSignal.set(null);
        return of(null);
      })
    );
  }

  register(userData: User) {
    return this.getCsrfToken().pipe(
      switchMap(() =>
        this.http.post<AuthResponse>(`/api/register`, userData).pipe(
          tap(res => this.currentUserSignal.set(res.user))
        )
      )
    );
  }

  login(credentials: any) {
    console.log('1. Iniciando processo de login...');
    return this.getCsrfToken().pipe(
      tap(() => console.log('2. CSRF Token recebido (ou disparado)')),
      switchMap(() => {
        console.log('3. Disparando POST para login...');
        return this.http.post<AuthResponse>(`/api/login`, credentials).pipe(
          tap(res => {
            console.log('4. Login bem sucedido!', res);
            this.currentUserSignal.set(res.user);
          })
        );
      }),
      catchError(err => {
        console.error('ERRO NO FLUXO:', err);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.http.post(`api/logout`, {}).subscribe({
      next: () => this.finalizeLogout(),
      error: () => this.finalizeLogout()
    });
  }

  private finalizeLogout(): void {
    // removido = localStorage.removeItem('access_token');
    localStorage.removeItem('pending_email');

    this.currentUserSignal.set(null);
    const router = this.injector.get(Router);
    router.navigate(['/login']);
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http.post(`/api/resend-code`, { email });
  }

  verifyEmail(email: string, code: string) {
    return this.getCsrfToken().pipe(
      switchMap(() =>
        this.http.post<AuthResponse>('/api/verify-email', { email, code }).pipe(
          tap(res => this.currentUserSignal.set(res.user))
        )
      )
    );
  }

  checkEmailAvailability(email: string): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(`/api/check-email`, { email });
  }

  checkUsernameAvailability(username: string) {
    return this.http.post<{ available: boolean }>(`/api/check-username`, { username });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`api/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    const params = `?email=${encodeURIComponent(data.email)}&expires=${data.expires}&signature=${data.signature}`;

    return this.http.post(`api/reset-password${params}`, {
      password: data.password,
      password_confirmation: data.password_confirmation
    });
  }
}
