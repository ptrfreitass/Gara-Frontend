import { Injectable, signal } from '@angular/core';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  expanded?: boolean;
  children?: MenuItem[];
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  // Estado da sidebar
  sidebarOpen = signal(true);
  // Detecta se é dispositivo móvel
  isMobile = signal(false);

  // Define os itens do menu
  public menuItems = signal<MenuItem[]>([
    
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },

    {
      label: 'Finanças',
      icon: 'attach_money',
      children: [
        {
          label: 'Finanças',
          icon: 'account_balance_wallet',
          route: '/financas/home'
        },
        {
          label: 'Novo Registro',
          icon: 'add_circle',
          route: '/financas/novo'
        },
        {
          label: 'Previsão',
          icon: 'trending_up',
          route: '/financas/previsao'
        },
        {
          label: 'Categorias',
          icon: 'label',
          route: '/financas/categorias'
        },
        {
          label: 'Histórico',
          icon: 'history',
          route: '/financas/historico'
        }
      ]
    },

    {
      label: 'Perfil',
      icon: 'person',
      route: '/profile'
    },

    {
      label: 'Configurações',
      icon: 'settings',
      route: '/settings'
    }

    /*
    {
      label: 'Usuários',
      icon: 'people',
      children: [
        { label: 'Lista', icon: 'lsit', route: '/users' },
        { label: 'Perfil', icon: 'person', route: '/profile' }
      ]
    },
    */
  ]);

  resetMenuState() {
    // Agora o .update() vai funcionar
    this.menuItems.update((items: MenuItem[]) => {
      items.forEach(item => item.expanded = false);
      return [...items]; // Retorna um novo array para disparar a atualização
    });
  }

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize() {
    const mobile = window.innerWidth < 1024;
    this.isMobile.set(mobile);
    if (mobile) this.sidebarOpen.set(false);
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  toggleSubmenu(item: MenuItem) {
    item.expanded = !item.expanded;
  }
}
