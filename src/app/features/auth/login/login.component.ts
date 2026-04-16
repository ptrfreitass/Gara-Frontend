import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    RouterLink
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-500 via-secondary-400 to-secondary-500 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">

        <!-- Logo / Marca -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Gara</h1>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">

          <div class="mb-8">
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">Bem-vindo de volta</h2>
            <p class="mt-1 text-sm text-gray-500">Entre com seu e-mail ou usuário para continuar</p>
          </div>

          <!-- Erro global -->
          @if (errorMessage()) {
            <div class="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>

            <!-- Identifier -->
            <div class="space-y-1">
              <label for="identifier" class="block text-sm font-semibold text-gray-700">
                E-mail ou Usuário
              </label>
              <input
                id="identifier"
                type="text"
                formControlName="identifier"
                autocomplete="username"
                placeholder="joao.silva ou joao@email.com"
                class="w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       placeholder:text-gray-400"
                [class.border-red-400]="isFieldInvalid('identifier')"
                [class.bg-red-50]="isFieldInvalid('identifier')"
                [class.border-gray-300]="!isFieldInvalid('identifier')"
              />
              @if (isFieldInvalid('identifier')) {
                <p class="text-xs text-red-600 font-medium flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  Campo obrigatório
                </p>
              }
            </div>

            <!-- Password -->
            <div class="space-y-1">
              <label for="password" class="block text-sm font-semibold text-gray-700">
                Senha
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full px-4 py-2.5 pr-11 rounded-xl border text-sm transition-all outline-none
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         placeholder:text-gray-400"
                  [class.border-red-400]="isFieldInvalid('password')"
                  [class.bg-red-50]="isFieldInvalid('password')"
                  [class.border-gray-300]="!isFieldInvalid('password')"
                />
                <!-- Toggle senha -->
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                >
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <p class="text-xs text-red-600 font-medium flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  Mínimo de 8 caracteres
                </p>
              }
            </div>

            <!-- Lembrar + Esqueci -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  formControlName="remember"
                  class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
                />
                <span class="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Lembrar-me</span>
              </label>
              <a
                routerLink="/auth/forgot-password"
                class="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
              >
                Esqueceu a senha?
              </a>
            </div>

            <!-- Submit -->
            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [fullWidth]="true"
              [disabled]="loginForm.invalid || isLoading()"
              [loading]="isLoading()"
            >
              {{ isLoading() ? 'Autenticando...' : 'Entrar' }}
            </app-button>

          </form>

          <!-- Rodapé -->
          <div class="mt-6 pt-6 border-t border-gray-100 text-center">
            <p class="text-sm text-gray-500">
              Não tem uma conta?
              <a routerLink="/auth/register" class="font-bold text-primary-600 hover:text-primary-800 transition-colors">
                Criar conta grátis
              </a>
            </p>
          </div>

        </div>

        <!-- Versão -->
        <p class="text-center text-xs text-white/60 mt-6">v1.0.0 · Gara © {{ currentYear }}</p>

      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder).nonNullable;
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly currentYear = new Date().getFullYear();

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  loginForm = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false],
  });

  /** Verifica se campo é inválido E foi tocado */
  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Marca todos os campos como touched para exibir erros
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { identifier, password, remember } = this.loginForm.getRawValue();

    this.authService.login(identifier, password, remember).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dash']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message ?? 'Credenciais inválidas. Tente novamente.'
        );
      },
    });
  }
}