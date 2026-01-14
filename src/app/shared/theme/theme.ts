import { Component, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme/theme';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './theme.html',
  styleUrl: './theme.scss'
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  toggle(): void {
    this.themeService.toggleTheme();
  }

  get isDark(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }
}
