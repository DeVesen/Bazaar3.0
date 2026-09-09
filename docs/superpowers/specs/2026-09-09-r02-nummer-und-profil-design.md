---
id: DESIGN-R02
status: draft
updated: 2026-09-09
roadmap: docs/requirements/advance-registration/roadmap/R02-nummer-und-profil.md
---

# Design R02 — Nummernblock + Profil (Tab 1)

## Ausgangslage

Backend für Nummernblöcke ist zu großen Teilen bereits durchgestochen:
`NumberBlock` (Domain), `NumberBlockAllocator` (Vergabe-Kaskade Stufe 1–2),
`GetMyBlocksQueryHandler`, `BlocksEndpoints.MapBlocksEndpoints` (`GET
/api/blocks/mine`), `NumberBlockRepository`, `NumberBlockConfiguration` und die
Zuweisung bei Registrierung (`RegisterCommandHandler`) existieren und sind
verdrahtet. Profil existiert nur als leere Platzhalter-Struktur (`.gitkeep` in
`BAR.Application/Profile`, `BAR.Host/Features/Profile`, `ProfilePage.ts` mit
`<h1>Profil</h1>`). Frontend-Routing für beide Seiten ist bereits vollständig
verdrahtet (`app.routes.ts`, `number-blocks.routes.ts`,
`profile.routes.ts`) — reines Projektanlage-Ergebnis, kein fachlicher Inhalt.

Dieses Dokument beschreibt nur, was für R02 **noch fehlt**.

## Scope

Siehe [Roadmap R02](../../requirements/advance-registration/roadmap/R02-nummer-und-profil.md)
„Umfang" / „Nicht in diesem Schritt". Kurz: Nummernblöcke lesend fertig
durchstechen (inkl. DB-Race-Schutz), Profil nur Tab 1 (Steckbrief,
`GET`/`PUT /api/profile`). Tab 2 (Zugangsdaten), Tab 3 (Löschen), Admin-Routen
unter `/api/sellers/{id}/blocks`, automatische Blockerweiterung bei vollem
Block und die Verkäufernummer-Karte auf der Startseite sind **nicht** Teil
dieses Schritts.

## Backend — Nummernblöcke fertigstellen

**`BlockResult` erweitern** (`BAR.Application/Blocks/GetMine/BlockResult.cs`):
zusätzliche Felder `NumberCount` (`ToNumber - FromNumber + 1`) und `UsedCount`.
`UsedCount` ist in R02 immer `0` — es existiert noch kein Artikel-Entity, gegen
das gezählt werden könnte (Epic_Meine_Artikel kommt in einer späteren
Roadmap-Stufe). Ein kurzer Kommentar an der Stelle hält fest, warum der Wert
konstant ist, damit es beim späteren Anschluss an Artikel nicht wie ein
vergessener Fall aussieht. `GetMyBlocksQueryHandler` liefert die neuen Felder
mit.

**Exclusion-Constraint** (`api/blocks.md` Abschnitt 6, Stufe 4; Entity-Doc
„Constraints"): neue EF-Core-Migration mit raw SQL auf `number_block`:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE number_block
    ADD CONSTRAINT ck_number_block_no_overlap
    EXCLUDE USING gist (int4range(from_number, to_number + 1) WITH &&);
```

`Down()` entfernt den Constraint wieder (Extension bleibt, wird nicht global
zurückgenommen). Das ist die einzige DB-seitige Absicherung gegen zwei
parallele Vergaben — die serverseitige Vorprüfung im `NumberBlockAllocator`
ersetzt sie laut Spec nicht und umgekehrt.

## Backend — Profil (neu)

**`BAR.Application/Profile`:**
- `GetProfile/GetProfileQueryHandler` — lädt `Seller` über `ISellerRepository`,
  löst `SellerType` über `ISellerTypeRepository` auf, liefert
  `ProfileResult` (Felder gemäß `api/profile.md` Abschnitt 1, inkl.
  verschachteltem `sellerType`).
- `UpdateProfile/UpdateProfileCommand(Validator)/UpdateProfileCommandHandler` —
  ändert nur `firstName`, `lastName`, `address`, `postalCode`, `city`, `phone`.
  Mitgesendete `email`/`sellerTypeId` werden ignoriert, nicht validiert, nicht
  mit `400` abgelehnt (api/profile.md Abschnitt 2). Pflichtfeld-Validierung
  (`firstName`, `lastName`, `postalCode`, `city`, `phone`) liefert `400` mit
  `errors` je Feld.

**Domain-Erweiterung:** `Seller` bekommt eine Mutator-Methode
`UpdateProfile(firstName, lastName, address, postalCode, city, phone)` analog
zu den Pflichtfeld-Prüfungen in `Register`. `ISellerRepository` bekommt
`UpdateAsync` (bisher nur `AddAsync`/`GetByEmailAsync` o.ä. — Register ist der
einzige bisherige Schreibpfad).

**`BAR.Host/Features/Profile/ProfileEndpoints.cs`:**
- `GET /api/profile` — `authenticated`, `sub`-Claim → `sellerId`.
- `PUT /api/profile` — `authenticated`, `ValidationFilter` für 400.
- In `Program.cs` registrieren (`app.MapProfileEndpoints()`), analog
  `MapBlocksEndpoints()`.
- `/api/profile/email`, `/api/profile/password`, `DELETE /api/profile`
  bleiben für R07 — nicht anlegen, auch nicht als Stub.

## Frontend

**`shared/verkaeufer-nummer/`** (neue Shared-Component, wiederverwendet später
von Home in R10): `sellerId` als `input()` (required), zeigt `id` im
Klartext (monospace, 24px/800) + Copy-Button (Clipboard + Toast „✓ Nummer
kopiert") + `qr-code` (`size="128"`, leere Caption). Leaf-Komponente, kein
Store, kein HTTP — Parent gibt `sellerId` herein.

**`features/number-blocks/`:**
- `BlocksApiService` (analog `AuthApiService`) — `GET /api/blocks/mine`.
- `block-liste`-Component: reines `<div>`/`<span>`-Markup laut
  `components/block-liste.md` (kein PrimeNG), Empty-State „Noch keine
  Nummernblöcke zugewiesen".
- `NumberBlocksPage` lädt über `BlocksApiService`, rendert `block-liste`.

**`features/profile/`:**
- `ProfileApiService` — `GET`/`PUT /api/profile`.
- `ProfilePage`: `p-tabs`-Gerüst mit 3 Tabs. Tab „Steckbrief" voll
  funktional: Panel 00 (`verkaeufer-nummer`, `sellerId` = `id` aus
  `GET /api/profile`), Panel 01 (Personendaten), Panel 02 (Kontakt, E-Mail
  readonly), Panel 03 (Konditionen, alles readonly, `sellerType` aus der
  Response). Speichern → `PUT /api/profile`, Erfolg: Toast „✓ Profil
  gespeichert", Fehler: eingegebene Werte bleiben, Error-InfoArea „Profil
  konnte nicht gespeichert werden" (AC-7/AC-8). Pflichtfeld-Fehler vom Backend
  (`400`, `errors`) werden unter dem jeweiligen Feld angezeigt (AC-3).
  Tabs „Zugangsdaten" und „Löschen" sind angelegt, aber deaktiviert
  (`disabled`) mit Hinweistext „Verfügbar ab R07" — kein Formular, kein
  API-Aufruf dahinter.

## Fehlerbehandlung

- `PUT /api/profile` `400` → Feldfehler im Formular (kein globaler Error-Text).
- Sonstiger `PUT`-Fehler (Netzwerk, `5xx`) → Error-InfoArea, eingegebene Werte
  bleiben erhalten.
- Exclusion-Constraint-Verstoß betrifft in R02 nur die
  Registrierungs-Zuweisung (einziger aktiver Schreibpfad) — dort ist ein
  Constraint-Verstoß praktisch unerreichbar (Vorprüfung deckt bereits alles
  ab, kein weiterer Vergabeweg aktiv). Der Constraint wird trotzdem jetzt
  angelegt, weil er laut Spec Teil der Epic-Definition ist und ein
  Integrationstest ihn gezielt auslöst (zwei parallele Inserts).

## Testing

- **Backend (xUnit):** `UpdateProfileCommandHandler` (Pflichtfeld-Validierung,
  ignorierte `email`/`sellerTypeId`), `GetProfileQueryHandler`
  (SellerType-Auflösung), `NumberBlockAllocator` bleibt unverändert (bereits
  getestet vorausgesetzt). Integrationstest gegen echte Postgres-Instanz:
  zwei parallele Inserts mit überlappendem Bereich → genau einer schlägt am
  Exclusion-Constraint fehl.
- **Frontend (Vitest):** `ProfilePage` (Formular-Validierung, Save
  Erfolg/Fehler-Pfad, readonly-Felder nicht editierbar), `verkaeufer-nummer`
  (Copy-Button, Toast), `block-liste` (Empty-State vs. Liste,
  Sortierung nach `fromNumber`).
- **Manuell:** die 6 „Fertig, wenn"-Punkte aus dem Roadmap-Dokument.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #nummernblock #profil #design
