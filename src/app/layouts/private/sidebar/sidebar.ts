import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { MenuItem, MenuService } from '../../../core/services/menu/menu';
import { CommonModule } from '@angular/common'; // Importante para diretivas básicas se não estiver no standalone total

@Component({
  selector: 'app-sidebar',
  standalone: true, // Assumindo standalone component
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  public router = inject(Router);
  public menuService = inject(MenuService);

  /**
   * Clique no Item Pai
   */
  onMenuItemClick(item: MenuItem): void {
    if (item.children) {
      // Se tem filhos, apenas expande/recolhe
      this.menuService.toggleSubmenu(item);
    } else {
      // Se é um link direto (sem filhos), navega e fecha a sidebar
      this.closeSidebar();
    }
  }

  /**
   * Clique no Item do Submenu
   */
  onSubmenuItemClick(): void {
    // Sempre fecha a sidebar ao navegar para um subitem
    this.closeSidebar();

    // 2. AGORA O PONTO CHAVE: Limpamos o estado 'expanded' de todos os itens.
    // Isso impede que o submenu flutuante apareça assim que a barra encolhe.
    this.menuService.menuItems().forEach(item => {
    item.expanded = false;
  });

  // 3. Notificamos o Angular da mudança (caso esteja usando Signals)
  this.menuService.menuItems.update(items => [...items]);
  
  }

  /**
   * Helper para fechar a sidebar (independente se é mobile ou desktop)
   * No desktop: volta para largura 80px (Mini)
   * No mobile: esconde a barra
   */
   closeSidebar(): void {
    this.menuService.closeSidebar();
  }

  /**
   * Helper para verificar se está no modo "Mini Sidebar"
   * (Desktop E Fechado)
   */
   isMiniMode(): boolean {
    return !this.menuService.sidebarOpen() && !this.menuService.isMobile();
  }
}