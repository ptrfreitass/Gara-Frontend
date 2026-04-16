// src/app/features/auth/register/register.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthService } from '../../../core/services/auth/auth.service';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  return password && confirm && password.value !== confirm.value
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    ButtonComponent, 
    RouterLink
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-bl from-secondary-500 via-primary-400 to-primary-600 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">

        <!-- Logo -->
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

          <div class="mb-6">
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">Criar conta</h2>
            <p class="mt-1 text-sm text-gray-500">Preencha os dados abaixo para começar</p>
          </div>

          <!-- Erro -->
          @if (errorMessage()) {
            <div class="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
            </div>
          }

          <!-- Sucesso -->
          @if (successMessage()) {
            <div class="mb-5 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <svg class="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-green-700 font-medium">{{ successMessage() }}</p>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>

            <!-- Nome -->
            <div class="space-y-1">
              <label for="name" class="block text-sm font-semibold text-gray-700">Nome completo</label>
              <input
                id="name" type="text" formControlName="name"
                autocomplete="name" placeholder="João Silva"
                class="w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400"
                [class.border-red-400]="isFieldInvalid('name')"
                [class.bg-red-50]="isFieldInvalid('name')"
                [class.border-gray-300]="!isFieldInvalid('name')"
              />
              @if (isFieldInvalid('name')) {
                <p class="text-xs text-red-600 font-medium">{{ getFieldError('name') }}</p>
              }
            </div>

            <!-- Usuário -->
            <div class="space-y-1">
              <label for="username" class="block text-sm font-semibold text-gray-700">Usuário</label>
              <input
                id="username" type="text" formControlName="username"
                autocomplete="username" placeholder="joao.silva"
                class="w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400"
                [class.border-red-400]="isFieldInvalid('username')"
                [class.bg-red-50]="isFieldInvalid('username')"
                [class.border-gray-300]="!isFieldInvalid('username')"
              />
              @if (isFieldInvalid('username')) {
                <p class="text-xs text-red-600 font-medium">{{ getFieldError('username') }}</p>
              }
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <label for="email" class="block text-sm font-semibold text-gray-700">E-mail</label>
              <input
                id="email" type="email" formControlName="email"
                autocomplete="email" placeholder="joao@exemplo.com"
                class="w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400"
                [class.border-red-400]="isFieldInvalid('email')"
                [class.bg-red-50]="isFieldInvalid('email')"
                [class.border-gray-300]="!isFieldInvalid('email')"
              />
              @if (isFieldInvalid('email')) {
                <p class="text-xs text-red-600 font-medium">{{ getFieldError('email') }}</p>
              }
            </div>

            <!-- Senha -->
            <div class="space-y-1">
              <label for="password" class="block text-sm font-semibold text-gray-700">Senha</label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="new-password" placeholder="••••••••"
                  class="w-full px-4 py-2.5 pr-11 rounded-xl border text-sm transition-all outline-none
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400"
                  [class.border-red-400]="isFieldInvalid('password')"
                  [class.bg-red-50]="isFieldInvalid('password')"
                  [class.border-gray-300]="!isFieldInvalid('password')"
                />
                <button type="button" (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'">
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>

              <!-- Força da senha -->
              @if (passwordValue()) {
                <div class="mt-2 space-y-1">
                  <div class="flex gap-1">
                    @for (i of [1,2,3,4]; track i) {
                      <div class="h-1 flex-1 rounded-full transition-all duration-300"
                        [class.bg-red-500]="passwordStrength() >= i && passwordStrength() < 2"
                        [class.bg-yellow-400]="passwordStrength() >= i && passwordStrength() === 2"
                        [class.bg-emerald-500]="passwordStrength() >= i && passwordStrength() >= 3"
                        [class.bg-gray-200]="passwordStrength() < i">
                      </div>
                    }
                  </div>
                  <p class="text-xs font-medium"
                    [class.text-red-600]="passwordStrength() < 2"
                    [class.text-yellow-600]="passwordStrength() === 2"
                    [class.text-emerald-600]="passwordStrength() >= 3">
                    {{ passwordStrengthText() }}
                  </p>
                </div>
              }

              @if (isFieldInvalid('password')) {
                <p class="text-xs text-red-600 font-medium">Mínimo de 8 caracteres</p>
              }
            </div>

            <!-- Confirmar senha -->
            <div class="space-y-1">
              <label for="confirmPassword" class="block text-sm font-semibold text-gray-700">Confirmar senha</label>
              <input
                id="confirmPassword" type="password" formControlName="confirmPassword"
                autocomplete="new-password" placeholder="••••••••"
                class="w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400"
                [class.border-red-400]="isConfirmInvalid()"
                [class.bg-red-50]="isConfirmInvalid()"
                [class.border-gray-300]="!isConfirmInvalid()"
              />
              @if (isConfirmInvalid()) {
                <p class="text-xs text-red-600 font-medium">As senhas não coincidem</p>
              }
            </div>

            <!-- Termos -->
            <div class="flex items-start gap-3 pt-1">
              <input
                id="terms" type="checkbox" formControlName="terms"
                class="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <label for="terms" class="text-sm text-gray-600 cursor-pointer leading-relaxed">
                Eu aceito os
                <a routerLink="/legal/terms" class="font-semibold text-primary-600 hover:text-primary-800 transition-colors">Termos de Serviço</a>
                e a
                <a routerLink="/legal/policy" class="font-semibold text-primary-600 hover:text-primary-800 transition-colors">Política de Privacidade</a>
              </label>
            </div>
            @if (registerForm.get('terms')?.invalid && registerForm.get('terms')?.touched) {
              <p class="text-xs text-red-600 font-medium -mt-2">Você deve aceitar os termos para continuar</p>
            }

            <!-- Submit -->
            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [fullWidth]="true"
              [disabled]="registerForm.invalid || isLoading()"
              [loading]="isLoading()"
            >
              {{ isLoading() ? 'Criando conta...' : 'Criar conta' }}
            </app-button>

          </form>

          <div class="mt-6 pt-6 border-t border-gray-100 text-center">
            <p class="text-sm text-gray-500">
              Já tem uma conta?
              <a routerLink="/auth/login" class="font-bold text-primary-600 hover:text-primary-800 transition-colors">
                Fazer login
              </a>
            </p>
          </div>

        </div>

        <p class="text-center text-xs text-white/60 mt-6">v1.0.0 · Gara © {{ currentYear }}</p>

      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder).nonNullable;
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly currentYear = new Date().getFullYear();

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    terms: [false, [Validators.requiredTrue]],
  }, { validators: [passwordMatchValidator] });

  protected passwordValue = toSignal(
    this.registerForm.get('password')!.valueChanges,
    { initialValue: '' }
  );

  passwordStrength = computed(() => {
    const p = this.passwordValue() ?? '';
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^a-zA-Z\d]/.test(p)) s++;
    return s;
  });

  passwordStrengthText = computed(() => {
    const s = this.passwordStrength();
    if (s < 2) return 'Senha fraca';
    if (s === 2) return 'Senha média';
    if (s === 3) return 'Senha forte';
    return 'Senha muito forte';
  });

  isFieldInvalid(field: string): boolean {
    const c = this.registerForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  isConfirmInvalid(): boolean {
    const c = this.registerForm.get('confirmPassword');
    return !!((this.registerForm.hasError('passwordMismatch') || c?.invalid) && c?.touched);
  }

  getFieldError(field: string): string {
    const c = this.registerForm.get(field);
    if (c?.hasError('required')) return 'Campo obrigatório';
    if (c?.hasError('minlength')) return `Mínimo de ${c.errors?.['minlength'].requiredLength} caracteres`;
    if (c?.hasError('email')) return 'E-mail inválido';
    if (c?.hasError('pattern')) return 'Apenas letras, números, ponto, hífen e underscore';
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { name, username, email, password } = this.registerForm.getRawValue();

    this.authService.register(name, username, email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/verify-email'],
        {
          state: { email: this.registerForm.value.email }
        }
      );
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Erro ao criar conta. Tente novamente.');
      },
    });
  }
}