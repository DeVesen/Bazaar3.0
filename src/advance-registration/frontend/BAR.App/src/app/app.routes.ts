import { Routes } from '@angular/router';
import { Shell } from './core/shell/shell';
import { PageLayout } from './core/shell/page-layout/page-layout';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: 'embed/countdown', loadChildren: () => import('./features/countdown-embed/countdown-embed.routes').then((m) => m.COUNTDOWN_EMBED_ROUTES) },
  { path: 'login', loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES) },
  { path: 'register', loadChildren: () => import('./features/seller-management/register/register.routes').then((m) => m.REGISTER_ROUTES) },
  { path: 'set-password', loadChildren: () => import('./features/seller-management/set-password/set-password.routes').then((m) => m.SET_PASSWORD_ROUTES) },
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', canActivate: [authGuard], loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES) },
      {
        path: 'my-articles',
        component: PageLayout,
        data: { title: 'Meine Artikel' },
        canActivate: [authGuard],
        children: [{ path: '', loadChildren: () => import('./features/registration/my-articles/my-articles.routes').then((m) => m.MY_ARTICLES_ROUTES) }]
      },
      {
        path: 'profile',
        component: PageLayout,
        data: { title: 'Profil' },
        canActivate: [authGuard],
        children: [{ path: '', loadChildren: () => import('./features/seller-management/profile/profile.routes').then((m) => m.PROFILE_ROUTES) }]
      },
      {
        path: 'number-blocks',
        component: PageLayout,
        data: { title: 'Nummernblöcke' },
        canActivate: [authGuard],
        children: [{ path: '', loadChildren: () => import('./features/registration/number-blocks/number-blocks.routes').then((m) => m.NUMBER_BLOCKS_ROUTES) }]
      },
      {
        path: 'sellers',
        component: PageLayout,
        data: { title: 'Verkäufer' },
        canActivate: [authGuard, adminGuard],
        children: [{ path: '', loadChildren: () => import('./features/seller-management/sellers/sellers.routes').then((m) => m.SELLERS_ROUTES) }]
      },
      {
        path: 'articles',
        component: PageLayout,
        data: { title: 'Artikel' },
        canActivate: [authGuard, adminGuard],
        children: [{ path: '', loadChildren: () => import('./features/registration/articles/articles.routes').then((m) => m.ARTICLES_ROUTES) }]
      },
      {
        path: 'brands',
        component: PageLayout,
        data: { title: 'Marken' },
        canActivate: [authGuard, adminGuard],
        children: [{ path: '', loadChildren: () => import('./features/master-data/brands/brands.routes').then((m) => m.BRANDS_ROUTES) }]
      },
      {
        path: 'categories',
        component: PageLayout,
        data: { title: 'Kategorien' },
        canActivate: [authGuard, adminGuard],
        children: [{ path: '', loadChildren: () => import('./features/master-data/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES) }]
      },
      {
        path: 'seller-types',
        component: PageLayout,
        data: { title: 'Verkäufer-Typen' },
        canActivate: [authGuard, adminGuard],
        children: [{ path: '', loadChildren: () => import('./features/master-data/seller-types/seller-types.routes').then((m) => m.SELLER_TYPES_ROUTES) }]
      },
      {
        path: 'settings',
        component: PageLayout,
        data: { title: 'Einstellungen' },
        canActivate: [authGuard, adminGuard],
        children: [{ path: '', loadChildren: () => import('./features/operations/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) }]
      },
      {
        path: 'export',
        component: PageLayout,
        data: { title: 'Export' },
        canActivate: [authGuard, adminGuard],
        children: [{ path: '', loadChildren: () => import('./features/export/export/export.routes').then((m) => m.EXPORT_ROUTES) }]
      },
      { path: '**', canActivate: [authGuard], loadChildren: () => import('./features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES) }
    ]
  }
];
