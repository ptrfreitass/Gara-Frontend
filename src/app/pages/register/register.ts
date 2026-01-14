import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { 
    ReactiveFormsModule,
    FormBuilder,
    Validators,
    AbstractControl,
    ValidationErrors
   } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
    ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);

  isLoading = false;

  registerForm = this.fb.group(
    {
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
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

    // Aqui futuramente:
    // this.authService.register(this.registerForm.value)

    console.log('Register payload:', this.registerForm.value);
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
    return (
      this.registerForm.hasError('passwordsMismatch') &&
      this.registerForm.get('password_confirmation')?.touched === true
    );
  }

  get terms(){
    return this.registerForm.get('terms');
  }
}