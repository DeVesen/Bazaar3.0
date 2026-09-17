---
round: Round-13
status: geklärt
---

# Spec: Round 13 — Verkäufer-Typen

## Fein-Spezifikation

### Ziel

Vollständiger Durchstich für Epic_Verkaeufer_Typen: Verwaltung der Provisions-/Gebühren-
Vorlagen. Das eigentliche Zuweisen zu einem Verkäufer (AC-5/6/7/10) ist laut round.md
bewusst nicht Teil dieses Rounds — das entsteht mit [Round-14](../Round-14/round.md).

### Bewusst offener Punkt (gleiches Muster wie Round-11/12): Verkäufer-Kopplung

`sellerCount` in `GET /api/seller-types` und die Löschsperre (`409
seller_type.in_use`) setzen eine Verkäufer-Tabelle voraus, die erst ab
[Round-14](../Round-14/round.md) existiert. Round-13 implementiert beide Stellen gegen
einen Platzhalter-Query-Port `ISellerCountBySellerTypeQuery` (konstant `0` bis
Round-14) — dieselbe, bereits in Round-11 mit dem Nutzer abgestimmte Entscheidung, hier
nicht erneut zur Diskussion gestellt. Round-14 muss die echte Implementierung
nachziehen.

### Frontend

**Feature-Ordner** `src/app/features/seller-types/`:
- `pages/seller-types.page.ts`, `data/seller-types-api.ts`
  (`GET/POST/PUT/DELETE /api/seller-types`), `seller-types-store.ts` (Signals,
  In-Memory — API unpaginiert).

**Tabelle** (Route `/seller-types`):
- Spalten: `name`, `commissionRate` (%), `itemFee` (€), `sellerCount`, Aktionen —
  **keine ID-Spalte** (der Typ wird über seinen Namen identifiziert, auch
  app-übergreifend beim Import, [entities/verkaeufer-typ.md](../../../requirements/bazaar-app/entities/verkaeufer-typ.md)).
- Default-Sortierung `name` aufsteigend, alle vier Spalten sortierbar.
- Aktionsspalte nur für Admin.
- `emptyText`: „Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt
  werden — mit **+ Neu** beginnen." (Epic_Verkaeufer_Typen AC-11 — die einzige leere
  Liste, die den Betrieb blockiert, da `sellerTypeId` am Verkäufer Pflichtfeld ist).

**`typ-popup`** (`features/seller-types/components/typ-popup/`, **feature-lokal**, nicht
`shared/` — anders als `master-data-popup` wird es innerhalb dieser App nur von diesem
einen Feature verwendet):
- Felder: Name ([Input](../../../components/input/component.md)), Provision-%
  ([InputNumber](../../../components/inputnumber/component.md), Prozent-Variante),
  Gebühr-€ (InputNumber, Geld-Variante).
- Hinweistext im Dialog: Änderungen wirken **nicht rückwirkend** auf bereits
  zugewiesene Verkäufer (Abgrenzung zur Referenz-App, wo Typänderungen live wirken —
  [typ-popup/component.md](../../../components/typ-popup/component.md)).
- Toast „✓ Verkäufer-Typ gespeichert".

### Backend

**Domain** (`Bazaar.Domain/SellerType/`):
- `SellerType`-Aggregate: `Id` (8 Zeichen, `IIdGenerator`), `Name` (nicht leer, unique),
  `CommissionRate` (decimal, 0–100), `ItemFee` (decimal, ≥ 0). Wertebereiche als
  **Domain-Invariante** im Aggregate (nicht nur FluentValidation) — eine Provision von
  150 % darf auch bei einem direkten Aufruf des Handlers nicht entstehen.
- Port `ISellerTypeRepository` in `Domain/Ports/` (`Add`, `GetById`, `GetAll`,
  `ExistsByNameIgnoreCase`, `Remove`).

**Application** (`Bazaar.Application/SellerTypes/`):
- `GetSellerTypesHandler` — alle Typen nach `name` aufsteigend, inkl. `sellerCount`
  über `ISellerCountBySellerTypeQuery` (Platzhalter bis Round-14, s. o.).
- `CreateSellerTypeHandler` — Duplikatprüfung (Trim + case-insensitiv) → `409
  seller_type.name_taken`. Wertebereichsprüfung zusätzlich per FluentValidation vor dem
  Domain-Aufruf (`400` statt `409`/Exception, AC-4).
- `UpdateSellerTypeHandler` — Name/Provision/Gebühr aktualisieren, wirkt **nicht
  rückwirkend** auf bereits zugewiesene Verkäufer (deren Felder sind eigene Kopien,
  siehe [entities/verkaeufer-typ.md](../../../requirements/bazaar-app/entities/verkaeufer-typ.md)) —
  in Round-13 ohnehin ohne Wirkung, da noch keine Verkäufer existieren.
- `DeleteSellerTypeHandler` — `409 seller_type.in_use`, sobald
  `ISellerCountBySellerTypeQuery` > 0 liefert (bis Round-14 nie).
- FluentValidation: `name` Pflichtfeld, `commissionRate` zwischen 0 und 100, `itemFee`
  nicht negativ.

**Infrastructure**:
- `SellerTypeRepository : ISellerTypeRepository` (EF Core, Unique-Index auf `Name`
  case-insensitiv).
- `SellerCountBySellerTypeQuery`-Platzhalterimplementierung — konstant `0`, Kommentar
  mit Verweis auf Round-14.

**Api** (`Bazaar.Api/Features/SellerTypes/`):
- `GET /api/seller-types` (`authenticated` — Kassenpersonal braucht die Liste beim
  Verkäufer-Anlegen), `POST/PUT/DELETE /api/seller-types` (`admin`, **abweichend von
  Marken/Kategorien**: kein Kassenpersonal-seitiges Anlegen, da ein Typ Provision/Gebühr
  trägt, die nicht "implizit erfindbar" sind). DTOs exakt nach
  [`api/seller-types.md`](../../../requirements/bazaar-app/api/seller-types.md).
- `errorCode`: `seller_type.name_taken` (409), `seller_type.in_use` (409) — bereits
  katalogisiert.

### Akzeptanzkriterien

Epic_Verkaeufer_Typen AC-1 bis AC-4, AC-8, AC-9, AC-11 (Tabelle, Anlegen, Duplikat-
/Wertebereichsprüfung, Löschsperre, Rollen-Sichtbarkeit, Leerzustand). **AC-5, AC-6,
AC-7, AC-10** (Zuweisen zu Verkäufer, Typwechsel-Bestätigung, Vorbelegung) gehören zu
[Round-14](../Round-14/round.md) — round.md selbst grenzt das bereits ab.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Domain-UnitTests: `SellerType`-Invarianten (Wertebereichsgrenzen 0/100 für
  `CommissionRate`, negativer `ItemFee`).
- Application-UnitTests: Handler mit gemockten Ports (inkl. Platzhalter-Query-Port).
- Architecture-Tests: Schichten-Regel.
- Frontend: `SellerTypesPage`/`seller-types-store`/`typ-popup` — Vitest.

### Bewusst nicht in diesem Round

Zuweisen eines Typs zu einem Verkäufer inkl. Kopieren der Konditionen und
Typwechsel-Bestätigungsdialog (→ Round-14), Auflösung unbekannter Typnamen beim
JSON-Import (→ Einstellungen-Epic).
