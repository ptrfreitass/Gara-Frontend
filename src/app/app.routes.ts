import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/components/layout-component/layout-component';
import { Landing } from './features/landing/landing';

export const routes: Routes = [
    // Página de recepção
    {
        path: '',
        component: Landing
        //canActivate: [noAuthGuard]
    },
];

