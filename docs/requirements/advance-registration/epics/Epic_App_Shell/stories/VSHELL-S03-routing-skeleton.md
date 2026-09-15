---
id: VSHELL-S03
status: draft
depends-on: [VSHELL-S02, VSHELL-S04]
---

# Story: Angular Routing Skeleton

## Ziel

Die App definiert alle Feature-Routen als Lazy-Loaded-Routes, schützt sie durch `AuthGuard` und `AdminGuard` und leitet nicht eingeloggte Nutzer zur Login-Seite weiter.

## Kontext

Die Voranmelde-App hat eine Login-Seite (nicht eingeloggte Nutzer). Alle anderen Routen sind geschützt: einige nur für Admins, andere für alle eingeloggten Nutzer. Das Routing-Skeleton definiert diese Schutzebenen, damit fachliche Epics sich nicht um Auth-Logik kümmern müssen.

## Scope

**In Scope:** `app.routes.ts` mit Lazy-Routes für alle 15 Seiten (`loadChildren` auf die jeweilige `features/<feature>/<feature>.routes.ts`), `/login`, `/register` und `/set-password` als öffentliche Routen, `/embed/countdown` als öffentliche Route **ohne AppShell** (kein Sidebar/Topbar, siehe Epic_Countdown_Widget), `authGuard` für alle nicht-öffentlichen Routen, `adminGuard` für Admin-Only-Routen, Redirect `/` → `/home`, Wildcard → 404.

**Out of Scope:** Seiteninhalte, konkrete Guard-Implementierung (folgt in VSHELL-S04), Login-Formular (folgt in Epic_Login).

## UI-Spezifikation

Routen-Pfade und Klassennamen sind **englisch** (Sprachregel → [`spec.md`](../../../spec.md) Abschnitt 10.0.1); sichtbare
Labels kommen aus ngx-translate. Seiten-Komponenten heißen `…Page` und liegen in
`features/<feature>/pages/`.

```
Route-Tabelle:
/                    → redirect → /home
/login               → öffentlich, LoginPage
/register            → öffentlich, RegisterPage
/set-password        → öffentlich, SetPasswordPage (Ziel des Invite-Links, Query-Parameter `token`)
/embed/countdown     → öffentlich, kein AppShell (kein Sidebar/Topbar), CountdownEmbedPage
/home                → authGuard, HomePage (Verkäufer-/Admin-Ansicht) — OHNE PageLayout, direkt unter Shell
/my-articles         → authGuard, PageLayout(data.title) → MyArticlesPage
/profile             → authGuard, PageLayout(data.title) → ProfilePage
/number-blocks       → authGuard, PageLayout(data.title) → NumberBlocksPage
/sellers             → authGuard + adminGuard, PageLayout(data.title) → SellersPage
/articles             → authGuard + adminGuard, PageLayout(data.title) → ArticlesPage
/brands              → authGuard + adminGuard, PageLayout(data.title) → BrandsPage
/categories          → authGuard + adminGuard, PageLayout(data.title) → CategoriesPage
/seller-types        → authGuard + adminGuard, PageLayout(data.title) → SellerTypesPage
/settings            → authGuard + adminGuard, PageLayout(data.title) → SettingsPage
/export              → authGuard + adminGuard, PageLayout(data.title) → ExportPage
**                   → NotFoundPage — OHNE PageLayout, direkt unter Shell

Guard-Verhalten:
authGuard:  kein Token → redirect /login?returnUrl=…
adminGuard: Token vorhanden, aber nicht Admin → redirect /home

PageLayout-Zwischenebene (Details → Epic_App_Shell/VSHELL-S06):
{ path: '<pfad>', component: PageLayout, data: { title: '<Titel>' }, canActivate: [...],
  children: [{ path: '', loadChildren: () => import('./features/<feature>/<feature>.routes') }] }
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL alle Feature-Routen als Lazy-Loaded-Routes in `app.routes.ts` definieren, jeweils per `loadChildren` auf die feature-eigene Routen-Datei `features/<feature>/<feature>.routes.ts` — `app.routes.ts` kennt keine Seiten-Komponente direkt. Jede Route außer `/home` und der Wildcard hängt zusätzlich über `component: PageLayout` (VSHELL-S06), das selbst keine Seiten-Komponente ist, sondern die Titel-Leiste um die lazy-geladene Feature-Route legt.
- [ ] **AC-1b** — THE SYSTEM SHALL Routen-Pfade und Komponenten-Klassennamen englisch benennen (Tabelle oben); die Menü-Labels der Sidebar kommen aus ngx-translate, nicht aus dem Pfad.
- [ ] **AC-2** — WHEN ein nicht eingeloggter Nutzer eine geschützte Route aufruft, THEN SHALL `authGuard` zur Route `/login` weiterleiten und die ursprüngliche URL als `returnUrl`-Query-Parameter mitgeben.
- [ ] **AC-3** — WHEN ein eingeloggter Verkäufer eine Admin-Only-Route aufruft, THEN SHALL `adminGuard` zur Route `/home` weiterleiten.
- [ ] **AC-4** — WHEN der Nutzer `/` aufruft, THEN SHALL Angular zu `/home` weiterleiten.
- [ ] **AC-5** — WHEN der Nutzer eine unbekannte Route aufruft, THEN SHALL die `NotFoundPage` mit dem Text „Seite nicht gefunden" angezeigt werden.
- [ ] **AC-6** — THE SYSTEM SHALL für jede Route eine Platzhalter-Komponente bereitstellen, die den Seitennamen anzeigt, bis das fachliche Epic implementiert ist.
- [ ] **AC-7** — WHEN ein eingeloggter Nutzer `/login` aufruft, THEN SHALL Angular zu `/home` weiterleiten (kein erneutes Anzeigen der Login-Seite).
- [ ] **AC-8** — THE SYSTEM SHALL `/embed/countdown` außerhalb des AppShell-Layouts rendern (kein Sidebar, kein Topbar) — unabhängig vom Login-Status.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VSHELL-S02 | Shell-Layout mit `<router-outlet>` muss existieren |
| VSHELL-S04 | `authGuard` und `adminGuard` müssen existieren, bevor Routen sie nutzen können |

## Tags & Piles

**Tags:** #routing #lazy-loading #auth-guard #admin-guard #angular
