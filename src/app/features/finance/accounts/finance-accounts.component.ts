// src/app/features/finance/accounts/finance-accounts.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../core/services/finance/finance';
import { CapabilityService } from '../../../core/services/capability/capability.service';
import { FinanceAccount, Bank, AccountType } from '../../../core/models/finance.model';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash:           'Dinheiro em Espécie',
  checking:       'Conta Corrente',
  savings:        'Poupança',
  investment:     'Investimento',
  digital_wallet: 'Carteira Digital',
  other:          'Outro',
};

const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  cash:           '💵',
  checking:       '🏦',
  savings:        '🐷',
  investment:     '📈',
  digital_wallet: '👛',
  other:          '💼',
};

@Component({
  selector: 'app-finance-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 mb-1">Contas</h1>
        <p class="text-gray-500 text-sm">Gerencie suas contas e carteiras</p>
      </div>
      @if (canCreate) {
        <button (click)="openModal()" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          + Nova Conta
        </button>
      }
    </div>

    <!-- Resumo -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      @for (type of accountTypes; track type) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div class="text-2xl mb-2">{{ typeIcons[type] }}</div>
          <p class="text-xs text-gray-500 font-medium">{{ typeLabels[type] }}</p>
          <p class="text-lg font-bold text-gray-900 mt-1">
            {{ getTotalByType(type) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
          </p>
        </div>
      }
    </div>

    <!-- Lista de contas -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      @if (loading()) {
        <p class="py-12 text-center text-gray-400 text-sm">Carregando...</p>
      } @else if (accounts().length === 0) {
        <div class="py-16 text-center">
          <p class="text-4xl mb-3">🏦</p>
          <p class="text-gray-500 text-sm font-medium">Nenhuma conta cadastrada</p>
          <p class="text-gray-400 text-xs mt-1">Adicione sua primeira conta para começar</p>
        </div>
      } @else {
        <div class="divide-y divide-gray-50">
          @for (account of accounts(); track account.id) {
            <div class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                     [style.background-color]="account.color ? account.color + '20' : '#f3f4f6'">
                  {{ typeIcons[account.type] }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ account.name }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs text-gray-400">{{ typeLabels[account.type] }}</span>
                    @if (account.bank) {
                      <span class="text-gray-300">·</span>
                      <span class="text-xs text-gray-400">{{ account.bank.name }}</span>
                    }
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <p class="text-sm font-bold"
                     [class.text-gray-900]="account.current_balance >= 0"
                     [class.text-red-500]="account.current_balance < 0">
                    {{ account.current_balance | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </p>
                  <p class="text-xs text-gray-400">saldo atual</p>
                </div>
                @if (canDelete) {
                  <button (click)="deactivateAccount(account.id)"
                    class="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">✕</button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal: Nova Conta -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" (click)="closeModal()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Nova Conta</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome da conta</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Ex: Conta Nubank"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select [(ngModel)]="form.type"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                @for (type of accountTypes; track type) {
                  <option [value]="type">{{ typeIcons[type] }} {{ typeLabels[type] }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Banco <span class="text-gray-400 font-normal">(opcional)</span></label>
              <select [(ngModel)]="form.bank_id"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">Sem banco vinculado</option>
                @for (bank of banks(); track bank.id) {
                  <option [value]="bank.id">{{ bank.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Saldo inicial (R$)</label>
              <input type="number" [(ngModel)]="form.initial_balance" min="0" step="0.01" placeholder="0,00"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cor <span class="text-gray-400 font-normal">(opcional)</span></label>
              <input type="color" [(ngModel)]="form.color"
                class="h-10 w-full rounded-lg border border-gray-200 cursor-pointer" />
            </div>
          </div>

          <div class="flex gap-3 p-6 pt-0">
            <button (click)="closeModal()" class="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button (click)="submitAccount()" [disabled]="submitting()"
              class="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
              {{ submitting() ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class FinanceAccountsComponent implements OnInit {
  private financeService = inject(FinanceService);
  private capabilityService = inject(CapabilityService);

  accounts  = signal<FinanceAccount[]>([]);
  banks     = signal<Bank[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  submitting = signal(false);

  canCreate = this.capabilityService.hasCapability('finance.create');
  canDelete = this.capabilityService.hasCapability('finance.delete');

  accountTypes = Object.values(AccountType);
  typeLabels   = ACCOUNT_TYPE_LABELS;
  typeIcons    = ACCOUNT_TYPE_ICONS;

  form = this.emptyForm();

  ngOnInit(): void {
    this.financeService.getBanks().subscribe(b => this.banks.set(b));
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading.set(true);
    this.financeService.getAccounts().subscribe(a => {
      this.accounts.set(a);
      this.loading.set(false);
    });
  }

  getTotalByType(type: AccountType): number {
    return this.accounts()
      .filter(a => a.type === type)
      .reduce((sum, a) => sum + a.current_balance, 0);
  }

  openModal(): void  { this.showModal.set(true); }
  closeModal(): void { this.showModal.set(false); this.form = this.emptyForm(); }

  submitAccount(): void {
    if (!this.form.name || !this.form.type) return;
    this.submitting.set(true);
    this.financeService.createAccount({
      ...this.form,
      bank_id: this.form.bank_id ? Number(this.form.bank_id) : undefined,
      initial_balance: Number(this.form.initial_balance),
    } as any).subscribe({
      next: () => { this.closeModal(); this.loadAccounts(); this.submitting.set(false); },
      error: () => this.submitting.set(false),
    });
  }

  deactivateAccount(id: number): void {
    if (!confirm('Desativar esta conta?')) return;
    this.financeService.deleteAccount(id).subscribe(() => this.loadAccounts());
  }

  private emptyForm() {
    return { name: '', type: AccountType.CHECKING, bank_id: '', initial_balance: '', color: '#6366f1' };
  }
}