import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'zones',
        loadChildren: () => import('./modules/zones/routes').then(m => m.routes),
    }
];
