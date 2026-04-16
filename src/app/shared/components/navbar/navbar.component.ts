// src/app/shared/components/navbar/navbar.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class= "shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo e Links -->
          <div class="flex">
            <!-- Logo -->
            <div class="shrink-0 flex items-center">
              <a routerLink="/" class="flex items-center space-x-2 group">
                <div class="w-10 h-10 bg-linear-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <span class="text-white text-xl font-bold">G</span>
                </div>
                <span class="text-xl font-bold bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  GARA
                </span>
              </a>
            </div>

            <!-- Desktop Navigation -->
            @if (authService.isAuthenticated()) {
              <div class="hidden md:ml-8 md:flex md:space-x-1">
                <a
                  routerLink="/dash"
                  routerLinkActive="bg-primary-50 text-linear-700"
                  class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all inline-flex items-center"
                >
                  <span class="mr-2">📊</span>
                  Dashboard
                </a>
                <a
                  routerLink="/finance"
                  routerLinkActive="bg-primary-50 text-primary-700"
                  class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all inline-flex items-center"
                >
                  <span class="mr-2">💰</span>
                  Finanças
                </a>
                <a
                  routerLink="/users"
                  routerLinkActive="bg-primary-50 text-primary-700"
                  class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all inline-flex items-center"
                >
                  <span class="mr-2">👥</span>
                  Usuários
                </a>
                <a
                  routerLink="/settings"
                  routerLinkActive="bg-primary-50 text-primary-700"
                  class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all inline-flex items-center"
                >
                  <span class="mr-2">⚙️</span>
                  Configurações
                </a>
              </div>
            }
          </div>

          <!-- left Side -->
          <div class="flex items-center space-x-4">
            @if (authService.isAuthenticated()) {
              <!-- Notifications -->
              <button class="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all">
                <span class="text-xl">🔔</span>
                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <!-- User Menu -->
              <div class="relative">
                <button
                  (click)="toggleUserMenu()"
                  class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <div class="w-8 h-8 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {{ getUserInitials() }}
                  </div>
                  <div class="hidden md:block text-left">
                    <p class="text-sm font-medium text-gray-900">{{ authService.currentUser()?.name }}</p>
                    <p class="text-xs text-gray-500">{{ authService.currentUser()?.email }}</p>
                  </div>
                  <svg class="w-4 h-4 text-gray-600 transition-transform" [class.rotate-180]="showUserMenu()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <!-- Dropdown -->
                @if (showUserMenu()) {
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn">
                    <div class="px-4 py-3 border-b border-gray-100">
                      <p class="text-sm font-medium text-gray-900">{{ authService.currentUser()?.name }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ authService.currentUser()?.email }}</p>
                    </div>
                    
                    <a routerLink="/profile" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                      <span class="mr-3">👤</span>
                      Meu Perfil
                    </a>
                    <a routerLink="/settings" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                      <span class="mr-3">⚙️</span>
                      Configurações
                    </a>
                    <a routerLink="/help" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                      <span class="mr-3">❓</span>
                      Ajuda
                    </a>
                    
                    <div class="border-t border-gray-100 mt-2 pt-2">
                      <button
                        (click)="logout()"
                        class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span class="mr-3">🚪</span>
                        Sair
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
            <!-- Redireciona para pagina de login -->
            }

            <!-- Mobile Menu Button -->
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (!showMobileMenu()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (showMobileMenu()) {
        <div class="md:hidden border-t border-gray-100 animate-slideDown">
          <div class="px-4 py-3 space-y-1">
            @if (authService.isAuthenticated()) {
              <a routerLink="/dash" class="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                📊 Dashboard
              </a>
              <a routerLink="/finance" class="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                💸 Finanças
              </a>
              <a routerLink="/users" class="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                👥 Usuários
              </a>
              <a routerLink="/settings" class="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                ⚙️ Configurações
              </a>
            }
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 500px; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slideDown {
      animation: slideDown 0.3s ease-out;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  
  showUserMenu = signal(false);
  showMobileMenu = signal(false);


  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu.set(false);
  }
}