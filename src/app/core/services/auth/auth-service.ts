import { Injectable, Injector, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, AuthResponse } from '../../models/user/user-model';
import { Observable, tap } from 'rxjs';
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
  private get router() {
    return this.injector.get(Router);
  }
  // Usamos Signals para gerenciar o estado do usuário de forma performática
  private currentUserSignal = signal<any | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  loadUserProfile() {
    return this.http.get(`api/user`).subscribe({
      next: (user) => this.currentUserSignal.set(user),
      error: () => this.logout()
    });
  }

  register(userData: User) {
    return this.http.post<AuthResponse>(`/api/register`, userData).pipe(
      tap(res => {
        this.saveToken(res.access_token);
        this.currentUserSignal.set(res.user);
      })
    );
  }

  login(credentials: any) {
    return this.http.post<AuthResponse>(`/api/login`, credentials).pipe(
      tap(res => {
        this.saveToken(res.access_token);
        this.currentUserSignal.set(res.user);
      })
    )
  }

  logout():void {
    this.http.post(`api/logout`, {}).subscribe({
      next: () => this.finalizeLogout(),
      error: () => this.finalizeLogout()
    });
  }

  private finalizeLogout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('pending_email');

    const router = this.injector.get(Router);
    router.navigate(['/login']);
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http.post(`/api/resend-code`, { email });
  }

  verifyEmail(email: string, code: string) {
    return this.http.post<any>('/api/verify-email', { email, code });
  }

  private saveToken(token: string) {
    localStorage.setItem('auth_token', token);
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
    // Passamos os parâmetros de segurança via Query String na própria URL do POST
    //const url = `api/reset-password?email=${data.email}&expires=${data.expires}&signature=${data.signature}`;

    const params = `?email=${encodeURIComponent(data.email)}&expires=${data.expires}&signature=${data.signature}`;

    // O corpo do POST leva apenas a senha
    return this.http.post(`api/reset-password${params}`, {
      password: data.password,
      password_confirmation: data.password_confirmation
    });
  }
}
