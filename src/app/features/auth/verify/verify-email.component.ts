// src/app/features/auth/verify-email/verify-email.component.ts

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-bl from-secondary-500 via-primary-400 to-primary-600 py-12 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <!-- Ícone -->
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-6 shadow-lg">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">Verifique seu e-mail</h2>
        <p class="text-gray-500 text-center text-sm mb-8">
          Enviamos um código de 6 dígitos para<br>
          <span class="font-semibold text-gray-700">{{ email() }}</span>
        </p>

        <!-- Input do código -->
        <div class="flex gap-2 justify-center mb-6">
          @for (i of [0,1,2,3,4,5]; track i) {
            <input
              type="text"
              maxlength="1"
              [value]="codeDigits()[i]"
              (input)="onDigitInput($event, i)"
              (keydown)="onKeyDown($event, i)"
              (paste)="onPaste($event)"
              [id]="'digit-' + i"
              class="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl
                     focus:border-primary-500 focus:outline-none transition-colors
                     uppercase tracking-widest"
              [class.border-primary-500]="codeDigits()[i]"
              [class.border-gray-200]="!codeDigits()[i]"
              [class.border-red-400]="errorMessage()"
            />
          }
        </div>

        <!-- Erro -->
        @if (errorMessage()) {
          <p class="text-red-500 text-sm text-center mb-4">{{ errorMessage() }}</p>
        }

        <!-- Botão verificar -->
        <button (click)="verify()" [disabled]="!isCodeComplete() || isLoading()"
          class="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold
                 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors mb-4">
          @if (isLoading()) { Verificando... } @else { Verificar conta }
        </button>

        <!-- Reenviar -->
        <div class="text-center text-sm text-gray-500">
          Não recebeu o código?

          @if (cooldown() > 0) {
            <span class="text-gray-400 ml-1">
              Reenviar em {{ formatCooldown() }}
            </span>
          } @else if (resendsLeft() > 0) {
            <button (click)="resend()" [disabled]="resending()"
              class="text-primary-600 font-semibold ml-1 hover:underline disabled:opacity-50">
              {{ resending() ? 'Enviando...' : 'Reenviar código' }}
            </button>
            <span class="text-gray-400 text-xs block mt-1">
              {{ resendsLeft() }} reenvio(s) restante(s)
            </span>
          } @else {
            <span class="text-gray-400 ml-1">Limite de reenvios atingido</span>
          }
        </div>

      </div>
    </div>
  `,
})
export class VerifyEmailComponent implements OnInit {
  private router      = inject(Router);
  private api         = inject(ApiService);
  private authService = inject(AuthService);

  email       = signal('');
  codeDigits  = signal<string[]>(['', '', '', '', '', '']);
  isLoading   = signal(false);
  resending   = signal(false);
  errorMessage = signal('');
  cooldown    = signal(0);
  resendsLeft = signal(3);

  isCodeComplete = computed(() => this.codeDigits().every(d => d !== ''));

  private cooldownInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // Recupera e-mail do state da navegação
    const nav = this.router.getCurrentNavigation();
    const email = nav?.extras?.state?.['email']
      ?? history.state?.email;

    if (!email) {
      this.router.navigate(['/auth/register']);
      return;
    }

    this.email.set(email);
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);

    const digits = [...this.codeDigits()];
    digits[index] = value;
    this.codeDigits.set(digits);
    this.errorMessage.set('');

    // Avança para o próximo campo
    if (value && index < 5) {
      document.getElementById(`digit-${index + 1}`)?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const digits = [...this.codeDigits()];
      if (!digits[index] && index > 0) {
        digits[index - 1] = '';
        this.codeDigits.set(digits);
        document.getElementById(`digit-${index - 1}`)?.focus();
      } else {
        digits[index] = '';
        this.codeDigits.set(digits);
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 6) ?? '';

    const digits = [...this.codeDigits()];
    pasted.split('').forEach((char, i) => {
      if (i < 6) digits[i] = char;
    });
    this.codeDigits.set(digits);

    // Foca no último campo preenchido
    const lastIndex = Math.min(pasted.length, 5);
    document.getElementById(`digit-${lastIndex}`)?.focus();
  }

  verify(): void {
    if (!this.isCodeComplete()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const code = this.codeDigits().join('');

    this.api.post<{ user: any }>('/auth/verify-email', {
      email: this.email(),
      code,
    }).subscribe({
      next: () => {
        this.authService.refreshUser().subscribe(() => {
          this.router.navigate(['/dash']);
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.errors?.code?.[0] ?? 'Código inválido.');
        // Limpa os campos
        this.codeDigits.set(['', '', '', '', '', '']);
        document.getElementById('digit-0')?.focus();
      },
    });
  }

  resend(): void {
    this.resending.set(true);

    this.api.post<{ next_cooldown: number; resends_left: number }>('/auth/resend-verification', {
      email: this.email(),
    }).subscribe({
      next: (response) => {
        this.resending.set(false);
        this.resendsLeft.set(response.resends_left);
        this.startCooldown(response.next_cooldown);
      },
      error: (err) => {
        this.resending.set(false);
        this.errorMessage.set(err.error?.errors?.code?.[0] ?? 'Erro ao reenviar.');
      },
    });
  }

  formatCooldown(): string {
    const s = this.cooldown();
    if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${s}s`;
  }

  private startCooldown(seconds: number): void {
    clearInterval(this.cooldownInterval);
    this.cooldown.set(seconds);

    this.cooldownInterval = setInterval(() => {
      this.cooldown.update(v => {
        if (v <= 1) { clearInterval(this.cooldownInterval); return 0; }
        return v - 1;
      });
    }, 1000);
  }
}