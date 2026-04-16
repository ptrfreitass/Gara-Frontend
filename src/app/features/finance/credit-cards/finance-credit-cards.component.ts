// src/app/features/finance/credit-cards/finance-credit-cards.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../core/services/finance/finance';
import { CapabilityService } from '../../../core/services/capability/capability.service';
import { CreditCard, Bank } from '../../../core/models/finance.model';

@Component({
  selector: 'app-finance-credit-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 mb-1">Cartões de Crédito</h1>
        <p class="text-gray-500 text-sm">Gerencie seus cartões e faturas</p>
      </div>
      @if (canCreate) {
        <button (click)="openModal()" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          + Novo Cartão
        </button>
      }
    </div>

    <!-- Resumo geral -->
    @if (cards().length > 0) {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs text-gray-500 font-medium mb-1">Limite Total</p>
          <p class="text-2xl font-bold text-gray-900">{{ totalLimit() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs text-gray-500 font-medium mb-1">Crédito Disponível</p>
          <p class="text-2xl font-bold text-green-600">{{ totalAvailable() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs text-gray-500 font-medium mb-1">Fatura Próximo Mês</p>
          <p class="text-2xl font-bold text-red-500">{{ totalNextInvoice() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</p>
        </div>
      </div>
    }

    <!-- Lista de cartões -->
    @if (loading()) {
      <p class="py-12 text-center text-gray-400 text-sm">Carregando...</p>
    } @else if (cards().length === 0) {
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
        <p class="text-4xl mb-3">💳</p>
        <p class="text-gray-500 text-sm font-medium">Nenhum cartão cadastrado</p>
        <p class="text-gray-400 text-xs mt-1">Adicione seu primeiro cartão de crédito</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (card of cards(); track card.id) {
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            <!-- Topo colorido do cartão -->
            <div class="h-2 w-full" [style.background-color]="card.color ?? '#6366f1'"></div>

            <div class="p-5">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-base font-semibold text-gray-900">{{ card.name }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    @if (card.bank) {
                      <span class="text-xs text-gray-400">{{ card.bank.name }}</span>
                    }
                    @if (card.last_four_digits) {
                      <span class="text-gray-300">·</span>
                      <span class="text-xs text-gray-400">•••• {{ card.last_four_digits }}</span>
                    }
                  </div>
                </div>
                @if (canDelete) {
                  <button (click)="deactivateCard(card.id)"
                    class="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">✕</button>
                }
              </div>

              <!-- Barra de uso do limite -->
              <div class="mb-4">
                <div class="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Usado: {{ card.used_credit | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  <span>Limite: {{ card.credit_limit | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all"
                       [style.width.%]="getUsagePercent(card)"
                       [style.background-color]="card.color ?? '#6366f1'"
                       [class.bg-red-500]="getUsagePercent(card) > 80">
                  </div>
                </div>
                <p class="text-xs text-gray-400 mt-1">
                  Disponível: <span class="font-semibold text-green-600">{{ card.available_credit | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                </p>
              </div>

              <!-- Info fatura + vencimento -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-50">
                <div class="text-xs text-gray-500">
                  <span>Fecha dia <strong>{{ card.closing_day }}</strong></span>
                  <span class="mx-2 text-gray-300">·</span>
                  <span>Vence dia <strong>{{ card.due_day }}</strong></span>
                </div>
                @if (card.current_invoice) {
                  <span class="text-xs font-semibold px-2 py-1 rounded-full"
                        [class.bg-yellow-100]="card.current_invoice.status === 'open'"
                        [class.text-yellow-700]="card.current_invoice.status === 'open'"
                        [class.bg-red-100]="card.current_invoice.status === 'overdue'"
                        [class.text-red-700]="card.current_invoice.status === 'overdue'"
                        [class.bg-green-100]="card.current_invoice.status === 'paid'"
                        [class.text-green-700]="card.current_invoice.status === 'paid'">
                    {{ card.current_invoice.total_amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }

    <!-- Modal: Novo Cartão -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" (click)="closeModal()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Novo Cartão</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do cartão</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Ex: Nubank Roxinho"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Banco <span class="text-gray-400 font-normal">(opcional)</span></label>
              <select [(ngModel)]="form.bank_id"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">Selecione o banco</option>
                @for (bank of banks(); track bank.id) {
                  <option [value]="bank.id">{{ bank.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Limite (R$)</label>
              <input type="number" [(ngModel)]="form.credit_limit" min="0" step="0.01" placeholder="0,00"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dia de fechamento</label>
                <input type="number" [(ngModel)]="form.closing_day" min="1" max="31" placeholder="Ex: 20"
                  class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dia de vencimento</label>
                <input type="number" [(ngModel)]="form.due_day" min="1" max="31" placeholder="Ex: 27"
                  class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Últimos 4 dígitos <span class="text-gray-400 font-normal">(opcional)</span></label>
              <input type="text" [(ngModel)]="form.last_four_digits" maxlength="4" placeholder="0000"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input type="color" [(ngModel)]="form.color"
                class="h-10 w-full rounded-lg border border-gray-200 cursor-pointer" />
            </div>
          </div>

          <div class="flex gap-3 p-6 pt-0">
            <button (click)="closeModal()" class="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button (click)="submitCard()" [disabled]="submitting()"
              class="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
              {{ submitting() ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class FinanceCreditCardsComponent implements OnInit {
  private financeService = inject(FinanceService);
  private capabilityService = inject(CapabilityService);

  cards     = signal<CreditCard[]>([]);
  banks     = signal<Bank[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  submitting = signal(false);

  canCreate = this.capabilityService.hasCapability('finance.create');
  canDelete = this.capabilityService.hasCapability('finance.delete');

  form = this.emptyForm();

  ngOnInit(): void {
    this.financeService.getBanks().subscribe(b => this.banks.set(b));
    this.loadCards();
  }

  loadCards(): void {
    this.loading.set(true);
    this.financeService.getCreditCards().subscribe(c => {
      this.cards.set(c);
      this.loading.set(false);
    });
  }

  totalLimit()       { return this.cards().reduce((s, c) => s + c.credit_limit, 0); }
  totalAvailable()   { return this.cards().reduce((s, c) => s + c.available_credit, 0); }
  totalNextInvoice() { return this.cards().reduce((s, c) => s + (c.current_invoice?.total_amount ?? 0), 0); }
  getUsagePercent(card: CreditCard): number {
    if (!card.credit_limit) return 0;
    return Math.min(100, (card.used_credit / card.credit_limit) * 100);
  }

  openModal(): void  { this.showModal.set(true); }
  closeModal(): void { this.showModal.set(false); this.form = this.emptyForm(); }

  submitCard(): void {
    if (!this.form.name || !this.form.credit_limit || !this.form.closing_day || !this.form.due_day) return;
    this.submitting.set(true);
    this.financeService.createCreditCard({
      ...this.form,
      bank_id: this.form.bank_id ? Number(this.form.bank_id) : undefined,
      credit_limit: Number(this.form.credit_limit),
      closing_day:  Number(this.form.closing_day),
      due_day:      Number(this.form.due_day),
    } as any).subscribe({
      next: () => { this.closeModal(); this.loadCards(); this.submitting.set(false); },
      error: () => this.submitting.set(false),
    });
  }

  deactivateCard(id: number): void {
    if (!confirm('Desativar este cartão?')) return;
    this.financeService.deleteCreditCard(id).subscribe(() => this.loadCards());
  }

  private emptyForm() {
    return {
      name: '', bank_id: '', credit_limit: '',
      closing_day: '', due_day: '',
      last_four_digits: '', color: '#6366f1',
    };
  }
}