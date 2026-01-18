import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);


  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submitLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: (res) => {
        localStorage.setItem('access_token', res.access_token);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;

        // Verificamos se o erro é o 403 (E-mail não verificado)
        if (err.status === 403 && err.error.requires_verification) {
          // Salvamos o e-mail no storage para a tela de verificação saber para quem enviar o código
          localStorage.setItem('pending_email', err.error.email);

          // Redireciona para a rota de verificação que criamos antes
          this.router.navigate(['/verify']);
        } else {
          // Erro comum de senha ou usuário não encontrado
          this.errorMessage = err.error.message || 'Falha ao entrar.';
        }
      }
    });
  }

  fieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

}
