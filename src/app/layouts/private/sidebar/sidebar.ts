import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { MenuItem, MenuService } from '../../../core/services/menu/menu';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  public router = inject(Router);
  public menuService = inject(MenuService);
  

  onMenuItemClick(item: MenuItem): void {
    if (item.children) {
      this.menuService.toggleSubmenu(item);
    } else if (this.menuService.isMobile()) {
      this.menuService.closeSidebar();
    }
  }

  onMouseEnter(item: MenuItem): void {
    if (item.children && !this.menuService.isMobile()) {
      item.expanded = true;
    }
  }

  onMouseLeave(item: MenuItem): void {
    if (item.children && !this.menuService.isMobile()) {
      item.expanded = false;
    }
  }
}
