import { Routes } from '@angular/router';

// Mantemos apenas os Layouts estáticos para evitar um "piscar" de tela na troca de rotas base
import { Public } from './layouts/public/public-layout';
import { Private } from './layouts/private/private-layout';
import { authGuard } from './core/guards/auth/auth-guard';
import { publicGuard } from './core/guards/public/public-guard';

export const routes: Routes = [
  // ROTAS PÚBLICAS
  {
    path: '',
    component: Public,
    canActivate: [publicGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/public/landing/landing').then(m => m.Landing)
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/public/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/public/register/register').then(m => m.Register)
      },
      {
        path: 'terms',
        loadComponent: () => import('./pages/public/terms/terms').then(m => m.Terms)
      },
      {
        path: 'privacy',
        loadComponent: () => import('./pages/public/privacy/privacy').then(m => m.Privacy)
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/public/contact/contact').then(m => m.Contact)
      },
      {
        path: 'recovery',
        loadComponent: () => import('./pages/public/recovery/recovery').then(m => m.Recovery)
      },
      {
        path: 'verify',
        loadComponent: () => import('./pages/public/verify-email/verify-email').then(m => m.VerifyEmail)
      }
    ],
  },

  // ROTAS PRIVADAS
  {
    path: '', // Alterado para vazio para permitir prefixos nos filhos ou usar Guards aqui
    component: Private,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/private/home/home').then(m => m.Home)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/private/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/private/profile/profile').then(m => m.Profile)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/private/settings/settings').then(m => m.Settings)
      },
      {
        path: 'financas',
        children:[
          { 
            path: 'home',
            loadComponent: () => import('./pages/private/finance/finance').then(m => m.Finance)
          },
          { 
            path: 'novo',
            loadComponent: () => import('./pages/private/finance/new/new').then(m => m.New)
          },
          { 
            path: 'previsao',
            loadComponent: () => import('./pages/private/finance/forecast/forecast').then(m => m.Forecast)
          },
          { 
            path: 'categorias',
            loadComponent: () => import('./pages/private/finance/categories/categories').then(m => m.Categories)
          },
          { 
            path: 'historico',
            loadComponent: () => import('./pages/private/finance/history/history').then(m => m.History)
          }
        ] 
      },
    ],
  },

  // FALLBACK
  {
    path: '**',
    redirectTo: '',
  },
];