import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from '../../../core/services/auth/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-recovery',
  imports: [  
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './recovery.html',
  styleUrl: './recovery.scss',
})
export class Recovery implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Estados
  isLinkValid = false;
  isLoading = false;
  errorMessage = '';

  // Dados Passo 1
  emailRequest = '';

  // Dados Passo 2 (Vindos da URL)
  emailFromUrl = '';
  signature = '';
  expires = '';

  // Formulário Passo 2
  password = '';
  passwordConfirmation = '';

  ngOnInit() {
    // Verifica se existem parâmetros de assinatura na URL
    this.route.queryParams.subscribe(params => {
      if (params['signature']) {
        this.isLinkValid = true;
        this.emailFromUrl = params['email'];
        this.signature = params['signature'];
        this.expires = params['expires'];
      }
    });
  }

  sendLink() {
    this.isLoading = true;
    this.authService.forgotPassword(this.emailRequest).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Se o e-mail existir, o link foi enviado!');
      },
      error: () => this.isLoading = false
    });
  }

  confirmReset() {
    if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.isLoading = true;
    const data = {
      email: decodeURIComponent(this.emailFromUrl),
      signature: this.signature,
      expires: this.expires,
      password: this.password,
      password_confirmation: this.passwordConfirmation
    };

    this.authService.resetPassword(data).subscribe({
      next: () => {
        alert('Senha alterada e conta verificada!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'O link expirou ou é inválido.';
      }
    });
  }
}
