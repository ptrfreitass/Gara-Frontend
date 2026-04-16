import { Component, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">

      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm text-gray-500">
        @for (crumb of breadcrumbs(); track crumb.path; let last = $last) {
          @if (!last) {
            <a [routerLink]="crumb.path" class="hover:text-indigo-600 transition-colors">{{ crumb.label }}</a>
            <span class="text-gray-300">/</span>
          } @else {
            <span class="text-gray-900 font-medium">{{ crumb.label }}</span>
          }
        }
      </nav>

      <!-- Usuário -->
      <div class="relative">
        <button
          (click)="showMenu.set(!showMenu())"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {{ initials() }}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-sm font-medium text-gray-900 leading-tight">{{ authService.currentUser()?.name }}</p>
            <p class="text-xs text-gray-400 leading-tight capitalize">{{ authService.currentUser()?.plan_type }}</p>
          </div>
          <svg class="w-4 h-4 text-gray-400 transition-transform" [class.rotate-180]="showMenu()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        @if (showMenu()) {
          <!-- Overlay para fechar -->
          <div class="fixed inset-0 z-40" (click)="showMenu.set(false)"></div>

          <div class="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
            <div class="px-4 py-2 border-b border-gray-100 mb-1">
              <p class="text-sm font-medium text-gray-900 truncate">{{ authService.currentUser()?.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ authService.currentUser()?.email }}</p>
            </div>
            <a routerLink="/app/settings" (click)="showMenu.set(false)"
              class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <span>⚙️</span> Configurações
            </a>
            <div class="border-t border-gray-100 mt-1 pt-1">
              <button (click)="logout()"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <span>🚪</span> Sair
              </button>
            </div>
          </div>
        }
      </div>
    </header>
  `
})
export class TopbarComponent {
  authService = inject(AuthService);

  breadcrumbs = input<{ label: string; path?: string }[]>([]);
  showMenu    = signal(false);

  initials = () => {
    const name = this.authService.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  logout(): void {
    this.showMenu.set(false);
    this.authService.logout().subscribe();
  }
}