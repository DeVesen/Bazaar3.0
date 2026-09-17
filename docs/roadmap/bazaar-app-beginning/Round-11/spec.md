---
round: Round-11
status: geklärt
---

# Spec: Round 11 — Marken

## Fein-Spezifikation

### Ziel

Vollständiger Durchstich für Epic_Marken: Marken-Stammdatenverwaltung (Liste, Anlegen,
Bearbeiten, Löschen) mit rollenabhängiger Sichtbarkeit der Aktionen.

### Bewusst offener Punkt (mit Nutzer abgestimmt, 2026-09-17): Artikel-Kopplung

Epic_Marken/`api/master-data.md` verlangen zwei Verhalten, die eine Artikel-Zuordnung
voraussetzen — die Artikel-Entität/-Tabelle existiert aber erst ab
[Round-15](../Round-15/round.md) (Artikel-Übersicht):

- **`articleCount`** in `GET /api/brands` — bis Round-15 liefert der zuständige
  Query-Port konstant `0`.
- **Löschsperre** (`409 brand.in_use`, solange Artikel zugeordnet sind) und
  **Rename-Cascade** (Namensänderung in zugeordnete Artikel nachziehen) —  bis Round-15
  strukturell vorbereitet (Query-Port/Hook vorhanden), aber ohne echte Artikel-Tabelle
  faktisch wirkungslos: Löschsperre greift nie, Cascade tut nichts.

**Entscheidung:** Round-11 implementiert diese drei Stellen gegen Platzhalter-Query-Ports
(klar als solche markiert, mit Verweis auf Round-15). Round-15 muss die echten
Implementierungen nachziehen und den Rename-Hook in `UpdateBrandHandler` verdrahten.
Keine Umsortierung der Rounds.

### Frontend

**Feature-Ordner** `src/app/features/brands/` (Feature-First, [spec.md §7.0.1](../../../requirements/bazaar-app/spec.md)):
- `pages/brands.page.ts` — Integrations-Komponente, injiziert `brands-store.ts`,
  verdrahtet [Table](../../../components/table/component.md) und Popup.
- `data/brands-api.ts` — HTTP-Adapter (`GET/POST/PUT/DELETE /api/brands`).
- `brands-store.ts` — Signals, feature-lokal, In-Memory-Sort/Filter (API liefert
  unpaginiert, siehe [`api/master-data.md`](../../../requirements/bazaar-app/api/master-data.md)).

**Tabelle** (Route `/brands`):
- Spalten: `id`, `name`, `original` (Badge „✓ Original" grün / „Neu" orange),
  `articleCount` — alle sortierbar, Default-Sortierung `name` aufsteigend.
- Aktionsspalte (`edit`, `delete`) nur wenn Rolle Admin (`actionColumn: null` bei
  Kassenpersonal, kein „+ Neu"-Button, siehe [Table §3](../../../components/table/component.md)).
- `emptyText`: „Noch keine Marken. Beim Import aus der Voranmelde-App werden sie mit
  übernommen." (überschreibt den generischen Table-Text, Epic_Marken AC-9).

**`master-data-popup`** (wiederverwendet in [Round-12](../Round-12/round.md) für
Kategorien): liegt in `shared/components/master-data-popup/` — Cross-Feature-Import
zwischen `features/brands` und `features/categories` wäre sonst per ESLint verboten.
Generisch über `@Input() entityLabel`, `@Input() mode: 'create' | 'edit'`, Output
`save({name, original?})`; Titel/Toast-Text übergibt das jeweilige Feature
(„Neue Marke"/„Marke bearbeiten"/„✓ Marke gespeichert").
- Anlegen-Modus: nur Namensfeld, kein `original`-Toggle (Server setzt das Flag aus der
  Rolle).
- Edit-Modus: Namensfeld + `original`-Toggle ([Boolean-Input](../../../components/boolean-input/component.md), Switch-Variante).

### Backend

**Domain** (`Bazaar.Domain/Brand/`):
- `Brand`-Aggregate: `Id` (string, 8 Zeichen, über `IIdGenerator` aus
  [Round-10](../Round-10/spec.md)), `Name` (string, nicht leer), `Original` (bool).
- Port `IBrandRepository` in `Domain/Ports/` (`Add`, `GetById`, `GetAll`,
  `ExistsByNameIgnoreCase`, `Remove`) — kein generisches `IRepository<T>`.

**Application** (`Bazaar.Application/Brands/`):
- `GetBrandsHandler` — alle Marken nach `name` aufsteigend, inkl. `articleCount` über
  `IArticleCountByBrandQuery` (Platzhalter bis Round-15, s. o.).
- `CreateBrandHandler` — Duplikatprüfung (Trim + case-insensitiv) → `409
  brand.name_taken`. `Original` kommt **nicht** aus dem Request-Body, sondern als
  Parameter vom Endpoint aus dem Rollen-Claim (Admin → `true`, Kassenpersonal →
  `false`).
- `UpdateBrandHandler` — Name und/oder `Original` aktualisieren, gleiche
  Duplikatprüfung. Ruft nach erfolgreichem Speichern den Rename-Cascade-Hook auf
  Platzhalter-Query-Port (No-Op bis Round-15, s. o.).
- `DeleteBrandHandler` — `409 brand.in_use`, sobald `IArticleCountByBrandQuery` > 0
  liefert (bis Round-15 nie, s. o.).
- FluentValidation: `CreateBrandCommandValidator`/`UpdateBrandCommandValidator` —
  `name` Pflichtfeld.

**Infrastructure**:
- `BrandRepository : IBrandRepository` — EF Core, `IEntityTypeConfiguration<Brand>`,
  Unique-Index auf `Name` mit case-insensitiver Collation.
- `ArticleCountByBrandQuery`-Platzhalterimplementierung — gibt konstant `0`/`false`
  zurück, Kommentar mit Verweis auf Round-15 (echte Implementierung dort).

**Api** (`Bazaar.Api/Features/Brands/`):
- `GET /api/brands` (`authenticated`), `POST /api/brands` (`authenticated`),
  `PUT /api/brands/{id}` (`admin`), `DELETE /api/brands/{id}` (`admin`) — DTOs exakt
  nach [`api/master-data.md`](../../../requirements/bazaar-app/api/master-data.md).
- Fehler über den globalen `IExceptionHandler` ([Round-2](../Round-2/spec.md)),
  `errorCode`-Werte bereits katalogisiert (`brand.name_taken`, `brand.in_use`).

### Akzeptanzkriterien

Epic_Marken AC-1 bis AC-9 — mit der oben dokumentierten Einschränkung, dass AC-5
(Löschsperre) und die Rename-Cascade bis Round-15 strukturell, aber nicht wirksam
umgesetzt sind (keine Artikel vorhanden, gegen die geprüft werden könnte).

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Domain-UnitTests: `Brand`-Invarianten.
- Application-UnitTests: `CreateBrandHandler`/`UpdateBrandHandler`/`DeleteBrandHandler`
  mit gemockten Ports (inkl. Platzhalter-Query-Port).
- Architecture-Tests: Schichten-Regel (kein Sonderfall gegenüber Auth aus Round-10).
- Frontend: `BrandsPage`/`brands-store`/`master-data-popup` — Vitest, Component- und
  Store-Tests.

### Bewusst nicht in diesem Round

Import aus der Voranmelde-App (→ Einstellungen-Epic), implizites Anlegen über
AutoComplete während der Artikelannahme (entsteht mit dem Artikelannahme-Häppchen,
nutzt aber dieselben Endpoints), Kategorien (eigenes Häppchen, → Round-12).
