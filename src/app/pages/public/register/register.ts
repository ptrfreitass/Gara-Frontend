import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})

export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router)

  isLoading = false;

  // 1. Usamos nonNullable para que o TS saiba que os valores serão strings, não null.
  registerForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      terms: [false, Validators.requiredTrue]
    },
    {
      validators: this.passwordsMatchValidator,
    }
  );

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // 2. getRawValue() agora retorna o objeto exatamente como o Laravel quer
    const payload = this.registerForm.getRawValue();

    this.authService.register(payload).subscribe({
      next: (res) => {
        console.log('Usuário registrado com sucesso!', res);
        localStorage.removeItem('access_token');
        this.isLoading = false;
        localStorage.setItem('pending_email', payload.email);
        this.router.navigate(['/verify']);
      },
      error: (err) => {
        console.error('Erro no registro:', err);
        this.isLoading = false;
        // DICA: O Laravel envia os erros em err.error.errors
      }
    });
  }
  /* ============================
        VALIDAÇÃO DE USERNAME
    ============================ */
  isCheckingUsername = false;
  usernameAvailable: boolean | null = null;

  onUsernameBlur(): void {
    const control = this.registerForm.get('username');
    const value = control?.value;

    // Só valida se o campo for válido localmente (minlength, etc) e tiver valor
    if (control?.valid && value) {
      this.isCheckingUsername = true;
      this.usernameAvailable = null; // Reseta o estado visual
      control.disable({ emitEvent: false }); // Desabilita sem disparar eventos circulares

      this.authService.checkUsernameAvailability(value).subscribe({
        next: (res) => {
          this.usernameAvailable = true;
          this.isCheckingUsername = false;
          control.enable();
        },
        error: (err) => {
          this.usernameAvailable = false;
          this.isCheckingUsername = false;
          control.enable();
          // Define o erro no formulário para impedir o submit
          control.setErrors({ alreadyInUse: true });
        }
      });
    }
  }

  /* ============================
      VALIDAÇÃO DE EMAIL
  ============================ */
  isCheckingEmail = false;
  emailAvailable: boolean | null = null;

  onEmailBlur(): void {
    const control = this.registerForm.get('email');
    const value = control?.value;

    if (control?.valid && value) {
      this.isCheckingEmail = true;
      this.emailAvailable = null;
      control.disable({ emitEvent: false });

      // AGORA chamando a rota de email correta
      this.authService.checkEmailAvailability(value).subscribe({
        next: (res) => {
          this.emailAvailable = true;
          this.isCheckingEmail = false;
          control.enable();
        },
        error: (err) => {
          this.emailAvailable = false;
          this.isCheckingEmail = false;
          control.enable();
          // Define o erro no formulário
          control.setErrors({ alreadyInUse: true });
        }
      });
    }
  }

  // ===== Helpers =====

  fieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('password_confirmation')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  get passwordsMismatch(): boolean {
    const confirmControl = this.registerForm.get('password_confirmation');
    return this.registerForm.hasError('passwordsMismatch') && !!confirmControl?.touched;
  }

  get terms() {
    return this.registerForm.get('terms');
  }

}