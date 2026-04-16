// src/app/shared/config/menu.config.ts

export interface MenuItemConfig {
  key: string;
  label: string;
  icon: string;
  path: string;
  capability?: string;
  requiredPlans?: Array<'free' | 'plus' | 'premium'>;
  children?: MenuItemConfig[];
}

export const MENU_CONFIG: MenuItemConfig[] = [
  {
    key: 'dash',
    label: 'Dashboard',
    icon: '📊',
    path: '/app/dash'
  },
  {
    key: 'finance',
    label: 'Finanças',
    icon: '💰',
    path: '/app/finance',
    capability: 'finance.view',
    children: [
      {
        key: 'finance-overview',
        label: 'Visão Geral',
        icon: '📈',
        path: '/app/finance/overview',
        capability: 'finance.view'
      },
      {
        key: 'finance-accounts',
        label: 'Contas',
        icon: '🏦',
        path: '/app/finance/accounts',
        capability: 'finance.view'
      },
      {
        key: 'finance-credit-cards',
        label: 'Cartões de Crédito',
        icon: '💳',
        path: '/app/finance/credit-cards',
        capability: 'finance.view'
      },
      {
        key: 'finance-categories',
        label: 'Categorias',
        icon: '🏷️',
        path: '/app/finance/categories',
        capability: 'finance.view'
      },
      {
        key: 'finance-import',
        label: 'Importar Extrato',
        icon: '📥',
        path: '/app/finance/import',
        capability: 'finance.view'
      }
    ]
  },
  {
    key: 'settings',
    label: 'Configurações',
    icon: '⚙️',
    path: '/app/settings'
  }
];