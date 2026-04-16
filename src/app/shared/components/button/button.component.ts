// src/app/shared/components/button/button.component.ts
import { Component, Input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick()"
    >
      @if (loading) {
        <span class="inline-block animate-spin mr-2">⏳</span>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  // Output usando novo API do Angular 21
  clicked = output<void>();

  get buttonClasses(): string {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
    
    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    const widthClass = this.fullWidth ? 'w-full' : '';
    const disabledClass = this.disabled || this.loading ? 'cursor-not-allowed opacity-60' : '';
    
    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]} ${widthClass} ${disabledClass}`;
  }

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}