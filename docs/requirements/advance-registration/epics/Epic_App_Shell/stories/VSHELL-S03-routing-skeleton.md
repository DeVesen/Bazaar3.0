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

**In Scope:** `app.routes.ts` mit Lazy-Routes für alle 14 Seiten, `/login` und `/registrieren` als öffentliche Routen, `/embed/countdown` als öffentliche Route **ohne AppShell** (kein Sidebar/Topbar, siehe Epic_Countdown_Widget), `AuthGuard` für alle nicht-öffentlichen Routen, `AdminGuard` für Admin-Only-Routen, Redirect `/` → `/home`, Wildcard → 404.

**Out of Scope:** Seiteninhalte, konkrete Guard-Implementierung (folgt in VSHELL-S04), Login-Formular (folgt in Epic_Login).

## UI-Spezifikation

```
Route-Tabelle:
/                        → redirect → /home
/login                   → öffentlich, LoginComponent
/registrieren            → öffentlich, RegistrierenComponent
/embed/countdown         → öffentlich, kein AppShell (kein Sidebar/Topbar), EmbedCountdownComponent
/home                    → AuthGuard, HomeComponent (Verkäufer-/Admin-Ansicht)
/meine-artikel           → AuthGuard, MeineArtikelComponent
/profil                  → AuthGuard, ProfilComponent
/nummernbloecke          → AuthGuard, NummernbloeckeComponent
/verkaeufer              → AuthGuard + AdminGuard, VerkaeufertComponent
/alle-artikel            → AuthGuard + AdminGuard, AlleArtikelComponent
/marken                  → AuthGuard + AdminGuard, MarkenComponent
/kategorien              → AuthGuard + AdminGuard, KategorienComponent
/verkaeufer-types        → AuthGuard + AdminGuard, VerkaeufertypesComponent
/einstellungen           → AuthGuard + AdminGuard, EinstellungenComponent
/export                  → AuthGuard + AdminGuard, ExportComponent
**                       → NotFoundComponent

Guard-Verhalten:
AuthGuard: kein Token → redirect /login
AdminGuard: Token vorhanden, aber nicht Admin → redirect /home
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL alle Feature-Routen als Lazy-Loaded-Routes in `app.routes.ts` definieren.
- [ ] **AC-2** — WHEN ein nicht eingeloggter Nutzer eine geschützte Route aufruft, THEN SHALL `AuthGuard` zur Route `/login` weiterleiten und die ursprüngliche URL als `returnUrl`-Query-Parameter mitgeben.
- [ ] **AC-3** — WHEN ein eingeloggter Verkäufer eine Admin-Only-Route aufruft, THEN SHALL `AdminGuard` zur Route `/home` weiterleiten.
- [ ] **AC-4** — WHEN der Nutzer `/` aufruft, THEN SHALL Angular zu `/home` weiterleiten.
- [ ] **AC-5** — WHEN der Nutzer eine unbekannte Route aufruft, THEN SHALL die `NotFoundComponent` mit dem Text „Seite nicht gefunden" angezeigt werden.
- [ ] **AC-6** — THE SYSTEM SHALL für jede Route eine Platzhalter-Komponente bereitstellen, die den Seitennamen anzeigt, bis das fachliche Epic implementiert ist.
- [ ] **AC-7** — WHEN ein eingeloggter Nutzer `/login` aufruft, THEN SHALL Angular zu `/home` weiterleiten (kein erneutes Anzeigen der Login-Seite).
- [ ] **AC-8** — THE SYSTEM SHALL `/embed/countdown` außerhalb des AppShell-Layouts rendern (kein Sidebar, kein Topbar) — unabhängig vom Login-Status.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VSHELL-S02 | Shell-Layout mit `<router-outlet>` muss existieren |
| VSHELL-S04 | `AuthGuard` und `AdminGuard` müssen existieren, bevor Routen sie nutzen können |

## Tags & Piles

**Tags:** #routing #lazy-loading #auth-guard #admin-guard #angular
