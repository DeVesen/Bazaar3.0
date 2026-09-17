import { Routes } from '@angular/router';
import { Shell } from './core/shell/shell';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { guestGuard } from './core/auth/guest.guard';
import { passwordChangeGuard } from './core/auth/password-change.guard';

export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES) },
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'intake', pathMatch: 'full' },
      { path: 'change-password', canActivate: [authGuard], loadChildren: () => import('./features/change-password/change-password.routes').then((m) => m.CHANGE_PASSWORD_ROUTES) },
      { path: 'intake', canActivate: [authGuard, passwordChangeGuard], loadChildren: () => import('./features/intake/intake.routes').then((m) => m.INTAKE_ROUTES) },
      { path: 'checkout', canActivate: [authGuard, passwordChangeGuard], loadChildren: () => import('./features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES) },
      { path: 'settlement', canActivate: [authGuard, passwordChangeGuard], loadChildren: () => import('./features/settlement/settlement.routes').then((m) => m.SETTLEMENT_ROUTES) },
      { path: 'sellers', canActivate: [authGuard, passwordChangeGuard], loadChildren: () => import('./features/sellers/sellers.routes').then((m) => m.SELLERS_ROUTES) },
      { path: 'articles', canActivate: [authGuard, passwordChangeGuard], loadChildren: () => import('./features/articles/articles.routes').then((m) => m.ARTICLES_ROUTES) },
      { path: 'brands', canActivate: [authGuard, passwordChangeGuard], loadChildren: () => import('./features/brands/brands.routes').then((m) => m.BRANDS_ROUTES) },
      { path: 'categories', canActivate: [authGuard, passwordChangeGuard], loadChildren: () => import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES) },
      { path: 'seller-types', canActivate: [authGuard, passwordChangeGuard], loadChildren: () => import('./features/seller-types/seller-types.routes').then((m) => m.SELLER_TYPES_ROUTES) },
      { path: 'statistics', canActivate: [authGuard, passwordChangeGuard], loadChildren: () => import('./features/statistics/statistics.routes').then((m) => m.STATISTICS_ROUTES) },
      { path: 'settings', canActivate: [authGuard, adminGuard, passwordChangeGuard], loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) },
      { path: '**', loadChildren: () => import('./features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES) },
    ],
  },
];
