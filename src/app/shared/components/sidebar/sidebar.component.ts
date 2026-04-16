import { Component, inject, signal, computed, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CapabilityService } from '../../../core/services/capability/capability.service';
import { MENU_CONFIG, MenuItemConfig } from '../../config/menu.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      [class]="collapsed() ? 'w-16' : 'w-56'"
      class="bg-white border-r border-gray-100 flex flex-col h-full transition-all duration-300 shrink-0"
    >
      <!-- Logo -->
      <div class="flex items-center justify-between px-3 py-4 border-b border-gray-100 h-16">
        @if (!collapsed()) {
          <a routerLink="/app/dash" class="flex items-center gap-2 group">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <span class="text-white text-sm font-bold">G</span>
            </div>
            <span class="text-base font-bold text-indigo-600 tracking-wide">GARA</span>
          </a>
        }
        <button
          (click)="collapsed.set(!collapsed())"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors ml-auto"
          [attr.aria-label]="collapsed() ? 'Expandir menu' : 'Recolher menu'"
        >
          <svg class="w-4 h-4 transition-transform" [class.rotate-180]="!collapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        @for (item of visibleItems(); track item.key) {
          <div>
            @if (!item.children) {
              <!-- Item simples -->
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
                [routerLinkActiveOptions]="{ exact: item.path === '/app/dash' }"
                class="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                [title]="collapsed() ? item.label : ''"
              >
                <span class="text-base shrink-0">{{ item.icon }}</span>
                @if (!collapsed()) {
                  <span>{{ item.label }}</span>
                }
              </a>
            } @else {
              <!-- Item com submenu -->
              <button
                (click)="toggleSubmenu(item.key)"
                class="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                [class.bg-indigo-50]="openSubmenu() === item.key"
                [class.text-indigo-700]="openSubmenu() === item.key"
                [title]="collapsed() ? item.label : ''"
              >
                <span class="text-base shrink-0">{{ item.icon }}</span>
                @if (!collapsed()) {
                  <span class="flex-1 text-left">{{ item.label }}</span>
                  <svg
                    class="w-4 h-4 text-gray-400 transition-transform"
                    [class.rotate-180]="openSubmenu() === item.key"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                }
              </button>

              <!-- Submenu expandido (click, não hover) -->
              @if (!collapsed() && openSubmenu() === item.key) {
                <div class="ml-3 mt-0.5 pl-3 border-l border-gray-100 space-y-0.5">
                  @for (child of visibleChildren(item); track child.key) {
                    <a
                      [routerLink]="child.path"
                      routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <span class="text-sm">{{ child.icon }}</span>
                      <span>{{ child.label }}</span>
                    </a>
                  }
                </div>
              }
            }
          </div>
        }
      </nav>

      <!-- Footer -->
      <div class="border-t border-gray-100 px-2 py-3">
        <a
          routerLink="/app/settings"
          routerLinkActive="bg-indigo-50 text-indigo-700"
          class="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          [title]="collapsed() ? 'Configurações' : ''"
        >
          <span class="text-base shrink-0">⚙️</span>
          @if (!collapsed()) {
            <span>Configurações</span>
          }
        </a>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  private capabilityService = inject(CapabilityService);

  collapsed   = signal(false);
  openSubmenu = signal<string | null>(null);

  visibleItems = computed(() =>
    MENU_CONFIG.filter(item => {
      if (item.key === 'settings') return false; // renderizado no footer
      if (!item.capability) return true;
      return this.capabilityService.hasCapability(item.capability);
    })
  );

  visibleChildren(item: MenuItemConfig): MenuItemConfig[] {
    return (item.children ?? []).filter(child =>
      !child.capability || this.capabilityService.hasCapability(child.capability)
    );
  }

  toggleSubmenu(key: string): void {
    this.openSubmenu.update(current => current === key ? null : key);
  }
}