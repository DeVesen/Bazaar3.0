---
id: SPEC-R01-ZUGANG
status: draft
updated: 2026-09-09
---

# R01 — „Ich komme rein" — Design-Spec

Quelle: [`roadmap/R01-zugang.md`](../../requirements/advance-registration/roadmap/R01-zugang.md),
[`Epic_Login`](../../requirements/advance-registration/epics/Epic_Login/epic.md),
[`api/auth.md`](../../requirements/advance-registration/api/auth.md),
[`api/blocks.md`](../../requirements/advance-registration/api/blocks.md),
[`api/public.md`](../../requirements/advance-registration/api/public.md),
Entities `verkaeufer`, `refresh-token`, `verkaeufer-typ`, `einstellungen`, `nummernblock`.

Voraussetzung: [R00](../../requirements/advance-registration/roadmap/R00-fundament.md) ist umgesetzt
(Angular-Scaffold, .NET-4-Projekt-Solution, Docker Compose, EF-Core-Grundgerüst mit leerer
`InitialCreate`-Migration, App-Shell mit Sidebar/Guards/Interceptor/Token-Store, Platzhalter-Routen
`/login`, `/register`, `/set-password` mit leeren Pages).

## Ziel

Ein Verkäufer kann sich selbst registrieren und anmelden, ein Admin kann sich anmelden. Nach der
Anmeldung erreicht er die geschützten Seiten, ein Reload wirft ihn nicht heraus, Logout beendet die
Sitzung sauber. Das ist der erste Roadmap-Schritt mit fachlichem Nutzen — ab hier gibt es Konten.

## Klärung vorab: zwei Widersprüche zwischen Roadmap und Epic/API

Diese Spec entscheidet sich für die Epic/API-Quelle (mit dem Requester am 2026-09-09 abgestimmt),
die Roadmap-Datei selbst wird dabei **nicht** verändert (liegt außerhalb dieser Spec):

1. **Nummernblock-Zuweisung bei Registrierung.** R01-Roadmap listet sie unter „Nicht in diesem
   Schritt" (verweist auf R02), während `Epic_Login` AC-10/AC-11 und `api/auth.md` sie als Teil von
   `POST /api/auth/register` verlangen (`defaultBlockCount` Blöcke reservieren, sonst `409
   registration.not_enabled`). **Entscheidung: mit umsetzen** — R01 implementiert die
   Blockvergabe vollständig, wie in Epic/API beschrieben.
2. **Umfang der Nummernblock-Funktionalität.** Da R01 jetzt Blöcke anlegt, ist zusätzlich zu klären,
   wie viel der Nummernblock-Welt mitgebaut wird. **Entscheidung: `NumberBlock`-Entity + Migration +
   `NumberBlockAllocator`-Domain-Service (Vergabe-Kaskade Stufe 1–2, Freiheitsprüfung Stufe 1–4 aus
   `api/blocks.md` Abschnitt 6) plus der lesende Endpoint `GET /api/blocks/mine`.** Alles andere aus
   `api/blocks.md`/`api/sellers.md` (Admin-Verkäuferverwaltung, `POST/DELETE
   /api/sellers/{id}/blocks`, `GET /api/blocks/next-free`, automatische Blockerweiterung bei
   Artikelanlage) bleibt außerhalb von R01 — das sind Epic_Nummernbloecke/Epic_Verkaeufer, spätere
   Roadmap-Schritte.

## Umfang

### Backend — Architektur

Hexagonal in vier Projekten (verbindlich: [`spec.md` §10.0.1](../../requirements/advance-registration/spec.md)):

- **`BAR.Domain`** — Entities `Seller`, `RefreshToken`, `SellerType`, `Settings`, `NumberBlock`;
  Domain-Service `NumberBlockAllocator` (reine Funktion, kein DB-Zugriff — Parameter statt Port,
  siehe [`entities/einstellungen.md`](../../requirements/advance-registration/entities/einstellungen.md));
  Ports `ISellerRepository`, `IRefreshTokenRepository`, `ISellerTypeRepository`,
  `ISettingsRepository`, `INumberBlockRepository`.
- **`BAR.Application`** — ein Handler je Endpoint (Login, Register, Refresh, GetPublicInfo,
  GetMyBlocks). Kein `set-password`-Handler (siehe Abschnitt „Nicht in diesem Schritt").
- **`BAR.Infrastructure`** — EF-Core-Repo-Implementierungen, JWT-Ausstellung (Claims `sub`, `role`,
  `exp`), Passwort-Hashing (bcrypt oder Argon2), SHA-256-Hashing für Refresh-Tokens, die neue
  EF-Migration inkl. Seed.
- **`BAR.Host`** — Minimal-API-Endpoints, DI-Registrierung.

### Backend — Entities & Migration

Neue Tabellen (eine EF-Migration `AddLoginAndRegistration` o. ä. auf der bestehenden leeren
`InitialCreate`):

| Tabelle | Felder | Quelle |
|---|---|---|
| `seller` | `id`, `firstName`, `lastName`, `address?`, `postalCode`, `city`, `phone`, `email` (unique), `sellerTypeId`, `isAdmin`, `passwordHash?`, `inviteToken?`, `inviteTokenExpiresAt?` | [`entities/verkaeufer.md`](../../requirements/advance-registration/entities/verkaeufer.md) |
| `refresh_token` | `id`, `sellerId`, `tokenHash` (unique), `expiresAt`, `createdAt`, `lastUsedAt?` | [`entities/refresh-token.md`](../../requirements/advance-registration/entities/refresh-token.md) |
| `seller_type` | `id`, `name` (unique), `commissionRate`, `itemFee` | [`entities/verkaeufer-typ.md`](../../requirements/advance-registration/entities/verkaeufer-typ.md) |
| `settings` | `id` (fix `"settings"`), `registrationDeadline`, `dropOffFrom`, `dropOffUntil`, `bazaarFrom`, `bazaarUntil`, `defaultTypeId`, `infoText?` (max. 4000 Zeichen), `startNumber`, `blockSize`, `defaultBlockCount` | [`entities/einstellungen.md`](../../requirements/advance-registration/entities/einstellungen.md) |
| `number_block` | `id`, `sellerId`, `fromNumber`, `toNumber` (persistiert, nicht neu berechnet), `assignedAt` | [`entities/nummernblock.md`](../../requirements/advance-registration/entities/nummernblock.md) |

Constraints: `seller.email` unique, `seller_type.name` unique, `refresh_token.tokenHash` unique +
Index auf `sellerId`, `number_block` PostgreSQL-Exclusion-Constraint auf
`int4range(fromNumber, toNumber + 1)` gegen Race Conditions bei paralleler Vergabe.

**Seed-Daten** (in derselben Migration, Testwerte — jederzeit über Einstellungsseite/Admin-UI später
änderbar, R09 ersetzt sie durch echte Pflege):

- `seller_type`: „Standard", `commissionRate = 15.0`, `itemFee = 0.50`
- `settings`: Singleton-Row, Termine in naher Zukunft relativ zum Migrationsdatum (`registrationDeadline`
  ~4 Wochen, `dropOffFrom/Until`/`bazaarFrom/Until` danach gestaffelt), `defaultTypeId` → Standard-Typ,
  `startNumber = 1`, `blockSize = 10`, `defaultBlockCount = 1`, `infoText` mit kurzem Platzhaltertext
- Admin-Seller: `admin@bazaar.local`, Test-Passwort (bcrypt-gehasht in der Migration erzeugt),
  `isAdmin = true`, `sellerTypeId` → Standard-Typ

### Backend — Endpoints

| Endpoint | Beschreibung |
|---|---|
| `POST /api/auth/login` | `{email, password}` → `200` Token-Hülle / `401` „Ungültige Anmeldedaten" (AC-2) |
| `POST /api/auth/register` | `{email, password}` → Seller anlegen (`sellerTypeId = defaultTypeId`), `defaultBlockCount` Blöcke reservieren (`NumberBlockAllocator`), Token ausstellen → `201` / `409 seller.email_taken` / `409 registration.not_enabled` (falls `defaultTypeId` nicht gesetzt) |
| `POST /api/auth/refresh` | `{refreshToken}` → Rotation (Zeile löschen + neu anlegen in einer Transaktion) → `200` / `401` bei unbekannt/abgelaufen/bereits rotiert |
| `GET /api/public/info` | Countdown-Termine, `defaultConditions` (aufgelöst aus `defaultTypeId`), `infoText` — alle Felder `null`-fähig, immer `200` |
| `GET /api/blocks/mine` | Eigene Blöcke des eingeloggten Nutzers, aufsteigend nach `fromNumber`, leeres Array wenn keine — `authenticated` |
| `GET /health`, `GET /health/ready` | Falls nicht schon aus R00 vorhanden — Liveness/Readiness ohne/mit DB-Check |

Refresh-Token-Rotation, Max-5-Sessions-Regel (älteste Zeile fällt raus), Login/Register/Refresh
räumen abgelaufene Zeilen desselben Sellers auf — alles exakt wie in `api/auth.md` beschrieben.

**Nicht in R01:** `POST /api/auth/set-password` (Roadmap verschiebt ihn explizit nach R06 — Route
bleibt Platzhalter), `POST /api/sellers`, jede Admin-Verkäuferverwaltung, `POST/DELETE
/api/sellers/{id}/blocks`, `GET /api/blocks/next-free`, automatische Blockerweiterung bei
Artikelanlage (Epic_Nummernbloecke-Territorium).

### Frontend

Placeholder-Pages aus R00 (`LoginPage`, `RegisterPage`) werden mit echten Komponenten gefüllt.

**Neue Komponenten** (Docs bereits reviewed):

- [`login-layout`](../../requirements/advance-registration/components/login-layout.md) — 2-Spalten-Split
  (Info-Area 50 % dunkel / Form 50 % hell), mobile ≤768px: Info-Area ausgeblendet
- [`login-info-panel`](../../requirements/advance-registration/components/login-info-panel.md) —
  Countdown-Box (`variant="info-box"`, Phasen aus `GET /api/public/info`), Default-Konditionen-Box,
  Markdown-Box; jede Box blendet sich bei `null`-Wert selbst aus (AC-13)
- [`login-form`](../../requirements/advance-registration/components/login-form.md) — E-Mail/Passwort,
  Enter-Submit (AC-3), Fehleranzeige „Ungültige Anmeldedaten" (AC-2), Passwort-vergessen-Popover mit
  Admin-Hinweistext (AC-4, kein Formular), Registrierung-Link
- [`registrierung-form`](../../requirements/advance-registration/components/registrierung-form.md) —
  E-Mail/Passwort/Bestätigung, Pflichtfeld-Validierung (AC-5), Passwort-Stärke-Gate „mind. Mittel"
  (AC-6), Übereinstimmungs-Check (AC-7), E-Mail-bereits-vergeben-Fehler mit Login-Link (AC-8),
  Erfolg → Auto-Login + Redirect `/home` (AC-9)
- [`password-strength-meter`](../../requirements/advance-registration/components/password-strength-meter.md) —
  `p-progressbar` + `p-tag`, eigenes Scoring (schwach/mittel/stark nach Zeichentyp-Regeln)
- [`markdown-text`](../../requirements/advance-registration/components/markdown-text.md) — App-lokale
  Custom-Component, rendert Markdown-Subset zu HTML (AC-12), leer bei leerem `content`
- Countdown-Component (`variant="info-box"`) — prüfen ob [`docs/components/countdown/`](../../../components/countdown/component.md)
  schon als Shared-Component existiert oder in R01 erstmals gebaut wird

**Demo-Hinweis:** nur wenn `!environment.production`, reines `<small>`/`<p>` ohne PrimeNG-Bezug.

**AuthService** (aus R00 vorhanden, Infrastruktur ohne echten Aufrufer): bekommt in R01 die
tatsächlichen `login()`/`register()`-Implementierungen gegen die neuen Endpoints, speichert
Token-Paar im Token-Store, Redirect nach `/home` unabhängig von der Rolle (AC-1, epic.md Abschnitt 4).
Guards, Interceptor, Token-Store, Role-Service bleiben unverändert — sie werden hier erstmals mit
echten Tokens durchlaufen statt mit den Demo-Snippets aus R00.

**PrimeNG-Grundregel bindend:** ausschließlich `p-iconfield`/`p-inputicon`/`pInputText`/
`pInputPassword`/`p-button`/`p-card`/`p-popover`/`p-progressbar`/`p-tag` — kein natives HTML für
UI-Elemente.

### Tests

**Backend (xUnit):**
- `BAR.Domain.UnitTests` — `NumberBlockAllocator` Vergabe-Kaskade Stufe 1–2 (Stufe 3 als Notfall-Pfad
  mit abgedeckt), Freiheitsprüfung Stufe 1–3 aus `api/blocks.md` Abschnitt 6, Passwort-Hash-Erzeugung/
  -Vergleich, Refresh-Token-Hash-Bildung
- `BAR.Host.IntegrationTests` — alle fünf neuen Endpoints inkl. Fehlerfälle (400/401/409), Refresh-
  Rotation (zweiter Aufruf mit altem Token → 401), Max-5-Sessions-Kappung, Registrierung ohne
  `defaultTypeId` → 409, E-Mail-Duplikat → 409, Blockvergabe bei Registrierung
- `BAR.Architecture.Tests` — bestehender NetArchTest bleibt grün, keine verbotene Referenzrichtung
  durch die neuen Projekt-internen Abhängigkeiten

**Frontend (Vitest):**
- `login-form`, `registrierung-form` — Validierung, Submit-Verhalten, Enter-Handling
- `password-strength-meter` — Scoring-Logik für alle drei Stufen
- `login-info-panel` — Box-Ausblendung bei `null`-Feldern
- `AuthService` — `login()`/`register()`/Fehlerpfade gegen die neuen Endpoints (HttpTestingController)

**Manuell** (deckt die 7 „Fertig, wenn"-Punkte aus R01-Roadmap ab): Registrierung → Login → falsches
Passwort → Reload-Persistenz → direkter Aufruf geschützter Route ohne Login → Admin-Login zeigt
Admin-Sidebar-Einträge.

## Out of Scope (bewusst, MVP)

Aus Epic_Login §8 / api/auth.md, unverändert gültig für R01: Brute-Force-Schutz, E-Mail-Verifizierung/
Captcha, Self-Service-Passwort-Reset, Access-Token-Blacklist/serverseitiger Logout, Geräte-Übersicht
in der UI. Zusätzlich für R01 bewusst verschoben: `set-password`/Invite-Flow (R06), Admin-
Verkäuferverwaltung und der übrige Nummernblock-Funktionsumfang (spätere Roadmap-Schritte, siehe
Klärung oben).

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #login #registrierung #auth #jwt #nummernblock
