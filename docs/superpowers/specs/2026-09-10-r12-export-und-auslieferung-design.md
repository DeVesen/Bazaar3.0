---
id: SPEC-R12
status: draft
updated: 2026-09-10
---

# Design: R12 — Export und Auslieferung (ohne Deployment)

## Index
- Kontext
- Scope
- 1. Export-Feature
- 2. i18n-Vervollständigung
- 3. Responsive-Durchgang
- Ausdrücklich nicht Teil dieses Plans
- Testing
- Tags & Piles

---

## Kontext

Quelle: [`roadmap/R12-export-und-auslieferung.md`](../../requirements/advance-registration/roadmap/R12-export-und-auslieferung.md),
[`epics/Epic_Export/epic.md`](../../requirements/advance-registration/epics/Epic_Export/epic.md),
[`api/export.md`](../../requirements/advance-registration/api/export.md).

R12 bündelt in der Roadmap vier Teile: Export-Feature, EN-Übersetzung, Responsive-Durchgang,
Azure-Deployment. Dieser Plan deckt die ersten drei Teile ab. Das Azure-Deployment ist bewusst
ausgeklammert (siehe unten) und wird als eigener Auftrag geplant, sobald Subscription/Zugang
geklärt sind.

Bestandsaufnahme (Explore-Agent, 2026-09-10):

| Bereich | Ist-Zustand |
|---|---|
| Backend Query-Ports | Muster existiert 2x (`IArticleQueries`, `ISellerListQuery`) — direkt übertragbar |
| `BAR.Application/Export/`, `BAR.Host/Features/Export/` | Leere Scaffold-Ordner, nur `.gitkeep` |
| Frontend `ExportPage` | Stub, nur `<h1>Export</h1>` |
| Blob-Download-Pattern | Existiert nirgends im Repo — muss neu gebaut werden |
| i18n | ngx-translate; `de.json` 26 Keys, `en.json` = `{}` (0 % gefüllt) |
| Responsive | Kein zentrales Breakpoint-SCSS; 768px 4x hart dupliziert; 1024px (Tablet) fehlt komplett |

---

## Scope

Reihenfolge: **Export-Feature → i18n-Vervollständigung → Responsive-Durchgang**. Kein harter
Abhängigkeitszwang zwischen den drei Teilen, aber jeder Teil endet in einem lauffähigen Stand.

---

## 1. Export-Feature

### Backend

Folgt 1:1 dem bestehenden Query-Port-Muster (`ISellerListQuery` / `SellerListQuery`,
`BAR.Domain/Ports/Queries/ISellerListQuery.cs`, `BAR.Infrastructure/Persistence/Queries/SellerListQuery.cs`):

- `IExportQuery` in `BAR.Domain/Ports/Queries/` — `Task<ExportResult> ExecuteAsync(bool includeBrands, bool includeCategories)`.
  Result-Record(s) im selben File, Struktur nach Schema in `api/export.md`.
- `ExportQuery` (EF Core, LINQ direkt gegen `BarDbContext`, Primary-Constructor-DI) in
  `BAR.Infrastructure/Persistence/Queries/`. Filtert serverseitig auf Verkäufer mit
  mindestens einem eigenen Artikel (Epic_Export §1, AC-2). Admins zählen wie Verkäufer.
  `sellerType` als Name (nicht Id). `brands`/`categories` als Namens-Arrays, leer wenn nicht
  angefordert (nie fehlend).
- Application Query + Handler in `BAR.Application/Export/` (Ordner existiert bereits leer),
  mappt Query-Result auf das Response-DTO nach `api/export.md`-Schema, inkl. ISO-8601
  `exportedAt`.
- Minimal-API-Endpoint in `BAR.Host/Features/Export/ExportEndpoints.cs` (Ordner existiert
  bereits leer), Muster wie `SellersEndpoints.cs`: `admin`-Auth, `GET /api/export` mit
  Query-Parametern `includeBrands`, `includeCategories` (beide Default `false`).
  Antwort: `Content-Disposition: attachment; filename="basar-export-YYYY-MM-DD.json"`
  (Datum aus Serverzeit), Body = JSON-ASCII nach Schema.
- Nicht exportiert: `isAdmin`, `passwordHash`, `inviteToken`, `inviteTokenExpiresAt`,
  Nummernblöcke, Refresh-Tokens, `original`-Flag der Stammdaten.

### Frontend

`ExportPage` (`features/export/pages/ExportPage.ts`) ist Stub, wird neu aufgebaut:

- Zwei Checkboxen („Marken einschließen", „Kategorien einschließen", beide unchecked
  default), Export-Button.
- `HttpClient`-Aufruf mit `responseType: 'blob'` gegen `GET /api/export`; Dateiname wird aus
  dem `Content-Disposition`-Response-Header geparst (kein Blob-Download-Pattern existiert
  bisher im Repo — neu bauen); Browser-Download über das Blob auslösen. Kein
  clientseitiger Aufbau der Export-Datei.
- Nach erfolgreichem Download: heruntergeladenes JSON clientseitig parsen ausschließlich zur
  Zählung (kein zweiter Request), Anzahl exportierter Verkäufer und Artikel in shared
  `info-area` (Typ `info`, kein Auto-Dismiss, bleibt stehen) anzeigen — abweichend vom
  Standard-Toast-Muster in `cross-cutting.md` §7 (Epic_Export AC-4).

---

## 2. i18n-Vervollständigung

- `en.json` ist aktuell `{}`. Alle 26 bestehenden DE-Keys aus `de.json` vollständig ins
  Englische übersetzen, gleiche flache Key-Struktur.
- Neue Export-Feature-Texte (Checkbox-Labels, Button, info-area-Meldung mit Platzhaltern für
  die Zähler) werden in `de.json` und `en.json` gleichzeitig angelegt, nicht erst Deutsch
  fertigstellen und Englisch nachziehen.
- Kein Tooling für Key-Diff/Vollständigkeitsprüfung wird eingeführt (YAGNI, aktuell auch
  keine CI-Pipeline im Repo vorhanden, die das ausführen könnte). Vollständigkeit wird von
  Hand geprüft: Sprache umstellen, jede Seite durchklicken — deckt sich mit
  Fertig-Kriterium 5 aus `roadmap/R12-export-und-auslieferung.md`.

---

## 3. Responsive-Durchgang

- Neue geteilte `_breakpoints.scss` (Ort: bestehende geteilte Styles-Ablage im Frontend, wo
  auch `_modal.scss` liegt) mit SCSS-Mixins für die drei Stufen aus spec.md §10.1: Desktop
  (>1024px), Tablet (≤1024px), Mobile (≤768px).
- Die 4 bestehenden Hardcode-Stellen werden auf die Mixins umgestellt — reines Refactoring,
  kein Verhaltenswechsel:
  - `core/shell/shell.scss:19`
  - `features/login/components/login-layout.scss:14`
  - `features/profile/pages/ProfilePage.scss:26`
  - `styles/_modal.scss:24`
- Danach wird jede Seite der App bei 1280px, 1024px und 375px gegen die §10.1-Tabelle
  (Sidebar-, Titelleisten- und Modal-Verhalten je Breakpoint) durchgeklickt. Fehlende
  Tablet-Anpassungen (1024px existiert aktuell nirgends) werden dabei ergänzt.
- Kein zusätzliches Dokument zur Responsive-Regel — spec.md §10.1 bleibt einzige normative
  Quelle. Branding/Farben separat in `design/industry-styleguide.md`, davon unberührt.

---

## Ausdrücklich nicht Teil dieses Plans

- **Azure Container Apps Deployment.** Repo hat aktuell weder Bicep/Terraform noch
  GitHub-Actions-Workflow — nur lokale `Dockerfile`s (Backend, Frontend) und ein
  `compose.yaml` für lokale Entwicklung. Wird als eigener Auftrag geplant, sobald
  Subscription-Details/Zugang klar sind.
- **Demo-Hinweis auf Login-Seite entfernen** (spec.md §12.5) — gehört inhaltlich zum
  Deployment-Schritt (nur in Produktion sichtbar/unsichtbar), wird zusammen mit dem
  Deployment-Auftrag geplant.
- Import auf Haupt-App-Seite — eigenes Vorhaben unter `bazaar-app/`.

---

## Testing

- Backend: Unit-Tests für `ExportQuery`/Handler (Filterung Verkäufer ohne Artikel, leere vs.
  gefüllte Brands/Categories-Arrays, `sellerType` als Name), Integrationstest für den
  Endpoint (Auth `admin`, Content-Disposition-Header, Schema-Konformität).
  Projekt-Konvention (`unit-integration-testing`, `dotnet-xunit-conventions`) anwenden.
- Frontend: Component-Test für `ExportPage` (Checkbox-Zustand, Blob-Aufruf, info-area-Inhalt
  nach Download). Vitest-Konvention (`angular-testing-vitest-conventions`) anwenden.
- Responsive-Durchgang selbst ist laut Roadmap „von Hand prüfbar" — kein automatisierter
  visueller Regressionstest vorgesehen, bleibt manuelle Prüfung bei 1280/1024/375px.

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #r12 #export #i18n #responsive
