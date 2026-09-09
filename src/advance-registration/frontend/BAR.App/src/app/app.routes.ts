import { Routes } from '@angular/router';
import { Shell } from './core/shell/shell';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: 'embed/countdown', loadChildren: () => import('./features/countdown-embed/countdown-embed.routes').then((m) => m.COUNTDOWN_EMBED_ROUTES) },
  { path: 'login', loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES) },
  { path: 'register', loadChildren: () => import('./features/register/register.routes').then((m) => m.REGISTER_ROUTES) },
  { path: 'set-password', loadChildren: () => import('./features/set-password/set-password.routes').then((m) => m.SET_PASSWORD_ROUTES) },
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', canActivate: [authGuard], loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES) },
      { path: 'my-articles', canActivate: [authGuard], loadChildren: () => import('./features/my-articles/my-articles.routes').then((m) => m.MY_ARTICLES_ROUTES) },
      { path: 'profile', canActivate: [authGuard], loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES) },
      { path: 'number-blocks', canActivate: [authGuard], loadChildren: () => import('./features/number-blocks/number-blocks.routes').then((m) => m.NUMBER_BLOCKS_ROUTES) },
      { path: 'sellers', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/sellers/sellers.routes').then((m) => m.SELLERS_ROUTES) },
      { path: 'articles', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/articles/articles.routes').then((m) => m.ARTICLES_ROUTES) },
      { path: 'brands', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/brands/brands.routes').then((m) => m.BRANDS_ROUTES) },
      { path: 'categories', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES) },
      { path: 'seller-types', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/seller-types/seller-types.routes').then((m) => m.SELLER_TYPES_ROUTES) },
      { path: 'settings', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) },
      { path: 'export', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/export/export.routes').then((m) => m.EXPORT_ROUTES) },
      { path: '**', canActivate: [authGuard], loadChildren: () => import('./features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES) }
    ]
  }
];
