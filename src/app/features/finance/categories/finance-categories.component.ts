// src/app/features/finance/categories/finance-categories.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../core/services/finance/finance';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Category, Subcategory, TransactionType } from '../../../core/models/finance.model';
import { CapabilityService } from '../../../core/services/capability/capability.service';

@Component({
  selector: 'app-finance-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-1">Categorias 🗂️</h1>
          <p class="text-gray-600">Gerencie suas categorias e subcategorias</p>
        </div>
        @if (canCreate) {
          <button (click)="openCatModal()"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            + Nova Categoria
          </button>
        }
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        @for (tab of tabs; track tab.value) {
          <button (click)="activeTab.set(tab.value)"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            [class.bg-indigo-600]="activeTab() === tab.value"
            [class.text-white]="activeTab() === tab.value"
            [class.bg-white]="activeTab() !== tab.value"
            [class.text-gray-600]="activeTab() !== tab.value"
            [class.border]="activeTab() !== tab.value"
            [class.border-gray-200]="activeTab() !== tab.value">
            {{ tab.label }}
            <span class="ml-2 px-1.5 py-0.5 rounded-full text-xs"
              [class.bg-indigo-500]="activeTab() === tab.value"
              [class.text-white]="activeTab() === tab.value"
              [class.bg-gray-100]="activeTab() !== tab.value"
              [class.text-gray-600]="activeTab() !== tab.value">
              {{ countByTab(tab.value) }}
            </span>
          </button>
        }
      </div>

      <!-- Lista -->
      <div class="space-y-3">
        @if (loading()) {
          <p class="py-12 text-center text-gray-400 text-sm">Carregando...</p>
        } @else if (filtered().length === 0) {
          <div class="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            Nenhuma categoria encontrada.
          </div>
        } @else {
          @for (cat of filtered(); track cat.id) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

              <!-- Linha da Categoria -->
              <div class="flex items-center gap-4 p-4">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                  [style.background-color]="cat.color">
                  {{ cat.name[0].toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-gray-900">{{ cat.name }}</p>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      [class.bg-green-100]="cat.type === 'income'"
                      [class.text-green-700]="cat.type === 'income'"
                      [class.bg-red-100]="cat.type === 'expense'"
                      [class.text-red-700]="cat.type === 'expense'">
                      {{ cat.type === 'income' ? '↑ Receita' : '↓ Despesa' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ cat.subcategories?.length ?? 0 }} subcategoria{{ (cat.subcategories?.length ?? 0) !== 1 ? 's' : '' }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  @if (canCreate) {
                    <button (click)="openSubModal(cat)"
                      class="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      + Sub
                    </button>
                  }
                  @if (canDelete) {
                    <button (click)="confirmDelete('category', cat.id, cat.name)"
                      class="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                      🗑
                    </button>
                  }
                  <button (click)="toggleExpand(cat.id)"
                    class="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50">
                    <svg class="w-4 h-4 transition-transform"
                      [class.rotate-180]="expandedId() === cat.id"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Subcategorias -->
              @if (expandedId() === cat.id) {
                <div class="border-t border-gray-50 bg-gray-50/50">
                  @if (!cat.subcategories?.length) {
                    <p class="px-6 py-4 text-xs text-gray-400 italic">
                      Nenhuma subcategoria. Clique em "+ Sub" para adicionar.
                    </p>
                  } @else {
                    <div class="divide-y divide-gray-100">
                      @for (sub of cat.subcategories; track sub.id) {
                        <div class="flex items-center gap-3 px-6 py-3">
                          <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="sub.color"></span>
                          <p class="text-sm text-gray-700 flex-1">{{ sub.name }}</p>
                          @if (canDelete) {
                            <button (click)="confirmDelete('subcategory', sub.id, sub.name)"
                              class="text-gray-300 hover:text-red-500 transition-colors text-sm">✕</button>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }

            </div>
          }
        }
      </div>

    </main>

  <!-- Modal: Nova Categoria -->
  @if (showCatModal()) {
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" (click)="closeCatModal()">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">Nova Categoria</h3>
          <button (click)="closeCatModal()" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <div class="flex rounded-lg border border-gray-200 overflow-hidden">
              <button (click)="catForm.type = 'expense'"
                class="flex-1 py-2 text-sm font-medium transition-colors"
                [class.bg-red-500]="catForm.type === 'expense'"
                [class.text-white]="catForm.type === 'expense'"
                [class.text-gray-600]="catForm.type !== 'expense'">
                ↓ Despesa
              </button>
              <button (click)="catForm.type = 'income'"
                class="flex-1 py-2 text-sm font-medium transition-colors"
                [class.bg-green-500]="catForm.type === 'income'"
                [class.text-white]="catForm.type === 'income'"
                [class.text-gray-600]="catForm.type !== 'income'">
                ↑ Receita
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" [(ngModel)]="catForm.name" placeholder="Ex: Alimentação"
              class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cor</label>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg border border-gray-200 shrink-0" [style.background-color]="catForm.color"></div>
              <div class="flex flex-wrap gap-2">
                @for (color of colors; track color) {
                  <button type="button" (click)="catForm.color = color"
                    class="w-6 h-6 rounded-full border-2 transition-transform"
                    [class.scale-125]="catForm.color === color"
                    [class.border-gray-800]="catForm.color === color"
                    [class.border-transparent]="catForm.color !== color"
                    [style.background-color]="color">
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-3 p-6 pt-0">
          <button (click)="closeCatModal()"
            class="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button (click)="saveCategory()"
            class="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            Salvar
          </button>
        </div>
      </div>
    </div>
  }

  <!-- Modal: Nova Subcategoria -->
  @if (showSubModal()) {
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" (click)="closeSubModal()">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Nova Subcategoria</h3>
            <p class="text-xs text-gray-400 mt-0.5">em: {{ selectedCategory()?.name }}</p>
          </div>
          <button (click)="closeSubModal()" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" [(ngModel)]="subForm.name" placeholder="Ex: Restaurante"
              class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cor</label>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg border border-gray-200 shrink-0" [style.background-color]="subForm.color"></div>
              <div class="flex flex-wrap gap-2">
                @for (color of colors; track color) {
                  <button type="button" (click)="subForm.color = color"
                    class="w-6 h-6 rounded-full border-2 transition-transform"
                    [class.scale-125]="subForm.color === color"
                    [class.border-gray-800]="subForm.color === color"
                    [class.border-transparent]="subForm.color !== color"
                    [style.background-color]="color">
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-3 p-6 pt-0">
          <button (click)="closeSubModal()"
            class="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button (click)="saveSubcategory()"
            class="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            Salvar
          </button>
        </div>
      </div>
    </div>
  }

  <!-- Modal: Confirmar Delete -->
  @if (deleteTarget()) {
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div class="text-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🗑</div>
          <h3 class="text-lg font-semibold text-gray-900">Confirmar exclusão</h3>
          <p class="text-sm text-gray-500 mt-1">
            Deseja remover <strong>"{{ deleteTarget()!.name }}"</strong>?
          </p>
          @if (deleteTarget()!.type === 'category') {
            <p class="text-xs text-red-500 mt-1">As subcategorias também serão removidas.</p>
          }
        </div>
        <div class="flex gap-3">
          <button (click)="deleteTarget.set(null)"
            class="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button (click)="executeDelete()"
            class="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
            Remover
          </button>
        </div>
      </div>
    </div>
  }
  `,
})
export class FinanceCategoriesComponent implements OnInit {
  private financeService = inject(FinanceService);
  private capabilityService = inject(CapabilityService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  activeTab = signal<'all' | 'income' | 'expense'>('all');
  expandedId = signal<number | null>(null);
  showCatModal = signal(false);
  showSubModal = signal(false);
  selectedCategory = signal<Category | null>(null);
  deleteTarget = signal<{ type: 'category' | 'subcategory'; id: number; name: string } | null>(null);

  canCreate = this.capabilityService.hasCapability('finance.create');
  canDelete  = this.capabilityService.hasCapability('finance.delete');

  colors = ['#ef4444','#f97316','#f59e0b','#22c55e','#10b981','#06b6d4','#6366f1','#8b5cf6','#ec4899','#64748b'];

  tabs: { value: 'all' | 'income' | 'expense'; label: string }[] = [
    { value: 'all',     label: 'Todas'    },
    { value: 'income',  label: 'Receitas' },
    { value: 'expense', label: 'Despesas' },
  ];

  catForm: { name: string; type: string; color: string } = {
    name: '', type: 'expense', color: '#ef4444',
  };

  subForm: { name: string; color: string; category_id: number | null } = {
    name: '', color: '#6366f1', category_id: null,
  };

  filtered = computed(() => {
    const tab = this.activeTab();
    return tab === 'all'
      ? this.categories()
      : this.categories().filter(c => c.type === tab);
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.financeService.getCategories().subscribe({
      next: cats => { this.categories.set(cats); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  toggleExpand(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  // --- Categoria ---
  openCatModal(): void { this.showCatModal.set(true); }
  closeCatModal(): void {
    this.showCatModal.set(false);
    this.catForm = { name: '', type: 'expense', color: '#ef4444' };
  }

  saveCategory(): void {
    if (!this.catForm.name.trim()) return;
    this.financeService.createCategory(this.catForm as Partial<Category>).subscribe(() => {
      this.closeCatModal();
      this.loadCategories();
    });
  }

  // --- Subcategoria ---
  openSubModal(cat: Category): void {
    this.selectedCategory.set(cat);
    this.subForm = { name: '', color: '#6366f1', category_id: cat.id };
    this.showSubModal.set(true);
    this.expandedId.set(cat.id);
  }

  closeSubModal(): void {
    this.showSubModal.set(false);
    this.subForm = { name: '', color: '#6366f1', category_id: null };
  }

  saveSubcategory(): void {
    if (!this.subForm.name.trim() || !this.subForm.category_id) return;
    this.financeService.createSubcategory(this.subForm as Partial<Subcategory>).subscribe(() => {
      this.closeSubModal();
      this.loadCategories();
    });
  }

  // --- Delete ---
  confirmDelete(type: 'category' | 'subcategory', id: number, name: string): void {
    this.deleteTarget.set({ type, id, name });
  }

  executeDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    const obs = target.type === 'category'
      ? this.financeService.deleteCategory(target.id)
      : this.financeService.deleteSubcategory(target.id);

    obs.subscribe(() => {
      this.deleteTarget.set(null);
      this.loadCategories();
    });
  }

  countByTab(tab: 'all' | 'income' | 'expense'): number {
    if (tab === 'all') return this.categories().length;
    return this.categories().filter(c => c.type === tab).length;
  }
}