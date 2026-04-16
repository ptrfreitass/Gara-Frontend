// src/app/features/finance/import/finance-import-review.component.ts

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from '../../../core/services/finance/finance';
import {
  ImportSession, ImportItem, ImportItemStatus, ImportSessionStatus,
  Category, Subcategory, FinanceAccount, PaymentMethod,
} from '../../../core/models/finance.model';

@Component({
  selector: 'app-finance-import-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-5 p-6">

      @if (loading()) {
        <p class="text-gray-500 text-sm py-8 text-center">Carregando sessão...</p>
      } @else if (!session()) {
        <p class="text-red-600 text-sm py-8 text-center">Sessão não encontrada.</p>
      } @else {

        <!-- Mensagens de erro/sucesso -->
        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <span class="text-red-600 text-lg">⚠️</span>
            <div class="flex-1">
              <p class="text-sm text-red-800 font-medium">{{ errorMessage() }}</p>
            </div>
            <button (click)="errorMessage.set(null)" class="text-red-400 hover:text-red-600">✕</button>
          </div>
        }
        @if (successMessage()) {
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <span class="text-green-600 text-lg">✓</span>
            <div class="flex-1">
              <p class="text-sm text-green-800 font-medium">{{ successMessage() }}</p>
            </div>
            <button (click)="successMessage.set(null)" class="text-green-400 hover:text-green-600">✕</button>
          </div>
        }

        <!-- Header -->
        <div class="flex justify-between items-start flex-wrap gap-3 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <h3 class="m-0 text-base font-semibold text-gray-900">{{ session()!.bank.name }} — {{ session()!.filename }}</h3>
            <span class="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
              [ngClass]="{
                'bg-amber-50 text-amber-700': session()!.status === SessionStatus.PENDING || session()!.status === SessionStatus.REVIEWING,
                'bg-green-50 text-green-700': session()!.status === SessionStatus.COMPLETED,
                'bg-red-50 text-red-700': session()!.status === SessionStatus.CANCELLED
              }">
              {{ statusLabel(session()!.status) }}
            </span>
          </div>
          <div class="flex gap-4 text-sm text-gray-600">
            <span>Total: <strong class="text-gray-900">{{ session()!.total_rows }}</strong></span>
            <span>Pendentes: <strong class="text-gray-900">{{ pendingCount() }}</strong></span>
            <span>Confirmados: <strong class="text-gray-900">{{ session()!.confirmed_rows }}</strong></span>
            <span>Ignorados: <strong class="text-gray-900">{{ session()!.skipped_rows }}</strong></span>
          </div>
        </div>

        <!-- Filtro de status -->
        <div class="flex gap-2 flex-wrap">
          @for (f of statusFilters; track f.value) {
            <button
              class="px-3.5 py-1.5 border rounded-full text-xs font-medium transition-all cursor-pointer"
              [ngClass]="{
                'bg-primary-600 text-white border-primary-600': activeFilter() === f.value,
                'bg-white text-gray-600 border-gray-200 hover:border-gray-300': activeFilter() !== f.value
              }"
              (click)="activeFilter.set(f.value)"
            >
              {{ f.label }}
            </button>
          }
        </div>

        <!-- Lista de itens -->
        <div class="flex flex-col gap-3">
          @for (item of filteredItems(); track item.id) {
            <div class="bg-white border rounded-xl p-4 shadow-sm"
              [ngClass]="{
                'border-l-4 border-l-green-500 opacity-80': item.status === ItemStatus.CONFIRMED,
                'border-l-4 border-l-gray-300 opacity-60': item.status === ItemStatus.SKIPPED,
                'border-l-4 border-l-amber-500': item.status === ItemStatus.PENDING
              }">

              <div class="flex items-center gap-4 mb-3 flex-wrap">
                <div class="flex-1 flex flex-col gap-1 min-w-[200px]">
                  <span class="text-sm font-medium text-gray-900">{{ item.original_description }}</span>
                  @if (item.matched_rule) {
                    <span class="text-xs text-blue-600">🔁 Regra: {{ item.matched_rule.keyword }}</span>
                  }
                </div>
                <div class="font-semibold text-sm"
                  [ngClass]="{
                    'text-green-600': item.type === 'income',
                    'text-red-600': item.type === 'expense',
                    'text-gray-900': item.type !== 'income' && item.type !== 'expense'
                  }">
                  {{ item.original_amount | currency:'BRL':'symbol':'1.2-2' }}
                </div>
                <div class="text-xs text-gray-500 whitespace-nowrap">{{ item.original_date | date:'dd/MM/yyyy' }}</div>
              </div>

              @if (item.status === ItemStatus.PENDING) {
                <div class="space-y-3">

                  <!-- Linha principal de selects -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <!-- Tipo -->
                    <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-gray-700">Tipo</label>
                      <select [(ngModel)]="item.type" (change)="markDirty(item)"
                        class="px-2.5 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option [value]="null">Selecione...</option>
                        <option value="income">Receita</option>
                        <option value="expense">Despesa</option>
                        <option value="transfer">Transferência</option>
                      </select>
                    </div>

                    <!-- Categoria -->
                    <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-gray-700">Categoria</label>
                      <select [(ngModel)]="item.category" (change)="onCategoryChange(item)" [compareWith]="compareById"
                        class="px-2.5 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option [value]="null">Selecione...</option>
                        @for (cat of categories(); track cat.id) {
                          <option [ngValue]="cat">{{ cat.name }}</option>
                        }
                      </select>
                    </div>

                    <!-- Subcategoria -->
                    <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-gray-700">Subcategoria</label>
                      <select [(ngModel)]="item.subcategory" (change)="markDirty(item)" [compareWith]="compareById"
                        [disabled]="!item.category || !getSubcategories(item).length"
                        class="px-2.5 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
                        <option [value]="null">Selecione...</option>
                        @for (sub of getSubcategories(item); track sub.id) {
                          <option [ngValue]="sub">{{ sub.name }}</option>
                        }
                      </select>
                    </div>

                    <!-- Conta -->
                    <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-gray-700">Conta</label>
                      <select [(ngModel)]="item.finance_account" (change)="markDirty(item)" [compareWith]="compareById"
                        class="px-2.5 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option [value]="null">Selecione...</option>
                        @for (acc of accounts(); track acc.id) {
                          <option [ngValue]="{ id: acc.id, name: acc.name }">{{ acc.name }}</option>
                        }
                      </select>
                    </div>

                    <!-- Método de pagamento -->
                    <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-gray-700">Pagamento</label>
                      <select [(ngModel)]="item.payment_method" (change)="markDirty(item)"
                        class="px-2.5 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option [value]="null">Selecione...</option>
                        @for (pm of paymentMethods; track pm.value) {
                          <option [value]="pm.value">{{ pm.label }}</option>
                        }
                      </select>
                    </div>
                  </div>

                  <!-- Linha inferior: descrição e ações -->
                  <div class="flex flex-wrap gap-3 items-end">
                    <!-- Descrição customizada -->
                    <div class="flex-1 min-w-[200px] flex flex-col gap-1">
                      <label class="text-xs font-medium text-gray-700">Descrição (opcional)</label>
                      <input
                        type="text"
                        [(ngModel)]="item.description"
                        (input)="markDirty(item)"
                        placeholder="Descrição personalizada..."
                        class="px-2.5 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <!-- Lembrar como regra -->
                    <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-gray-700 invisible">Regra</label>
                      <label class="flex items-center gap-2 text-sm cursor-pointer px-2.5 py-2">
                        <input type="checkbox" [(ngModel)]="item.remember" (change)="markDirty(item)" class="rounded border-gray-300" />
                        <span class="text-gray-700">Criar regra automática</span>
                      </label>
                    </div>

                    @if (item.remember) {
                      <div class="min-w-[180px] flex flex-col gap-1">
                        <label class="text-xs font-medium text-gray-700">Palavra-chave</label>
                        <input
                          type="text"
                          [(ngModel)]="item.keyword"
                          (input)="markDirty(item)"
                          placeholder="Ex: UBER, IFOOD..."
                          class="px-2.5 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    }

                    <!-- Ações do item -->
                    <div class="flex gap-2 ml-auto">
                      <button
                        class="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        [disabled]="saving() === item.id"
                        (click)="saveItem(item)">
                        {{ saving() === item.id ? 'Salvando...' : 'Salvar' }}
                      </button>
                      <button
                        class="px-3 py-2 border-none rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        [disabled]="saving() === item.id"
                        (click)="confirmItem(item)">
                        ✓ Confirmar
                      </button>
                      <button
                        class="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        [disabled]="saving() === item.id"
                        (click)="skipItem(item)">
                        Ignorar
                      </button>
                    </div>
                  </div>

                </div>
              } @else {
                <div class="flex gap-3 text-sm text-gray-600 flex-wrap">
                  @if (item.category) { <span class="text-gray-900">{{ item.category.name }}</span> }
                  @if (item.finance_account) { <span class="text-gray-900">{{ item.finance_account.name }}</span> }
                  @if (item.status === ItemStatus.CONFIRMED) { <span class="text-green-600 font-medium">✓ Confirmado</span> }
                  @if (item.status === ItemStatus.SKIPPED)   { <span class="text-gray-500">— Ignorado</span> }
                </div>
              }

            </div>
          }
        </div>

        <!-- Ações globais -->
        @if (session()!.status !== SessionStatus.COMPLETED && session()!.status !== SessionStatus.CANCELLED) {
          <div class="flex justify-end gap-3 pt-2">
            <button
              class="px-5 py-2 border border-red-600 rounded-lg bg-transparent text-red-600 text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
              (click)="cancelSession()"
              [disabled]="confirming()">
              Cancelar importação
            </button>
            <button
              class="px-6 py-2 bg-primary-600 text-white border-none rounded-lg text-sm font-semibold hover:bg-primary-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              (click)="confirmSession()"
              [disabled]="confirming() || pendingCount() > 0"
              [title]="pendingCount() > 0 ? 'Resolva todos os itens pendentes primeiro' : ''">
              {{ confirming() ? 'Processando...' : 'Confirmar tudo e importar' }}
            </button>
          </div>
        }

      }
    </div>
  `,
  styles: []
})
export class FinanceImportReviewComponent implements OnInit {

  readonly ItemStatus    = ImportItemStatus;
  readonly SessionStatus = ImportSessionStatus;

  session    = signal<ImportSession | null>(null);
  categories = signal<Category[]>([]);
  accounts   = signal<FinanceAccount[]>([]);
  loading    = signal(true);
  saving     = signal<number | null>(null);
  confirming = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  activeFilter = signal<ImportItemStatus | 'all'>('all');

  readonly statusFilters = [
    { value: 'all'                    as const, label: 'Todos'      },
    { value: ImportItemStatus.PENDING  as const, label: 'Pendentes'  },
    { value: ImportItemStatus.CONFIRMED as const, label: 'Confirmados' },
    { value: ImportItemStatus.SKIPPED  as const, label: 'Ignorados'  },
  ];

  readonly paymentMethods = [
    { value: PaymentMethod.PIX,      label: 'Pix'       },
    { value: PaymentMethod.DEBIT,    label: 'Débito'    },
    { value: PaymentMethod.CREDIT,   label: 'Crédito'   },
    { value: PaymentMethod.TED,      label: 'TED'       },
    { value: PaymentMethod.BOLETO,   label: 'Boleto'    },
    { value: PaymentMethod.TRANSFER, label: 'Transferência' },
    { value: PaymentMethod.CASH,     label: 'Dinheiro'  },
    { value: PaymentMethod.OTHER,    label: 'Outro'     },
  ];

  filteredItems = computed(() => {
    const items  = this.session()?.items ?? [];
    const filter = this.activeFilter();
    return filter === 'all' ? items : items.filter(i => i.status === filter);
  });

  pendingCount = computed(() =>
    (this.session()?.items ?? []).filter(i => i.status === ImportItemStatus.PENDING).length
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private financeService: FinanceService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSession(id);
    this.loadCategories();
    this.loadAccounts();
  }

  private loadSession(id: number): void {
    this.financeService.getImportSession(id).subscribe({
      next: session => {
        this.session.set(session);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Erro ao carregar sessão de importação. Tente novamente.');
      },
    });
  }

  private loadCategories(): void {
    this.financeService.getCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: () => this.errorMessage.set('Erro ao carregar categorias.'),
    });
  }

  private loadAccounts(): void {
    this.financeService.getAccounts().subscribe({
      next: accs => this.accounts.set(accs),
      error: () => this.errorMessage.set('Erro ao carregar contas.'),
    });
  }

  markDirty(item: ImportItem): void {
    this.updateItemInSession(item.id, { isDirty: true });
  }

  onCategoryChange(item: ImportItem): void {
    this.updateItemInSession(item.id, {
      subcategory: null,
      isDirty: true
    });
  }

  getSubcategories(item: ImportItem): Subcategory[] {
    if (!item.category) return [];
    return this.subcategoriesCache().get(item.category.id) ?? [];
  }

  compareById(a: any, b: any): boolean {
    return a && b && a.id === b.id;
  }

  private updateItemInSession(itemId: number, updates: Partial<ImportItem>): void {
    const s = this.session();
    if (!s) return;

    this.session.set({
      ...s,
      items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
    });
  }

  subcategoriesCache = computed(() => {
    const map = new Map<number, Subcategory[]>();
    this.categories().forEach(cat => {
      if (cat.subcategories) {
        map.set(cat.id, cat.subcategories);
      }
    });
    return map;
  });

  saveItem(item: ImportItem): void {
    this.saving.set(item.id);
    this.financeService.updateImportItem(item.id, this.buildPayload(item)).subscribe({
      next: res => {
        this.patchItem(res.item);
        this.saving.set(null);
      },
      error: () => this.saving.set(null),
    });
  }

  confirmItem(item: ImportItem): void {
    this.saving.set(item.id);
    this.financeService.updateImportItem(item.id, {
      ...this.buildPayload(item),
      status: ImportItemStatus.CONFIRMED,
    }).subscribe({
      next: res => {
        this.patchItem(res.item);
        this.saving.set(null);
        this.successMessage.set('Item confirmado!');
        setTimeout(() => this.successMessage.set(null), 2000);
      },
      error: (err) => {
        this.saving.set(null);
        this.errorMessage.set(err.error?.message || 'Erro ao confirmar item. Tente novamente.');
      },
    });
  }

  skipItem(item: ImportItem): void {
    this.saving.set(item.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.financeService.updateImportItem(item.id, { status: ImportItemStatus.SKIPPED }).subscribe({
      next: res => {
        this.patchItem(res.item);
        this.saving.set(null);
        this.successMessage.set('Item ignorado.');
        setTimeout(() => this.successMessage.set(null), 2000);
      },
      error: (err) => {
        this.saving.set(null);
        this.errorMessage.set(err.error?.message || 'Erro ao ignorar item. Tente novamente.');
      },
    });
  }

  confirmSession(): void {
    const id = this.session()?.id;
    if (!id) return;
    this.confirming.set(true);
    this.errorMessage.set(null);

    this.financeService.confirmImportSession(id).subscribe({
      next: res => {
        this.session.set(res.session);
        this.confirming.set(false);
        this.successMessage.set('Importação confirmada com sucesso!');
        setTimeout(() => this.router.navigate(['/app/finance/import']), 1500);
      },
      error: (err) => {
        this.confirming.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao confirmar importação. Tente novamente.');
      },
    });
  }

  cancelSession(): void {
    const id = this.session()?.id;
    if (!id) return;

    if (!confirm('Tem certeza que deseja cancelar esta importação? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.financeService.cancelImportSession(id).subscribe({
      next: () => {
        this.successMessage.set('Importação cancelada.');
        setTimeout(() => this.router.navigate(['/app/finance/import']), 1000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erro ao cancelar importação.');
      },
    });
  }

  private buildPayload(item: ImportItem) {
    return {
      type:               item.type,
      description:        item.description,
      payment_method:     item.payment_method,
      category_id:        item.category?.id ?? null,
      subcategory_id:     item.subcategory?.id ?? null,
      finance_account_id: item.finance_account?.id ?? null,
      remember:           item.remember ?? false,
      keyword:            item.keyword ?? undefined,
    };
  }

  private patchItem(updated: ImportItem): void {
    const s = this.session();
    if (!s) return;
    this.session.set({
      ...s,
      items: s.items.map(i => i.id === updated.id ? { ...updated } : i),
      confirmed_rows: s.items.filter(i =>
        i.id === updated.id
          ? updated.status === ImportItemStatus.CONFIRMED
          : i.status === ImportItemStatus.CONFIRMED
      ).length,
      skipped_rows: s.items.filter(i =>
        i.id === updated.id
          ? updated.status === ImportItemStatus.SKIPPED
          : i.status === ImportItemStatus.SKIPPED
      ).length,
    });
  }

  statusLabel(status: ImportSessionStatus): string {
    const map: Record<ImportSessionStatus, string> = {
      [ImportSessionStatus.PENDING]:   'Pendente',
      [ImportSessionStatus.REVIEWING]: 'Revisando',
      [ImportSessionStatus.COMPLETED]: 'Concluído',
      [ImportSessionStatus.CANCELLED]: 'Cancelado',
    };
    return map[status] ?? status;
  }
}