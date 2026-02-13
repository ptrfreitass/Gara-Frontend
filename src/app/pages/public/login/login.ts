import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.nonNullable.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submitLogin(): void {
    if (this.loginForm.invalid) return;

      console.log('Botão clicado no componente');

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        console.log('Sucesso no componente'),
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Erro 419 capturado no componente:', err)
        this.isLoading.set(false);

        if (err.status === 403 && err.error.requires_verification) {
          localStorage.setItem('pending_email', err.error.email);
          this.router.navigate(['/verify-email']);
          return;
        }

        this.errorMessage.set(err.error?.message || 'Erro ao fazer login. Tente novamente.');
      }
    });
  }

  fieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

}