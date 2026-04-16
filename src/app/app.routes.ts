// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { capabilityGuard } from './core/guards/capability.guards';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [

  // Raiz -> redireciona para home (publicGuard decide se vai para app/dash)
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },

  // ── ROTAS PÚBLICAS ──────────────────────────────────────────────
  {
    path: 'home',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify/verify-email.component').then(m => m.VerifyEmailComponent)
      }
    ]
  },
  {
    path: 'legal',
    children: [
      { 
        path: 'terms', 
        loadComponent: () => import('./shared/legal/legal.component').then(m => m.LegalComponent)
      },
      { 
        path: 'policy', 
        loadComponent: () => import('./shared/legal/legal.component').then(m => m.LegalComponent)
      },
    ]
  },

  // ── ROTAS PROTEGIDAS (com MainLayout) ───────────────────────────
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate:[authGuard],
    children: [
      { path: '', redirectTo: 'dash', pathMatch: 'full' },
      {
        path: 'dash',
        loadComponent: () => import('./features/dash/dash.component').then(m => m.DashComponent),
        data: { breadcrumb: 'Dashboard'}
      },
      {
        path: 'finance',
        canActivate:[capabilityGuard],
        data: { capability: 'finance.view', breadcrumb: 'Finanças'},
        loadChildren: () => import('./features/finance/finance.routes').then(m => m.FINANCE_ROUTES)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        data: { breadcrumb: 'Configurações' }
      }   
    ]
  },
  
  // Fallback
  { path: '**', redirectTo: '/home' }
];