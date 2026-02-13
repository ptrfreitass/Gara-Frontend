import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { map } from 'rxjs';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
 
  // 1. Verificação rápida: Já temos o usuário na memória?
  if (authService.currentUserSignal()) {
    router.navigate(['/home']);
    return false;
  } 

  // Se não temos, verifica no backend para ter certeza absoluta 
  // (caso o usuário tenha dado F5 na tela de login mas o cookie ainda exista)
  return authService.getUser().pipe(
    map(user => {
      if (user) {
        router.navigate(['/']); // ou '/dashboard'
        return false; // Bloqueia o acesso ao Login
      }
      return true; // Permite o acesso ao Login
    })
  );

};