import { Component, inject } from '@angular/core';
import { PriHeader } from './pri-header/pri-header';
import { RouterOutlet } from '@angular/router';
import { PriFooter } from './pri-footer/pri-footer';
import { Sidebar } from './sidebar/sidebar';
import { ThemeToggleComponent } from '../../shared/theme/theme';
import { MenuService } from '../../core/services/menu/menu';

@Component({
  selector: 'app-private',
  imports: [
    Sidebar,
    PriHeader,
    RouterOutlet,
    PriFooter,
  ],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.scss',
})
export class Private {
  public menuService = inject(MenuService);

}
