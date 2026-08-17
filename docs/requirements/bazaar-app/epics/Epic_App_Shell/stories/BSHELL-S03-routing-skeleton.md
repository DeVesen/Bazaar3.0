---
id: BSHELL-S03
status: draft
depends-on: [BSHELL-S02, BSHELL-S05]
---

# Story: Angular Routing Skeleton

## Ziel

Die App definiert alle Feature-Routen als Lazy-Loaded-Routes, schützt sie durch `authGuard`, `adminGuard` und `passwordChangeGuard` und leitet nicht eingeloggte Nutzer zur Login-Seite weiter. Jede Feature-Seite erhält eine Platzhalter-Komponente, die beim Navigieren angezeigt wird.

## Kontext

Lazy Loading reduziert die initiale Bundle-Größe. Das Routing-Skeleton definiert außerdem die Schutzebenen, damit sich die fachlichen Epics nicht um Auth-Logik kümmern müssen.

Routen-Pfade und Klassennamen sind **englisch** (Sprachregel → [`spec.md`](../../../spec.md) Abschnitt 7.0.1); sichtbare Menü-Labels bleiben deutsch und stehen im Sidebar-Template, nicht im Pfad. Die Haupt-App hat keine Mehrsprachigkeit — es gibt also keine Übersetzungsschicht, aus der Labels kommen könnten.

Zugriffsrechte je Bereich stehen in der Rechte-Matrix ([`spec.md`](../../../spec.md) Abschnitt 4.1): Einstellungen sind Admin-only, alles andere ist für beide Rollen erreichbar. Lese- gegen Schreibrechte innerhalb einer Seite sind Sache des jeweiligen fachlichen Epics — eine Route kennt nur „darf rein" oder „darf nicht rein".

## Scope

**In Scope:** `app.routes.ts` mit Lazy-Routes (`loadChildren` auf die jeweilige `features/<feature>/<feature>.routes.ts`), `/login` als öffentliche Route ohne AppShell, `/change-password` als geschützte Route ohne Sidebar, `authGuard` für alle nicht-öffentlichen Routen, `adminGuard` für Admin-Only-Routen, `passwordChangeGuard`, Redirect `/` → `/intake`, Wildcard → 404, `provideRouter` in `app.config.ts`.

**Out of Scope:** Seiteninhalte, Preloading-Strategie, die Guard-Implementierung selbst (in [BSHELL-S05](BSHELL-S05-auth-infrastruktur.md)).

## UI-Spezifikation

```
Route-Tabelle:
/                    → redirect → /intake
/login               → öffentlich, ohne AppShell, LoginPage
/change-password     → authGuard, ohne Sidebar, ChangePasswordPage
/intake              → authGuard,  lazy: IntakePage
/checkout            → authGuard,  lazy: CheckoutPage
/settlement          → authGuard,  lazy: SettlementPage
/sellers             → authGuard,  lazy: SellersPage
/articles            → authGuard,  lazy: ArticlesPage
/brands              → authGuard,  lazy: BrandsPage
/categories          → authGuard,  lazy: CategoriesPage
/seller-types        → authGuard,  lazy: SellerTypesPage
/statistics          → authGuard,  lazy: StatisticsPage
/settings            → adminGuard, lazy: SettingsPage
**                   → NotFoundPage

authGuard:           kein oder abgelaufenes Token → redirect /login?returnUrl=…
adminGuard:          Rolle ≠ admin → redirect /intake
passwordChangeGuard: mustChangePassword gesetzt → redirect /change-password
```

**Keine Route für Druckfunktionen.** Drucken ist eine Aktion innerhalb der Artikelannahme (automatisch nach dem Buchen) und der Abrechnung (Button) — keine eigene Seite, siehe [Epic_Druckfunktionen](../../Epic_Druckfunktionen/epic.md).

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL alle Feature-Routen als Lazy-Loaded-Routes in `app.routes.ts` definieren, jeweils per `loadChildren` auf die feature-eigene Routen-Datei `features/<feature>/<feature>.routes.ts` — `app.routes.ts` kennt keine Seiten-Komponente direkt.
- [ ] **AC-1b** — THE SYSTEM SHALL Routen-Pfade und Komponenten-Klassennamen englisch benennen (Tabelle oben); die deutschen Menü-Labels SHALL ausschließlich im Sidebar-Template stehen und nicht aus dem Pfad abgeleitet werden.
- [ ] **AC-2** — WHEN ein nicht eingeloggter Nutzer eine geschützte Route aufruft, THEN SHALL `authGuard` zur Route `/login` weiterleiten und die ursprüngliche URL als `returnUrl`-Query-Parameter mitgeben.
- [ ] **AC-3** — WHEN ein eingeloggtes Kassenpersonal `/settings` aufruft, THEN SHALL `adminGuard` zur Route `/intake` weiterleiten.
- [ ] **AC-4** — WHEN ein eingeloggter Nutzer `/login` aufruft, THEN SHALL Angular zu `/intake` weiterleiten (kein erneutes Anzeigen der Login-Seite).
- [ ] **AC-5** — WHILE der Claim `mustChangePassword` im Token gesetzt ist, SHALL `passwordChangeGuard` jede Route außer `/change-password` und `/login` auf `/change-password` umleiten.
- [ ] **AC-6** — WHEN der Nutzer `/` aufruft, THEN SHALL Angular zu `/intake` weiterleiten.
- [ ] **AC-7** — WHEN der Nutzer eine unbekannte Route aufruft, THEN SHALL die `NotFoundPage` mit dem Text „Seite nicht gefunden" angezeigt werden.
- [ ] **AC-8** — THE SYSTEM SHALL `/login` und `/change-password` ohne Sidebar rendern; `/login` zusätzlich ohne jede AppShell.
- [ ] **AC-9** — THE SYSTEM SHALL für jede Route eine Platzhalter-Komponente bereitstellen, die den Seitennamen anzeigt, bis das fachliche Epic implementiert ist.
- [ ] **AC-10** — WHEN der Nutzer zwischen zwei Routen navigiert, THEN SHALL nur das jeweilige Lazy-Chunk geladen werden (kein erneutes Laden bereits geladener Chunks).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BSHELL-S02 | Shell-Layout mit `<router-outlet>` muss existieren |
| BSHELL-S05 | `authGuard`, `adminGuard` und `passwordChangeGuard` müssen existieren, bevor Routen sie nutzen können |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #routing #lazy-loading #angular #skeleton #guards #auth
