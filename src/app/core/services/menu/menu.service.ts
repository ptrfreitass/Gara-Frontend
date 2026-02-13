import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MenuItem } from './menu'; // Importe sua interface

@Injectable({ providedIn: 'root' })
export class MenuService {
  private breakpointObserver = inject(BreakpointObserver);

  // --- MOCK DATA (Em prod viria de uma API) ---
  public menuItems = signal<MenuItem[]>([
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { 
      label: 'Relatórios Financeiros', // Texto longo para teste
      icon: 'attach_money', 
      children: [
        { label: 'Mensal', icon: 'calendar_today', route: '/relatorios/mensal' },
        { label: 'Anual', icon: 'date_range', route: '/relatorios/anual' }
      ]
    },
    { label: 'Configurações', icon: 'settings', route: '/settings' }
  ]);

  // --- STATE SIGNALS ---
  // Detecta mobile usando CDK (mais robusto que window.resize)
  private isMobileSignal = toSignal(
    this.breakpointObserver.observe('(max-width: 768px)')
      .pipe(map(result => result.matches)), 
    { initialValue: false }
  );
  
  // Estado interno da sidebar
  private sidebarOpenSignal = signal<boolean>(true);

  // Computed: expõe valores apenas leitura
  public isMobile = computed(() => this.isMobileSignal());
  public sidebarOpen = computed(() => this.sidebarOpenSignal());

  constructor() {
    // RECUPERAR ESTADO DO LOCALSTORAGE
    const savedState = localStorage.getItem('sidebar-state');
    if (savedState !== null) {
      this.sidebarOpenSignal.set(JSON.parse(savedState));
    }

    // EFEITO: Salva no LocalStorage sempre que mudar
    effect(() => {
      localStorage.setItem('sidebar-state', JSON.stringify(this.sidebarOpenSignal()));
    });

    // EFEITO: Se virar mobile, fecha a sidebar automaticamente para não quebrar layout
    effect(() => {
      if (this.isMobileSignal()) {
        this.sidebarOpenSignal.set(false);
      }
    }, { allowSignalWrites: true });
  }

  toggleSidebar() {
    this.sidebarOpenSignal.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpenSignal.set(false);
  }

  openSidebar() {
    this.sidebarOpenSignal.set(true);
  }

  toggleSubmenu(item: MenuItem) {
    if (!item.children) return;
    
    // Lógica Enterprise: Accordion único? 
    // Se quiser fechar os outros ao abrir um, descomente abaixo:
    // this.menuItems().forEach(m => { if (m !== item) m.expanded = false; });

    item.expanded = !item.expanded;
    // Força atualização do signal para re-renderizar (caso item seja mutável)
    this.menuItems.update(items => [...items]); 
  }
}