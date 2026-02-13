import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth-service';
import { MenuService } from '../../../core/services/menu/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-pri-header',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterLink
  ],
  templateUrl: './pri-header.html',
  styleUrl: './pri-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriHeader {
  public menuService = inject(MenuService);
  public authService = inject(AuthService);

  onLogout(): void {
    if (confirm('Deseja realmente sair do sistema?')) {
      this.authService.logout();
    }
  }
}
