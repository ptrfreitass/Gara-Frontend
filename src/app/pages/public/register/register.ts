import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  isCheckingUsername = signal(false);
  usernameAvailable = signal<boolean | null>(null);
  isCheckingEmail = signal(false);
  emailAvailable = signal<boolean | null>(null);

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

    this.isLoading.set(true);

    const payload = this.registerForm.getRawValue();

    this.authService.register(payload).subscribe({
      next: (res) => {
        console.log('Usuário registrado com sucesso!', res);
        localStorage.removeItem('access_token');
        this.isLoading.set(false);
        localStorage.setItem('pending_email', payload.email);
        this.router.navigate(['/verify']);
      },
      error: (err) => {
        console.error('Erro no registro:', err);
        this.isLoading.set(false);
      }
    });
  }

  onUsernameBlur(): void {
    const control = this.registerForm.get('username');
    const value = control?.value;

    if (control?.valid && value) {
      this.isCheckingUsername.set(true);
      this.usernameAvailable.set(null);
      control.disable({ emitEvent: false });

      this.authService.checkUsernameAvailability(value).subscribe({
        next: (res) => {
          this.usernameAvailable.set(true);
          this.isCheckingUsername.set(false);
          control.enable();
        },
        error: (err) => {
          this.usernameAvailable.set(false);
          this.isCheckingUsername.set(false);
          control.enable();
          control.setErrors({ alreadyInUse: true });
        }
      });
    }
  }

  onEmailBlur(): void {
    const control = this.registerForm.get('email');
    const value = control?.value;

    if (control?.valid && value) {
      this.isCheckingEmail.set(true);
      this.emailAvailable.set(null);
      control.disable({ emitEvent: false });

      this.authService.checkEmailAvailability(value).subscribe({
        next: (res) => {
          this.emailAvailable.set(true);
          this.isCheckingEmail.set(false);
          control.enable();
        },
        error: (err) => {
          this.emailAvailable.set(false);
          this.isCheckingEmail.set(false);
          control.enable();
          control.setErrors({ alreadyInUse: true });
        }
      });
    }
  }

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
