import { Routes } from '@angular/router';

// LAYOUTS
import { Public } from './layouts/public/public-layout';
import { Private } from './layouts/private/private-layout';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Terms } from './pages/terms/terms';
import { Privacy } from './pages/privacy/privacy';
import { Contact } from './pages/contact/contact';
import { Recovery } from './pages/recovery/recovery';
import { VerifyEmail } from './pages/verify-email/verify-email';

// PÁGINAS PÚBLICAS

// PÁGINAS PRIVADADS


export const routes: Routes = [

    // ROTAS PÚBLICAS
    {
        path: '',
        component: Public,
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./pages/landing/landing')
                        .then(m => Landing)
            },
            {
                path: 'login',
                loadComponent: () =>
                    import('./pages/login/login')
                        .then(m => Login)
            },
            {
                path: 'register',
                loadComponent: () =>
                    import('./pages/register/register')
                        .then(m => Register)
            },
            {
                path: 'terms',
                loadComponent: () =>
                    import('./pages/terms/terms')
                        .then(m => Terms)
            },
            {
                path: 'privacy',
                loadComponent: () =>
                    import('./pages/privacy/privacy')
                        .then(m => Privacy)
            },
            {
                path: 'contact',
                loadComponent: () =>
                    import('./pages/contact/contact')
                        .then(m => Contact)
            },
            {
                path: 'recovery',
                loadComponent: () =>
                    import('./pages/recovery/recovery')
                        .then(m => Recovery)
            },
            {
                path: 'verify',
                loadComponent: () =>
                    import('./pages/verify-email/verify-email')
                        .then(m => VerifyEmail)
            }
        ],
    },

    /* 

    // ROTAS PRIVADAS
    {
        path: '',
        component: Public,
        children: [
            {
                path: '',
                component: Landing,
            },
            {
                path: 'login',
                component: Login,
            },
            {
                path: 'register',
                component: Register,
            },
        ],
    },
    
    */
    // FALLBACK
    {
        path: '**',
        redirectTo: '',
    },
];

