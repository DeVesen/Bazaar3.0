---
id: SPEC-R09
status: draft
updated: 2026-09-10
roadmap: docs/requirements/advance-registration/roadmap/R09-einstellungen.md
---

# R09 — Einstellungen — Design

**Voranmelde-App**

## Kontext

`Settings` existiert als Domain-Entity bereits (`BAR.Domain/Settings/Settings.cs`,
Singleton mit fester Id `"settings"`), aber nur mit `Create(...)`, keiner
Update-Methode. `ISettingsRepository` kennt nur `GetAsync`, kein Schreiben. Kein
Seed irgendwo vorhanden — Tabelle bleibt nach Deployment leer, bis der erste
`PUT` läuft; das deckt sich mit `api/public.md`, wo jedes Feld `null` sein darf
und der Endpoint trotzdem `200` liefert. `GET /api/public/info` und
`GetPublicInfoQueryHandler` sind bereits fertig implementiert (lesen dieselbe
Settings-Zeile, lösen `defaultTypeId` gegen `ISellerTypeRepository` auf) — R09
ergänzt nur die Admin-Schreibseite. `markdown-text`-Komponente
(`app-markdown-text`, Input `content`) existiert fertig im Frontend. Admin-Guard
(`admin.guard.ts`), Sidebar-Eintrag „Einstellungen" und Platzhalter-Route
(`features/settings/`) existieren ebenfalls schon.

## Entscheidungen aus dem Brainstorming

1. **Kein Seed:** Der leere Zustand direkt nach Deployment ist der Normalfall
   (alle Felder `null`), keine Migration mit Default-Werten. Der ungenaue
   Roadmap-Satz „Seeds aus R01 bleiben als Anfangswerte bestehen" ist veraltet
   und wird mit diesem Schritt gegenstandslos.
2. **Eigene `Update()`-Methode** auf `Settings` (statt `Create()` wiederverwenden)
   — klare Trennung Erstanlage vs. Änderung, gleiche Validierung wie `Create`.
3. **Cross-Aggregate-Checks im Application-Handler**, nicht in der Domain:
   `defaultTypeId`-Existenz (`ISellerTypeRepository`) und `startNumber`-Konflikt
   (`IArticleQueries`) werden vor `Settings.Update(...)` geprüft. Die Domain-Methode
   kennt nur Reihenfolge/Ranges/Länge.
4. **`GET` vor erster Speicherung:** `startNumber`/`blockSize`/`defaultBlockCount`
   sind dann ebenfalls `null` im Response (konsistent mit allen anderen Feldern),
   keine versteckten technischen Defaults.

## Backend

### Domain (`BAR.Domain/Settings/Settings.cs`)

Neue Instanzmethode `Update(registrationDeadline, dropOffFrom, dropOffUntil,
bazaarFrom, bazaarUntil, defaultTypeId, infoText, startNumber, blockSize,
defaultBlockCount)` — gleiche Parameterliste wie `Create`. Prüft:

- Terminreihenfolge aufsteigend (`registrationDeadline ≤ dropOffFrom ≤
  dropOffUntil ≤ bazaarFrom ≤ bazaarUntil`), `null`-Termine werden beim
  Vergleich übersprungen (Teilkonfiguration bleibt erlaubt)
- `startNumber`, `blockSize`, `defaultBlockCount` jeweils `> 0`
- `infoText` Länge `≤ 4000` Zeichen (Rohtext)

Verstöße werfen dieselbe Art Domain-Exception wie `Create` bereits nutzt; das
Application-Handler-Mapping übersetzt sie nach `400` mit den passenden
`errors.<feld>`-Einträgen aus `api/settings.md`.

### Ports (`BAR.Domain/Ports/ISettingsRepository.cs`)

Neue Methode `SaveAsync(Settings settings, CancellationToken ct)` — Upsert:
Insert falls noch keine Zeile mit `SingletonId = "settings"` existiert, sonst
Replace der bestehenden Zeile. Kein separates `AddAsync` nötig.

### Infrastructure (`BAR.Infrastructure/Persistence/Repositories/SettingsRepository.cs`)

`SaveAsync` prüft per `GetAsync` (oder EF-Tracking), ob die Zeile existiert,
und wählt `Add`/`Update` entsprechend. `SettingsConfiguration.cs` unverändert.

### Application (`BAR.Application/Settings/`)

**`GetSettingsQueryHandler`** — lädt via `ISettingsRepository.GetAsync()`,
mappt auf DTO. Existiert die Zeile noch nicht: DTO mit allen Feldern `null`.

**`UpdateSettingsCommandHandler`** — Ablauf:

1. `defaultTypeId` (falls nicht `null`) gegen `ISellerTypeRepository` prüfen →
   `400 errors.defaultTypeId: ["Unbekannter Verkäufer-Typ"]`, wenn unbekannt.
2. Höchste vergebene Artikelnummer via `IArticleQueries` holen → `409
   errorCode: settings.start_number_conflict`, wenn `startNumber` darüber liegt.
3. Bestehende `Settings` laden (`GetAsync`); existiert sie, `existing.Update(...)`
   aufrufen; existiert sie nicht, `Settings.Create("settings", ...)` mit den
   Request-Werten (identische Validierung wie `Update`, da beide dieselben
   Invarianten prüfen).
4. Domain wirft bei Reihenfolge-/Range-/Längenverstoß → Application mappt auf
   `400` mit feldbezogenen Fehlern.
5. `SaveAsync` → `200` mit gespeichertem Objekt.

### Host (`BAR.Host/Features/Settings/SettingsEndpoints.cs`)

| Endpoint | Handler | Auth |
|---|---|---|
| `GET /api/settings` | `GetSettingsQueryHandler` | `admin` |
| `PUT /api/settings` | `UpdateSettingsCommandHandler` | `admin` |

`PUT` nutzt `ValidationFilter<UpdateSettingsCommand>` für Basis-Validierung:
Pflichtfelder, `startNumber`/`blockSize`/`defaultBlockCount` müssen im Request
gesetzt und `> 0` sein (anders als Termine/`defaultTypeId`/`infoText`, die
`null` sein dürfen). Domain-/Cross-Aggregate-Fehler werden über bestehendes
Exception-Mapping (analog `ArticleNumberConflictException` → `409`) auf
HTTP-Codes übersetzt.

`GetPublicInfoQueryHandler`/`PublicInfoEndpoints` bleiben unverändert.

## Frontend

### `features/settings/pages/SettingsPage.ts`

Ersetzt den Platzhalter durch das vollständige Formular gemäß
`components/einstellungen-form.md`:

- **Basar-Konfiguration:** 5× `p-datepicker` (Datum+Uhrzeit) für die Termine,
  `p-select` (Dropdown) für `defaultTypeId`, Optionen aus dem bestehenden
  Seller-Types-Endpoint (R05).
- **Nummernblock-Parameter:** 3× `p-inputnumber` (`startNumber`, `blockSize`,
  `defaultBlockCount`), Hinweistext unter `blockSize`: „Bestehende Blöcke
  behalten ihre Größe" (AC-5).
- **Info-Text:** `pTextarea` (min. 8 Zeilen, resizable), `maxlength="4000"`,
  Zeichenzähler `n / 4000` rechtsbündig (ab 3800 Warnfarbe), daneben live
  `<app-markdown-text [content]="infoTextControl.value">` als Vorschau
  (50/50 Desktop, untereinander ≤768px), Platzhalter „Keine Vorschau —
  Info-Text ist leer" bei leerem Feld. ⓘ-Icon (`p-popover`) neben dem
  Abschnittstitel mit der Markdown-Element-Tabelle aus `markdown-text.md`
  Abschnitt 3.1 (Inhalt von dort übernommen, keine zweite Quelle) plus Hinweis
  „Nicht aufgeführte Syntax bleibt als Klartext stehen."
- **Speichern:** `p-button` primary, lädt bei Erfolg Toast „✓ Einstellungen
  gespeichert" (analog bestehendem Save-Feedback-Pattern), bei `400`
  Feldfehler an den jeweiligen Controls, bei `409` generische `InfoArea`-Meldung
  „Startnummer liegt über bereits vergebenen Artikelnummern" (Pattern aus
  Commit `15826a2`).

### Guard

Prüfen, ob `admin.guard.ts` bereits auf der `/settings`-Route sitzt (Explore-Fund
war unklar); falls nicht, in `settings.routes.ts` nachziehen — AC „als
Verkäufer weder sichtbar noch direkt erreichbar" verlangt es explizit.

## Testing

- **Domain:** `SettingsTests.cs` um `Update()`-Fälle erweitern — Reihenfolge
  OK/verletzt (inkl. `null`-Termine übersprungen), Range-Verstöße je Zahl,
  Längengrenze `infoText`.
- **Application:** Handler-Tests für `UpdateSettingsCommandHandler` — `400` bei
  unbekanntem `defaultTypeId`, `409` bei `startNumber`-Konflikt, Erstanlage- vs.
  Update-Pfad, Erfolgsfall; `GetSettingsQueryHandler` mit/ohne vorhandene Zeile.
- **Integration/API:** `GET`/`PUT /api/settings` End-to-End — Auth admin-only,
  Vollersetzung, alle Fehlerfälle — analog bestehenden Seller-Types-Tests.
- **Frontend:** Component-Spec für das Formular — Live-Vorschau-Update bei
  Eingabe, Zeichenzähler-Grenze/Warnfarbe, Popover öffnet mit Syntax-Tabelle,
  Save-Erfolg/-Fehlerfälle (400/409), Guard-Test falls neu ergänzt.

## Akzeptanzkriterien (aus Roadmap/Epic, unverändert)

Siehe [R09-einstellungen.md](../../requirements/advance-registration/roadmap/R09-einstellungen.md)
Abschnitt „Fertig, wenn" sowie [Epic_Einstellungen](../../requirements/advance-registration/epics/Epic_Einstellungen/epic.md)
AC-1 bis AC-9 und [einstellungen-form.md](../../requirements/advance-registration/components/einstellungen-form.md)
AC-F1 bis AC-F6.

## Nicht in diesem Schritt

- Countdown-Anzeige und Timeline-Darstellung — R10 und R11.
- Export — R12.
- Seed-/Default-Daten für den Erstzustand.
