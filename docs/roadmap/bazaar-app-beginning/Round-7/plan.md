---
round: Round-7
status: geplant
---

# Plan: Round 7 — Responsives Layout & Routing-Skeleton

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

Aus [Round-1/plan.md](../Round-1/plan.md): `src/bazaar-app/frontend/`, Feature-First-
Struktur (`features/`, `core/`, `shared/`), ESLint-Boundaries, PrimeNG 22 +
`@lucide/angular` in `app.config.ts` (ohne Theme).

Aus [Round-6/plan.md](../Round-6/plan.md): `core/shell/sidebar/sidebar.ts` — Standalone
Component mit `input.required<Role>()` (`role`), `input.required<string>()`
(`username`, `roleLabel`), `input(0)` (`openArticlesCount`), `output<void>()`
(`logoutClicked`); **kein** `p-sidebar-spacer` in der Sidebar-Komponente selbst — der
gehört laut Round-6/plan.md Schritt 4 in die Shell (also genau in dieses Round-7-Häppchen,
direktes Kind von `p-sidebar`).

## Implementationsplan

### Teil A — BSHELL-S02: Responsives Layout

#### 1. `core/shell/shell.ts` + `shell.html`

Struktur analog
[`BAR.App/core/shell/shell.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.ts)/
[`shell.html`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.html),
aber Breakpoint **768 px** (nicht 1024 px wie in der Referenz-App — BSHELL-S02 AC-1/AC-2
verlangen exakt 768 px) und ohne `p-toast`/`p-confirm-dialog` (kommen erst mit den
fachlichen Epics, die sie tatsächlich brauchen — YAGNI für ein reines Setup-Häppchen):

```typescript
const MOBILE_BREAKPOINT = '(max-width: 768px)';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ButtonModule, SidebarModule, LucideMenu, Sidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit, OnDestroy {
  readonly isMobile = signal(false);
  readonly open = signal(true);
  // ngOnInit/ngOnDestroy: MediaQueryList-Listener, 1:1 aus der Referenz übernommen
}
```

```html
<p-sidebar-layout>
  @if (isMobile() && open()) {
    <p-sidebar-backdrop (click)="open.set(false)" />
  }
  <p-sidebar id="app-nav" [collapsible]="isMobile() ? 'offcanvas' : 'icon'" [overlay]="isMobile()" [(open)]="open">
    <p-sidebar-spacer />
    <app-sidebar
      [role]="currentRole()"
      [username]="currentUsername()"
      [roleLabel]="currentRoleLabel()"
      [openArticlesCount]="0"
      (logoutClicked)="onLogout()"
    />
  </p-sidebar>
  <p-sidebar-main>
    @if (isMobile()) {
      <header id="topbar" class="content-header">
        <button id="btnBurger" pButton pSidebarTrigger target="app-nav" severity="secondary" text>
          <svg lucideMenu></svg>
        </button>
        <span>Bazaar Suite</span>
      </header>
    }
    <div class="content-body">
      <router-outlet />
    </div>
  </p-sidebar-main>
</p-sidebar-layout>
```

`currentRole()`/`currentUsername()`/`currentRoleLabel()` sind in Round-7 **hartcodierte
Platzhalter-Signals** (z. B. `signal<Role>('admin')`), da `AuthService` erst in Round 9
existiert — direkte Fortsetzung der in Round-6/plan.md dokumentierten
Reihenfolge-Einschränkung. `onLogout()` ist vorerst ein No-Op mit Kommentar „wird in
Round 9 mit echtem Logout verdrahtet".

#### 2. Mobile-Overlay-Verhalten (AC-3, AC-4, AC-5)

`[overlay]="isMobile()"` und `[(open)]="open"` des PrimeNG-Sidebar-Compounds decken
AC-3/AC-4 (Slide-in + Backdrop-Tap-to-close) bereits ab, wie in der Referenz-App
erprobt. AC-5 (Sidebar schließt nach Navigationsauswahl auf Mobile) braucht zusätzliche
Verdrahtung — im `Shell`:

```typescript
constructor() {
  inject(Router).events
    .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
    .subscribe(() => {
      if (this.isMobile()) this.open.set(false);
    });
}
```

(Die Referenz-App hat dieses Verhalten nicht sichtbar umgesetzt — hier neu nach AC-5,
da BSHELL-S02 es explizit fordert.)

#### 3. Content-Padding & Print-Regel (AC-6, AC-7)

`shell.scss`:

```scss
.content-body {
  padding: 26px 22px; // Desktop
}
@media (max-width: 768px) {
  .content-body { padding: 14px 12px; }
}
@media print {
  #app-nav, #topbar { display: none; }
  .content-body { padding: 0; }
}
```

### Teil B — BSHELL-S03: Routing-Skeleton (eingeschränkt, s. o.)

#### 4. Platzhalter-Seiten je Feature

Für jede der zehn Fach-Routen ein minimales Feature-Verzeichnis mit Platzhalter-Page
(AC-9):

```
features/intake/intake.routes.ts        + pages/intake-page/intake-page.ts
features/checkout/checkout.routes.ts     + pages/checkout-page/checkout-page.ts
features/settlement/…
features/sellers/…
features/articles/…
features/brands/…
features/categories/…
features/seller-types/…
features/statistics/…
features/settings/…
features/login/login.routes.ts           + pages/login-page/login-page.ts
features/not-found/not-found.routes.ts   + pages/not-found-page/not-found-page.ts
```

Platzhalter-Page-Muster (überall identisch, nur Text variiert):

```typescript
@Component({
  selector: 'app-intake-page',
  template: `<p>Artikelannahme</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntakePage {}
```

`<feature>.routes.ts` je Feature analog
[`home.routes.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/features/home/home.routes.ts)-Muster:
eine `Routes`-Konstante mit `{ path: '', component: XPage }`.

#### 5. Stub-Guards (AC-2, AC-3 strukturell, s. Reihenfolge-Hinweis)

`core/auth/auth.guard.ts` und `core/auth/admin.guard.ts` als **Grundgerüst ohne echte
Prüfung**:

```typescript
// TODO(Round 9): durch echte AuthService-Prüfung ersetzen (siehe BSHELL-S05).
export const authGuard: CanActivateFn = () => true;
export const adminGuard: CanActivateFn = () => true;
```

Struktur (Funktions-Guard, `CanActivateFn`) bereits identisch zur Ziel-Signatur aus
[`auth.guard.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.guard.ts)/
[`admin.guard.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/admin.guard.ts)
der Referenz-App — Round 9 tauscht nur den Rumpf, nicht die Guard-Registrierung in
`app.routes.ts`.

#### 6. `app.routes.ts` (AC-1, AC-1b, AC-4, AC-6, AC-8, AC-10)

```typescript
export const routes: Routes = [
  { path: 'login', loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES) },
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
```

`/login` bewusst **außerhalb** des `Shell`-Wrapper-Eintrags (AC-8: ohne jede AppShell —
kein `component: Shell`-Parent). `provideRouter(routes)` bereits in `app.config.ts` aus
Round-1 vorhanden, hier nur die eigentliche `routes`-Definition ergänzen.

Route-Pfade und Komponentennamen durchgehend englisch (AC-1b) — Labels bleiben
ausschließlich im Sidebar-Template aus Round-6.

#### 7. `NotFoundPage` (AC-7)

`features/not-found/pages/not-found-page/not-found-page.ts`: `<p>Seite nicht
gefunden</p>`.

### Verifikation

- `ng serve`, Viewport auf > 768 px → Sidebar fest sichtbar, kein Topbar (AC-1 BSHELL-S02).
- Viewport auf ≤ 768 px (Browser-DevTools) → Topbar mit Burger sichtbar, Sidebar
  ausgeblendet; Burger-Klick → Sidebar slide-in + Overlay (AC-2, AC-3); Overlay-Klick →
  schließt (AC-4); Navigationsklick in geöffneter Mobile-Sidebar → schließt automatisch
  (AC-5).
- Browser-Druckvorschau (`Strg+P`) → Sidebar/Topbar ausgeblendet, nur Content (AC-6).
- Für jede Route in der Tabelle: direkt aufrufen → passende Platzhalter-Seite erscheint
  (AC-9); Netzwerk-Tab zeigt genau ein neues Lazy-Chunk pro erstem Aufruf, kein erneutes
  Laden bei Rücknavigation (AC-10).
- `/` aufrufen → redirect auf `/intake` (AC-6 BSHELL-S03).
- Unbekannte Route (`/does-not-exist`) → `NotFoundPage` (AC-7).
- `/login` aufrufen → kein Sidebar/Shell sichtbar (AC-8) — Stub-Guards liefern in
  Round-7 durchgehend `true`, daher **kein** Redirect-Nachweis für AC-2/AC-3 möglich;
  das wird erst mit Round 9 nachprüfbar (dort verifizieren, nicht hier).

## Reihenfolge

Teil A (1–3) vor Teil B (4–7), da `app.routes.ts` den `Shell`-Component-Wrapper aus
Schritt 1 referenziert. Innerhalb Teil B: 4 vor 5/6 (Platzhalter-Seiten müssen existieren,
bevor `app.routes.ts` sie importiert), 5 und 6 können parallel entstehen, 7 Teil von 4.
