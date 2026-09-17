import { Routes } from '@angular/router';
import { Shell } from './core/shell/shell';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { guestGuard } from './core/auth/guest.guard';

export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES) },
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'intake', pathMatch: 'full' },
      { path: 'intake', canActivate: [authGuard], loadChildren: () => import('./features/intake/intake.routes').then((m) => m.INTAKE_ROUTES) },
      { path: 'checkout', canActivate: [authGuard], loadChildren: () => import('./features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES) },
      { path: 'settlement', canActivate: [authGuard], loadChildren: () => import('./features/settlement/settlement.routes').then((m) => m.SETTLEMENT_ROUTES) },
      { path: 'sellers', canActivate: [authGuard], loadChildren: () => import('./features/sellers/sellers.routes').then((m) => m.SELLERS_ROUTES) },
      { path: 'articles', canActivate: [authGuard], loadChildren: () => import('./features/articles/articles.routes').then((m) => m.ARTICLES_ROUTES) },
      { path: 'brands', canActivate: [authGuard], loadChildren: () => import('./features/brands/brands.routes').then((m) => m.BRANDS_ROUTES) },
      { path: 'categories', canActivate: [authGuard], loadChildren: () => import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES) },
      { path: 'seller-types', canActivate: [authGuard], loadChildren: () => import('./features/seller-types/seller-types.routes').then((m) => m.SELLER_TYPES_ROUTES) },
      { path: 'statistics', canActivate: [authGuard], loadChildren: () => import('./features/statistics/statistics.routes').then((m) => m.STATISTICS_ROUTES) },
      { path: 'settings', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) },
      { path: '**', loadChildren: () => import('./features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES) },
    ],
  },
];
