---
round: Round-25
status: geklärt
---

# Spec: Round 25 — Einstellungen: Systemparameter

## Fein-Spezifikation

### Ziel

Erster Bereich der Einstellungen-Seite: der eine konfigurierbare Systemparameter
`scannerPauseMs`. Löst die in [Round-16/spec.md](../Round-16/spec.md) bewusst als
Code-Konstante (`3000`) angelegte, dort selbst als Nachtrag vorgemerkte Stelle ab.

### Frontend

**Feature-Ordner** `src/app/features/settings/`, Route `/settings`, nur über
`adminGuard` (Round-9) erreichbar.

**`settings-form`** (`features/settings/components/settings-form/`): ein Feld,
exakt nach [settings-form.md](../../../components/settings-form.md) —
[`input-group`](../../../components/input-group/component.md) (Round-16), Anzahl-
Variante, `ms`-Addon, `modes=['keyboard','numpad']`, Numpad `showDecimal="false"`.
Hilfstext erklärt die Wirkung und nennt die Grenzen (500–15.000 ms). „Speichern" →
`PUT /api/settings`. Erfolg → Toast „✓ Einstellungen gespeichert". `400` bei
Wertebereichsverstoß → Feldfehler.

**Ablösung des Round-16-Platzhalters**: `scan-feedback` (Round-16, bisher `3000` als
Code-Konstante) liest `scannerPauseMs` ab jetzt aus einem app-weiten Settings-Signal
(`core/settings/settings.service.ts`, neu, analog `AuthService`-Pattern aus Round-9):
beim App-Start per `GET /api/settings` geladen, im Speicher gehalten (**kein**
`localStorage` — Einstellung des Basars, nicht des Geräts), gilt ab dem nächsten
App-Start des jeweiligen Geräts. Betrifft alle Konsumenten von `scan-feedback` seit
Round-17 (Artikeleingabe) und Round-18 (`scan-dialog`-Kamera-Modus, `pauseMs`-Default).
Reiner Werte-Austausch, keine Änderung an der Komponenten-Schnittstelle.

### Backend

**Domain** (`Bazaar.Domain/Settings/`):
- `Settings`-Aggregate: **genau eine Zeile** pro Installation (kein `Id` im
  fachlichen Sinn — Singleton-Zeile, feste PK z. B. `1`), `ScannerPauseMs` (int,
  500–15.000, Default `3000`).
- Port `ISettingsRepository` (`Get`, `Update` — kein `Add`/`Remove`, die Zeile
  existiert immer ab Migration/Seed).

**Application** (`Bazaar.Application/Settings/`):
- `GetSettingsHandler` (`GET /api/settings`).
- `UpdateSettingsHandler` (`PUT /api/settings`) — Wertebereichsprüfung
  (FluentValidation, 500–15.000) → `400` bei Verstoß.

**Infrastructure**:
- `SettingsRepository : ISettingsRepository` (EF Core, Singleton-Zeile per Seed/
  Migration mit Default `3000` angelegt — analog zum Seed-Admin-Mechanismus aus
  Round-10, aber unbedingt statt „nur beim allerersten Start ohne Benutzer").

**Api** (`Bazaar.Api/Features/Settings/`):
- `GET /api/settings` (`authenticated` — Kassenpersonal braucht den Wert beim
  Scannen, Round-16/17/18), `PUT /api/settings` (`admin`).

### Akzeptanzkriterien

Epic_Einstellungen AC-1. `settings-form.md` AC-1 bis AC-6 vollständig.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Domain-UnitTests: `Settings`-Wertebereichsinvariante.
- Application-UnitTests: `UpdateSettingsHandler` (Grenzfälle 499/500/15000/15001).
- Frontend: `settings-form` (Vitest), `SettingsService`-Integration mit
  `scan-feedback`.
- Architecture-Tests: Schichten-Regel.

### Bewusst nicht in diesem Round

JSON-Import und Benutzerverwaltung — je eigenes Häppchen (→ Round-26/27).
