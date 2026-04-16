// src/app/features/dash/dash.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-dash',
  standalone: true,
  imports: [CommonModule],
  template: `
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Olá, {{ authService.currentUser()?.name?.split(' ')?.[0] || 'Usuário' }}! 👋
        </h1>
        <p class="text-gray-600">
          Aqui está o resumo das suas atividades hoje
        </p>
      </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          @for (stat of stats(); track stat.title) {
            <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                     [ngClass]="stat.color">
                  {{ stat.icon }}
                </div>
                <div class="flex items-center text-sm font-medium"
                     [class.text-green-600]="stat.trend === 'up'"
                     [class.text-red-600]="stat.trend === 'down'">
                  <span class="mr-1">{{ stat.trend === 'up' ? '↗' : '↘' }}</span>
                  {{ stat.change }}
                </div>
              </div>
              <h3 class="text-gray-600 text-sm font-medium mb-1">{{ stat.title }}</h3>
              <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Chart Area -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-gray-900">Visão Geral</h2>
              <div class="flex space-x-2">
                <button class="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                  7 dias
                </button>
                <button class="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                  30 dias
                </button>
                <button class="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                  90 dias
                </button>
              </div>
            </div>
            
            <!-- Simple Chart Visualization -->
            <div class="space-y-4">
              @for (item of chartData(); track item.label) {
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
                    <span class="text-sm font-semibold text-gray-900">{{ item.value }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="h-2.5 rounded-full transition-all duration-500"
                         [ngClass]="item.color"
                         [style.width.%]="item.value">
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Quick Actions -->
            <div class="mt-8 pt-6 border-t border-gray-100">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                  <span class="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</span>
                  <span class="text-xs font-medium text-gray-700">Novo Item</span>
                </button>
                <button class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                  <span class="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</span>
                  <span class="text-xs font-medium text-gray-700">Relatório</span>
                </button>
                <button class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                  <span class="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</span>
                  <span class="text-xs font-medium text-gray-700">Equipe</span>
                </button>
                <button class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                  <span class="text-2xl mb-2 group-hover:scale-110 transition-transform">⚙️</span>
                  <span class="text-xs font-medium text-gray-700">Config</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Activity Feed -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h2>
            <div class="space-y-4">
              @for (activity of activities(); track activity.id) {
                <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div class="shrink-0 w-8 h-8 bg-linear-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                    <span class="text-sm">{{ activity.icon }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ activity.user }}</p>
                    <p class="text-sm text-gray-600">{{ activity.action }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ activity.time }}</p>
                  </div>
                </div>
              }
            </div>
            
            <button class="w-full mt-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              Ver todas as atividades →
            </button>
          </div>
        </div>

        <!-- Recent Items -->
        <div class="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Itens Recentes</h2>
            <button class="text-sm font-medium text-primary-600 hover:text-primary-700">
              Ver todos
            </button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Nome</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Data</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (item of recentItems(); track item.id) {
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-linear-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center mr-3">
                          <span class="text-sm">{{ item.icon }}</span>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                          <p class="text-xs text-gray-500">{{ item.description }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [ngClass]="{
                              'bg-green-100 text-green-800': item.status === 'Ativo',
                              'bg-yellow-100 text-yellow-800': item.status === 'Pendente',
                              'bg-gray-100 text-gray-800': item.status === 'Inativo'
                            }">
                        {{ item.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-600">{{ item.date }}</td>
                    <td class="py-3 px-4">
                      <button class="text-gray-400 hover:text-primary-600 transition-colors">
                        <span class="text-lg">⋯</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>
  `
})
export class DashComponent implements OnInit {
  authService = inject(AuthService);

  stats = signal<StatCard[]>([
    { title: 'Total de Usuários', value: '2,543', change: '+12.5%', trend: 'up', icon: '👥', color: 'bg-blue-100' },
    { title: 'Receita', value: 'R$ 45.2k', change: '+8.2%', trend: 'up', icon: '💰', color: 'bg-green-100' },
    { title: 'Projetos Ativos', value: '18', change: '-2.4%', trend: 'down', icon: '📊', color: 'bg-purple-100' },
    { title: 'Taxa de Conversão', value: '3.24%', change: '+5.1%', trend: 'up', icon: '📈', color: 'bg-orange-100' },
  ]);

  chartData = signal([
    { label: 'Vendas', value: 85, color: 'bg-gradient-to-r from-primary-500 to-primary-600' },
    { label: 'Marketing', value: 65, color: 'bg-gradient-to-r from-secondary-500 to-secondary-600' },
    { label: 'Suporte', value: 45, color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { label: 'Desenvolvimento', value: 90, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  ]);

  activities = signal<Activity[]>([
    { id: 1, user: 'João Silva', action: 'criou um novo projeto', time: 'há 5 minutos', icon: '📁' },
    { id: 2, user: 'Maria Santos', action: 'atualizou o relatório', time: 'há 15 minutos', icon: '📝' },
    { id: 3, user: 'Pedro Costa', action: 'comentou em uma tarefa', time: 'há 1 hora', icon: '💬' },
    { id: 4, user: 'Ana Lima', action: 'completou um milestone', time: 'há 2 horas', icon: '🎯' },
    { id: 5, user: 'Carlos Souza', action: 'enviou um arquivo', time: 'há 3 horas', icon: '📎' },
  ]);

  recentItems = signal([
    { id: 1, name: 'Projeto Alpha', description: 'Desenvolvimento web', status: 'Ativo', date: '19/02/2026', icon: '🚀' },
    { id: 2, name: 'Campanha Beta', description: 'Marketing digital', status: 'Pendente', date: '18/02/2026', icon: '📢' },
    { id: 3, name: 'Relatório Q1', description: 'Análise financeira', status: 'Ativo', date: '17/02/2026', icon: '📊' },
    { id: 4, name: 'Treinamento', description: 'Capacitação equipe', status: 'Inativo', date: '16/02/2026', icon: '🎓' },
  ]);

  ngOnInit(): void {
    // Carregar dados do dashboard
  }
}