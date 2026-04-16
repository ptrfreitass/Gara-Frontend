// src/app/features/home/home.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';

interface HealthStatus {
  laravel: boolean;
  database: boolean;
  redis: boolean;
  octane: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  template: `
    <div class="min-h-screen bg-linear-to-br from-primary-600  via-primary-400 to-secondary-700 flex items-center justify-center p-4 font-sans">
      <div class="max-w-5xl w-full">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          
          <!-- Header -->
          <div class="p-8 md:p-12 text-center border-b border-gray-100">
            <h1 class="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-secondary-600 mb-2">
              GARA
            </h1>
            <p class="text-gray-500 font-medium tracking-widest uppercase text-sm">
              Diagnóstico funcional técnico
            </p>
          </div>

          <div class="p-8 md:p-12">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <!-- Angular Card -->
              <div class="card-diagnostic">
                <div class="flex justify-between items-start mb-4">
                  <span class="text-4xl">⚡</span>
                  <span class="badge-status success">Ligaddo</span>
                </div>
                <h3 class="font-bold text-xl text-gray-800">Angular 21</h3>
                <p class="text-sm text-gray-500 mt-1">Frontend Core & Signals</p>
              </div>

              <!-- Laravel/Octane Card -->
              <div class="card-diagnostic">
                <div class="flex justify-between items-start mb-4">
                  <span class="text-4xl">🧩</span>
                  <span [class]="'badge-status ' + (status()?.laravel ? 'success' : 'error')">
                    {{ status()?.laravel ? (status()?.octane ? 'Octane Ativo' : 'Online') : 'Inativo' }}
                  </span>
                </div>
                <h3 class="font-bold text-xl text-gray-800">Laravel Octane</h3>
                <p class="text-sm text-gray-500 mt-1">Swoole Alta Perfomace</p>
                <button (click)="checkHealth()" [disabled]="loading()" class="btn-test mt-4">
                  {{ loading() ? 'Testando...' : 'Testar Conexão' }}
                </button>
              </div>

              <!-- Database Card -->
              <div class="card-diagnostic">
                <div class="flex justify-between items-start mb-4">
                  <span class="text-4xl">📦</span>
                  <span [class]="'badge-status ' + (status()?.database ? 'success' : 'error')">
                    {{ status()?.database ? 'Conectado' : 'Desconectado' }}
                  </span>
                </div>
                <h3 class="font-bold text-xl text-gray-800">PostgreSQL 16</h3>
                <p class="text-sm text-gray-500 mt-1">Camada de Persistência</p>
              </div>

              <!-- Redis Card -->
              <div class="card-diagnostic">
                <div class="flex justify-between items-start mb-4">
                  <span class="text-4xl">🚀</span>
                  <span [class]="'badge-status ' + (status()?.redis ? 'success' : 'error')">
                    {{ status()?.redis ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
                <h3 class="font-bold text-xl text-gray-800">Redis</h3>
                <p class="text-sm text-gray-500 mt-1">Driver de Cache e Fila</p>
              </div>

              <!-- Docker Card -->
              <div class="card-diagnostic">
                <div class="flex justify-between items-start mb-4">
                  <span class="text-4xl">🐳</span>
                  <span class="badge-status success">Conteinizado</span>
                </div>
                <h3 class="font-bold text-xl text-gray-800">Docker</h3>
                <p class="text-sm text-gray-500 mt-1">Ambiente Isolado (Conteiners)</p>
              </div>

              <!-- Tailwind Card -->
              <div class="card-diagnostic">
                <div class="flex justify-between items-start mb-4">
                  <span class="text-4xl">🎨</span>
                  <span class="badge-status success">Pronto</span>
                </div>
                <h3 class="font-bold text-xl text-gray-800">Tailwind 4.2</h3>
                <p class="text-sm text-gray-500 mt-1">Útilitário Moderno CSS</p>
              </div>

            </div>

            <!-- Actions -->
            <div class="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                routerLink="/auth/login" 
                class="px-10 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95">
                Entrar no Sistema
              </button>
              <button class="px-10 py-4 bg-white text-gray-700 border-2 border-gray-100 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95">
                Documentação API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
  @reference "../../../styles.css";
    .card-diagnostic {
      @apply p-6 bg-gray-50 border border-gray-100 rounded-2xl transition-all hover:shadow-md hover:bg-white;
    }
    .badge-status {
      @apply px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider;
    }
    .badge-status.success {
      @apply bg-green-100 text-green-600 border border-green-200;
    }
    .badge-status.error {
      @apply bg-red-100 text-red-600 border border-red-200;
    }
    .btn-test {
      @apply w-full py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all;
    }
  `]
})
export class HomeComponent {
  private http = inject(HttpClient);
  
  status = signal<HealthStatus | null>(null);
  loading = signal(false);
  
  checkHealth() {
    this.loading.set(true);
    this.http.get<HealthStatus>('/api/health-check')
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.status.set(res),
        error: () => this.status.set({ laravel: false, database: false, redis: false, octane: false })
      });
  }
}