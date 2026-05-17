import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../pages/dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    path: 'history',
    loadComponent: () => import('../pages/history/history').then(m => m.History),
  },
  {
    path: 'settings',
    loadComponent: () => import('../pages/settings/settings').then(m => m.Settings),
  },
  { path: '**', redirectTo: '' },
];
