// src/app/shared/components/input/input.component.ts
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-gray-700 mb-1">
          {{ label }}
          @if (required) {
            <span class="text-red-500">*</span>
          }
        </label>
      }

      <input
        [id]="id"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [class]="inputClasses"
        [(ngModel)]="value"
        (blur)="onTouched()"
      />

      @if (error && touched) {
        <p class="mt-1 text-sm text-red-600">{{ error }}</p>
      }

      @if (hint && !error) {
        <p class="mt-1 text-sm text-gray-500">{{ hint }}</p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).slice(2, 11)}`;
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' = 'text';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() error = '';
  @Input() hint = '';

  value = '';
  touched = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  get inputClasses(): string {
    const baseClasses = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors';
    const errorClass = this.error && this.touched ? 'border-red-500' : 'border-gray-300';
    const disabledClass = this.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
    
    return `${baseClasses} ${errorClass} ${disabledClass}`;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}