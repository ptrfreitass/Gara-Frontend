import { Injectable } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private storageKey = 'gara-theme';

  initTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey) as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme: Theme = savedTheme ?? (prefersDark ? 'dark' : 'light');
    this.setTheme(theme);
  }

  toggleTheme(): void {
    const current = document.documentElement.getAttribute('data-bs-theme') as Theme;
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(theme: Theme): void{
    document.documentElement.setAttribute('data-bs-theme',theme);
    localStorage.setItem(this.storageKey, theme);
  }

  getCurrentTheme(): Theme {
    return (document.documentElement.getAttribute('data-bs-theme') as Theme) ?? 'light';
  }
}
