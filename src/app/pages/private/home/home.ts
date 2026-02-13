import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth-service';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-home',
  imports: [
    MatIconModule,
    MatListModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  authService = inject(AuthService);

}
