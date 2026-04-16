import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

interface Breadcrumb {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <!-- Mobile overlay -->
    @if (mobileSidebarOpen()) {
      <div
        class="fixed inset-0 bg-black/40 z-30 lg:hidden"
        (click)="mobileSidebarOpen.set(false)"
      ></div>
    }

    <div class="flex h-screen bg-gray-50 overflow-hidden">

      <!-- Sidebar desktop -->
      <div class="hidden lg:flex flex-col h-full">
        <app-sidebar />
      </div>

      <!-- Sidebar mobile (drawer) -->
      <div
        class="fixed inset-y-0 left-0 z-40 flex flex-col lg:hidden transition-transform duration-300"
        [class.-translate-x-full]="!mobileSidebarOpen()"
        [class.translate-x-0]="mobileSidebarOpen()"
      >
        <app-sidebar />
      </div>

      <!-- Área principal -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

        <app-topbar [breadcrumbs]="breadcrumbs()" />

        <!-- Botão hamburger mobile -->
        <button
          class="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm"
          (click)="mobileSidebarOpen.set(!mobileSidebarOpen())"
          aria-label="Abrir menu"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Conteúdo -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>

      </div>
    </div>
  `
})
export class MainLayoutComponent {
  private router         = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  mobileSidebarOpen = signal(false);

  private navEnd = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
  );

  breadcrumbs = computed((): Breadcrumb[] => {
    this.navEnd(); // recomputa ao navegar
    return this.buildBreadcrumbs(this.activatedRoute.root);
  });

  private buildBreadcrumbs(
    route: ActivatedRoute,
    path = '', 
    crumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const children = route.children;

    for (const child of children) {
      const routeURL = child.snapshot.url.map(s => s.path).join('/');
      const fullPath = routeURL ? `${path}/${routeURL}` : path;
      const label    = child.snapshot.data['breadcrumb'] as string | undefined;

      // ✅ Só adiciona se realmente tiver label E tiver URL
      if (label && routeURL) {
        crumbs.push({ label, path: fullPath });
      }

      this.buildBreadcrumbs(child, fullPath, crumbs);
    }

    // O último item não tem link (é a página atual)
    if (crumbs.length > 0) {
      delete crumbs[crumbs.length - 1].path;
    }

    return crumbs;
  }
}