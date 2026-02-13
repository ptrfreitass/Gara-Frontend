import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  /** Email exibido na tela */
  email = 'usuario@email.com';

  /** Estado da UI */
  isLoading = false;
  resendCooldown = false;
  resendSeconds = 60;
  errorMessage = '';

  private resendInterval?: any;

  /** * Formulário com 6 campos independentes.
   * Cada um aceita apenas 1 dígito numérico.
   */
  verificationForm: FormGroup = this.fb.group({
    d0: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d1: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d2: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d3: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d4: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d5: ['', [Validators.required, Validators.pattern('[0-9]')]],
  });

  /** Atalho para iterar nos inputs no HTML */
  get codeControls(): string[] {
    return Object.keys(this.verificationForm.controls);
  }

  ngOnInit(): void {
    // Recupera o email salvo no localStorage durante o registro
    const storedEmail = localStorage.getItem('pending_email');
    if (storedEmail) {
      this.email = storedEmail;
    } else {
      // Se não houver email pendente, volta para o registro por segurança
      this.router.navigate(['/register']);
    }
  }

  ngOnDestroy(): void {
    this.clearResendInterval();
  }

  /* ============================
      MANIPULAÇÃO DE INPUTS
  ============================ */

  /** Move o foco para o próximo campo ao digitar */
  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // Garante que é número

    input.value = value;

    if (value && index < 5) {
      this.focusInput(index + 1);
    }

    // Se preencher o último campo, tenta submeter automaticamente
    if (this.verificationForm.valid) {
      this.submit();
    }
  }

  /** Permite voltar campos com o Backspace */
  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;

      if (!input.value && index > 0) {
        this.focusInput(index - 1);
      }
    }
  }

  private focusInput(index: number): void {
    const inputs = document.querySelectorAll<HTMLInputElement>('.code-inputs input');
    inputs[index]?.focus();
  }

  /* ============================
      SUBMISSÃO E LÓGICA
  ============================ */

  submit(): void {
    if (this.verificationForm.invalid || this.isLoading) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const code = this.getCode();

    this.authService.verifyEmail(this.email, code)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          localStorage.removeItem('pending_email');
          this.authService.currentUserSignal.set(res.user);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Código inválido ou expirado.';
          this.verificationForm.reset();
          this.focusInput(0);
        }
      });
  }

  private getCode(): string {
    return Object.values(this.verificationForm.value).join('');
  }

  /* ============================
      REENVIO DE CÓDIGO
  ============================ */
resendVerificationCode(): void {
  // 1. Verificações de segurança
  if (this.resendCooldown || !this.email) return;

  console.log('Enviando novo código para:', this.email);

  // 2. Chame o serviço passando o email
  this.authService.resendVerificationCode(this.email).subscribe({
    next: () => {
      this.startCooldown(60);
      this.errorMessage = '';
      alert('Um novo código foi enviado para seu e-mail!');
    },
    error: (err: any) => { 
      console.error(err);
      this.errorMessage = 'Erro ao reenviar e-mail. Tente novamente em instantes.';
    }
  });
}

  private startCooldown(seconds: number): void {
    this.resendCooldown = true;
    this.resendSeconds = seconds;

    this.clearResendInterval();
    this.resendInterval = setInterval(() => {
      this.resendSeconds--;
      if (this.resendSeconds <= 0) {
        this.resendCooldown = false;
        this.clearResendInterval();
      }
    }, 1000);
  }

  private clearResendInterval(): void {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  }
}