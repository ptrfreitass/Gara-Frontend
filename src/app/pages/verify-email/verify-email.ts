import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder,
         FormGroup,
         Validators,
         ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
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

  /** Email exibido na tela (vem do fluxo anterior ou storage) */
  email = 'usuario@email.com';

  /** Estado */
  isLoading = false;
  resendCooldown = false;
  resendSeconds = 0;

  private resendInterval?: number;

  /** Formulário */
  verificationForm: FormGroup = this.fb.group({
    d0: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d1: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d2: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d3: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d4: ['', [Validators.required, Validators.pattern('[0-9]')]],
    d5: ['', [Validators.required, Validators.pattern('[0-9]')]],
  });

  /** Atalho para *ngFor */
  get codeControls(): string[] {
    return Object.keys(this.verificationForm.controls);
  }

  ngOnInit(): void {
    // Idealmente recuperar o email salvo no fluxo de registro
    const storedEmail = localStorage.getItem('pending_email');
    if (storedEmail) {
      this.email = storedEmail;
    }
  }

  ngOnDestroy(): void {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  }

  /* ============================
     INPUT HANDLING
  ============================ */

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    input.value = value;

    if (value && index < 5) {
      this.focusInput(index + 1);
    }
  }

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
     SUBMIT
  ============================ */

  submit(): void {
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const code = this.getCode();

    /**
     * Aqui:
     * - enviar { email, code } para o backend
     * - backend valida
     * - retorna sucesso ou erro
     */

    // SIMULAÇÃO
    setTimeout(() => {
      this.isLoading = false;

      // fluxo real → salvar auth + redirect
      this.router.navigate(['/login']);
    }, 1200);
  }

  private getCode(): string {
    return Object.values(this.verificationForm.value).join('');
  }

  /* ============================
     RESEND CODE
  ============================ */

  resendCode(): void {
    if (this.resendCooldown) return;

    this.startCooldown(60);

    /**
     * Aqui:
     * - chamar backend para reenviar código
     * - backend controla rate limit
     */
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown = true;
    this.resendSeconds = seconds;

    this.resendInterval = window.setInterval(() => {
      this.resendSeconds--;

      if (this.resendSeconds <= 0) {
        this.resendCooldown = false;
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }
}