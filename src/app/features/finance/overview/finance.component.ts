import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FinanceService } from '../../../core/services/finance/finance';
import { AuthService } from '../../../core/services/auth/auth.service'; 
import { Transaction, Balance, Category, TransactionType, TransactionFilters } from '../../../core/models/finance.model';
import { CapabilityService } from '../../../core/services/capability/capability.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
  <div class="min-h-screen bg-gray-50">
    <app-navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-1">Finanças 💰</h1>
          <p class="text-gray-600">Controle suas receitas e despesas</p>
        </div>
        <div class="flex gap-3">
          @if (canExport) {
            <button class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              📤 Exportar
            </button>
          }
          @if (canCreate) {
            <button (click)="openModal()" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              + Novo Lançamento
            </button>
          }
        </div>
      </div>

      <!--  s de Resumo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <!-- Saldo -->
        <div class="rounded-xl shadow-sm p-6 border"
            [class.bg-white]="(balance()?.balance ?? 0) >= 0"
            [class.border-gray-100]="(balance()?.balance ?? 0) >= 0"
            [class.bg-red-50]="(balance()?.balance ?? 0) < 0"
            [class.border-red-100]="(balance()?.balance ?? 0) < 0">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl">💳</div>
            <span class="text-xs font-semibold px-2 py-1 rounded-full"
                  [class.bg-green-100]="(balance()?.balance ?? 0) >= 0"
                  [class.text-green-700]="(balance()?.balance ?? 0) >= 0"
                  [class.bg-red-100]="(balance()?.balance ?? 0) < 0"
                  [class.text-red-700]="(balance()?.balance ?? 0) < 0">
              {{ (balance()?.balance ?? 0) >= 0 ? '▲ Positivo' : '▼ Negativo' }}
            </span>
          </div>
          <p class="text-gray-500 text-sm font-medium mb-1">Saldo Atual</p>
          <p class="text-2xl font-bold"
            [class.text-gray-900]="(balance()?.balance ?? 0) >= 0"
            [class.text-red-600]="(balance()?.balance ?? 0) < 0">
            {{ balance()?.balance | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
          </p>
          <p class="text-xs text-gray-400 mt-1">{{ balance()?.updated_at | date:'dd/MM/yyyy HH:mm' }}</p>
        </div>

        <!-- Receitas -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-2xl">📈</div>
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">↗ Receitas</span>
          </div>
          <p class="text-gray-500 text-sm font-medium mb-1">Total de Receitas</p>
          <p class="text-2xl font-bold text-green-600">{{ totalIncome() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ transactions().length }} lançamentos</p>
        </div>

        <!-- Despesas -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-2xl">📉</div>
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">↘ Despesas</span>
          </div>
          <p class="text-gray-500 text-sm font-medium mb-1">Total de Despesas</p>
          <p class="text-2xl font-bold text-red-500">{{ totalExpense() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ transactions().length }} lançamentos</p>
        </div>

      </div>

      <!-- Filtros + Tabela -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">

        <!-- Filtros -->
        <div class="flex flex-wrap gap-3 p-4 border-b border-gray-100">
          <select [(ngModel)]="filters.type" (change)="applyFilters()"
            class="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <select [(ngModel)]="filters.category_id" (change)="applyFilters()"
            class="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">Todas as categorias</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>

          <input type="date" [(ngModel)]="filters.start_date" (change)="applyFilters()"
            class="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300" />

          <input type="date" [(ngModel)]="filters.end_date" (change)="applyFilters()"
            class="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300" />

          @if (filters.type || filters.category_id || filters.start_date || filters.end_date) {
            <button (click)="clearFilters()" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2">
              ✕ Limpar filtros
            </button>
          }
        </div>

        <!-- Tabela -->
        <div class="overflow-x-auto">
          @if (loading()) {
            <p class="py-12 text-center text-gray-400 text-sm">Carregando...</p>
          } @else if (transactions().length === 0) {
            <p class="py-12 text-center text-gray-400 text-sm">Nenhuma transação encontrada.</p>
          } @else {
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                  <th class="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                @for (tx of transactions(); track tx.id) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                            [class.bg-green-100]="tx.type === TransactionType.INCOME"
                            [class.bg-red-100]="tx.type === TransactionType.EXPENSE">
                          {{ tx.type === TransactionType.INCOME ? '↑' : '↓' }}
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ tx.description || '—' }}</p>
                          @if (tx.subcategory) {
                            <p class="text-xs text-gray-400">{{ tx.subcategory.name }}</p>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <span class="w-2 h-2 rounded-full inline-block" [style.background-color]="tx.category.color"></span>
                        {{ tx.category.name }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-500">{{ tx.date | date:'dd/MM/yyyy' }}</td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [class.bg-green-100]="tx.type === TransactionType.INCOME"
                            [class.text-green-700]="tx.type === TransactionType.INCOME"
                            [class.bg-red-100]="tx.type === TransactionType.EXPENSE"
                            [class.text-red-700]="tx.type === TransactionType.EXPENSE">
                        {{ tx.type === TransactionType.INCOME ? 'Receita' : 'Despesa' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <span class="text-sm font-bold"
                            [class.text-green-600]="tx.type === TransactionType.INCOME"
                            [class.text-red-500]="tx.type === TransactionType.EXPENSE">
                        {{ tx.type === TransactionType.INCOME ? '+' : '-' }}
                        {{ tx.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      @if (canDelete) {
                        <button (click)="deleteTransaction(tx.id)" class="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">✕</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

    </main>
</div>

<!-- Modal: Novo Lançamento -->
@if (showModal()) {
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" (click)="closeModal()">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">

      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">Novo Lançamento</h3>
        <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <div class="p-6 space-y-4">

        <!-- Toggle Tipo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <div class="flex rounded-lg border border-gray-200 overflow-hidden">
            <button (click)="form.type = 'expense'; form.category_id = ''; form.subcategory_id = ''"
              class="flex-1 py-2 text-sm font-medium transition-colors"
              [class.bg-red-500]="form.type === 'expense'"
              [class.text-white]="form.type === 'expense'"
              [class.text-gray-600]="form.type !== 'expense'"
              [class.hover:bg-gray-50]="form.type !== 'expense'">
              ↓ Despesa
            </button>
            <button (click)="form.type = 'income'; form.category_id = ''; form.subcategory_id = ''"
              class="flex-1 py-2 text-sm font-medium transition-colors"
              [class.bg-green-500]="form.type === 'income'"
              [class.text-white]="form.type === 'income'"
              [class.text-gray-600]="form.type !== 'income'"
              [class.hover:bg-gray-50]="form.type !== 'income'">
              ↑ Receita
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select [(ngModel)]="form.category_id"
            class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">Selecione...</option>
            @for (cat of categories(); track cat.id) {
              @if (cat.type === form.type) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            }
          </select>
        </div>

        @if (subcategories.length > 0) {
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
            <select [(ngModel)]="form.subcategory_id"
              class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Nenhuma</option>
              @for (sub of subcategories; track sub.id) {
                <option [value]="sub.id">{{ sub.name }}</option>
              }
            </select>
          </div>
        }

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
            <input type="number" [(ngModel)]="form.amount" min="0.01" step="0.01" placeholder="0,00"
              class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input type="date" [(ngModel)]="form.date"
              class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Descrição <span class="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input type="text" [(ngModel)]="form.description" placeholder="Ex: Almoço com cliente..."
            class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>

      </div>

      <div class="flex gap-3 p-6 pt-0">
        <button (click)="closeModal()" class="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
        <button (click)="submitTransaction()" class="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          Salvar
        </button>
      </div>

    </div>
  </div>
}`,
})
export class FinanceComponent implements OnInit {
  private financeService = inject(FinanceService);
  capabilityService = inject(CapabilityService);

  balance = signal<Balance | null>(null);
  transactions = signal<Transaction[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  showModal = signal(false);

  filters: TransactionFilters = { type: undefined, category_id: undefined, start_date: undefined, end_date: undefined };

  form: {
    type: string;
    category_id: string;
    subcategory_id: string;
    amount: string;
    description: string;
    date: string;
  } = {
    type: 'expense',
    category_id: '',
    subcategory_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  };

  TransactionType = TransactionType;
  canCreate = this.capabilityService.hasCapability('finance.create');
  canDelete = this.capabilityService.hasCapability('finance.delete');
  canExport  = this.capabilityService.hasCapability('finance.export');

  totalIncome  = computed(() => this.balance()?.total_income ?? 0);
  totalExpense = computed(() => this.balance()?.total_expense ?? 0);

  get subcategories() {
    return this.categories().find(c => c.id === +this.form.category_id)?.subcategories ?? [];
  }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.financeService.getBalance().subscribe(b => this.balance.set(b));
    this.financeService.getCategories().subscribe(c => this.categories.set(c));
    this.financeService.getTransactions(this.filters).subscribe(res => {
      this.transactions.set(res.data);
      this.loading.set(false);
    });
  }

  applyFilters(): void { this.loadData(); }
  clearFilters(): void { 
    this.filters = {}; 
    this.loadData(); 
  }

  openModal(): void { this.showModal.set(true); }
  closeModal(): void {
    this.showModal.set(false);
    this.form = { type: 'expense', category_id: '', subcategory_id: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] };
  }

  submitTransaction(): void {
  if (!this.form.amount || !this.form.category_id || !this.form.date) return;

  const payload: Partial<Transaction> = {
    type:           this.form.type as TransactionType,
    amount:         Number(this.form.amount),
    category_id:    Number(this.form.category_id),
    subcategory_id: this.form.subcategory_id ? Number(this.form.subcategory_id) : undefined,
    description:    this.form.description || undefined,
    date:           this.form.date,
  };

  this.financeService.createTransaction(payload).subscribe(() => {
    this.closeModal();
    this.loadData();
  });
}

  deleteTransaction(id: number): void {
    if (!confirm('Remover esta transação?')) return;
    this.financeService.deleteTransaction(id).subscribe(() => this.loadData());
  }
}