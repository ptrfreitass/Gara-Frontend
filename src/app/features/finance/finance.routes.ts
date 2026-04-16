// src/app/features/finance/finance.routes.ts
import { Routes } from '@angular/router';
import { FinanceShellComponent } from './finance-shell.component';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    component: FinanceShellComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        data: { breadcrumb: 'Visão Geral' },
        loadComponent: () => import('./overview/finance-overview').then(m => m.FinanceOverviewComponent)
      },
      {
        path: 'accounts',
        data: { breadcrumb: 'Contas' },
        loadComponent: () => import('./accounts/finance-accounts.component').then(m => m.FinanceAccountsComponent)
      },
      {
        path: 'credit-cards',
        data: { breadcrumb: 'Cartões de Crédito' },
        loadComponent: () => import('./credit-cards/finance-credit-cards.component').then(m => m.FinanceCreditCardsComponent)
      },
      {
        path: 'categories',
        data: { breadcrumb: 'Categorias' },
        loadComponent: () => import('./categories/finance-categories.component').then(m => m.FinanceCategoriesComponent)
      },
      {
        path: 'import',
        data: { breadcrumb: 'Importar Extrato' },
        loadComponent: () => import('./import/finance-import.component').then(m => m.FinanceImportComponent)
      },
      {
        path: 'import/:id',
        data: { breadcrumb: 'Revisar Importação' },
        loadComponent: () => import('./import/finance-import-review.component').then(m => m.FinanceImportReviewComponent)
      },
    ],
  },
];