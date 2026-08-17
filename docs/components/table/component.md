---
id: C-001
status: draft
updated: 2026-07-31
---

# Component: Table

**Bibliothek:** PrimeNG `p-table` + Virtual Scroll
**Verwendung:** Beide Apps — überall dort, wo Listen von Datensätzen angezeigt werden.

## Index

- Überblick — Konzept
- 1. Grundstruktur — Aufbau
- 2. Input / Output Schnittstelle — Parameter & Events
- 3. Toolbar — Titel & Buttons
- 4. Spalten — Typen & Aktionsspalte
- 5. Sortierung — Modi & Events
- 6. Spalten-Filter — Verhalten & Match-Modi
- 7. Paginierung — Seiten & Größe
- 8. Leerer Zustand — Empty State
- 9. Verhalten bei Aktionen — Edit & Neu
- 10. Responsive — Mobilanpassung
- 11. PrimeNG-Basis — Technische Basis
- 12. Visual Stil — Streifen, Hover & Skeleton
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Wiederverwendbare Listenansicht-Komponente mit Sortierung, Paginierung und Aktionsspalte auf Basis von PrimeNG p-table.

**Verwendungszweck:** Wird in allen Epic-Seiten eingesetzt, die tabellarische Daten anzeigen (Artikel, Verkäufer, Marken, Kategorien, Statistik-Leaderboard).

---

## Überblick

Die Tabelle ist die zentrale Darstellungskomponente für alle Listen (Artikel, Verkäufer, Marken, Kategorien usw.).
Sie ist eine **Dumb Component**: Daten kommen per `@Input()` herein, alle Interaktionen verlassen sie per `@Output()`-Event.
Das Parent entscheidet, ob Sortierung und Filterung lokal in Memory oder als Backend-Request umgesetzt werden.

---

## 1. Grundstruktur

```
┌─────────────────────────────────────────────────────────────────┐
│  [Toolbar]   optional: Titel + „+ Neu"-Button rechts             │
├──────┬──────────┬─────────┬─────────┬────────────────────────────┤
│  Nr.▲│ Spalte 2 │  ... ▼  │  ...    │  ← kein Header, optional  │ ← Datenspalten + opt. Aktionsspalte
│[    ]│ [      ] │ [     ] │ [     ] │                            │ ← Filter pro Datenspalte (kein Filter in Aktionsspalte)
├──────┼──────────┼─────────┼─────────┼────────────────────────────┤
│  ... │   ...    │   ...   │   ...   │  [Btn1]  [Btn2]  ...       │
│  ... │   ...    │   ...   │   ...   │  [Btn1]  [Btn2]  ...       │
├──────┴──────────┴─────────┴─────────┴────────────────────────────┤
│  [Paginierung]                                       optional     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `columns` | `ColumnConfig[]` | `@Input` | Spaltendefinitionen (Schlüssel, Titel, Typ, sortierbar, filterbar, Match-Modi, Enum-Werte) |
| `data` | `T[]` | `@Input` | Anzuzeigende Datensätze |
| `totalRecords` | `number` | `@Input` | Gesamtanzahl für Paginierung |
| `loading` | `boolean` | `@Input` | Zeigt Lade-Skeleton an wenn `true` |
| `actionColumn` | `ActionColumnConfig \| null` | `@Input` | Definiert die Aktionsspalte inkl. aller Buttons. `null` = keine Aktionsspalte. |
| `sortChange` | `SortEvent` | `@Output` | Emittiert bei Sortierungsänderung (Spalte + Richtung) |
| `filterChange` | `FilterEvent` | `@Output` | Emittiert bei Filteränderung (alle aktiven Spalten-Filter) |
| `pageChange` | `PageEvent` | `@Output` | Emittiert bei Seitenwechsel oder Seitengrößenänderung |
| `actionClick` | `ActionClickEvent` | `@Output` | Emittiert `{ actionId, row }` bei Klick auf einen Action-Button |
| `rowAdd` | `void` | `@Output` | Emittiert bei Klick auf „+ Neu"-Button in der Toolbar |

Das Parent ist verantwortlich für:
- Datenladen und Aktualisierung von `data` und `totalRecords`
- Entscheidung: lokale In-Memory-Filterung/-Sortierung **oder** neuer Backend-Request

---

## 3. Toolbar

Die Toolbar erscheint **oberhalb** der Tabelle und ist optional.

| Element | Position | Wann |
|---|---|---|
| Seitenüberschrift / Epic-Titel | links | immer |
| „+ Neu"-Button | rechts | nur wenn Anlegen erlaubt |

Fehlt die Berechtigung zum Anlegen, entfällt der „+ Neu"-Button vollständig — kein deaktivierter Button.

---

## 4. Spalten

### Spaltentypen

| Typ | Darstellung | Beispiel |
|---|---|---|
| Text | Plaintext | Bezeichnung, Name |
| Zahl | Rechtsbündig | Nr., Menge |
| Währung | Rechtsbündig, 2 Dezimalstellen | Preis |
| Datum | Lokales Format (`dd.MM.yyyy`) | Erstellt Am |
| Badge | `p-tag` mit Severity | Status |

### Aktionsspalte

Die Aktionsspalte ist **optional** — sie wird nur gerendert wenn das Parent `actionColumn` als `@Input` übergibt. Ist `actionColumn` `null`, entfällt die Spalte vollständig.

Wenn vorhanden:
- Immer die **letzte Spalte**
- **Keine Spaltenüberschrift**
- **Kein Filterfeld**
- **Nicht sortierbar**

**Layout:** `display: flex; gap: 6px; align-items: center` — beliebig viele Elemente nebeneinander (1 bis N).

**Elemente:** Typischerweise `p-button [text]="true" [rounded]="true"` (kein Hintergrund, nur Icon), aber das Parent kann beliebige Elemente definieren.

**Events:** Klick auf einen Action-Button emittiert `actionClick` mit `{ actionId: string, row: T }`.
Das Parent wertet `actionId` aus und entscheidet die Reaktion — die Komponente kennt keine Semantik.

**Typische actionIds:**

| `actionId` | Icon | Bedeutung |
|---|---|---|
| `edit` | `pi-pencil` | Datensatz bearbeiten |
| `view` | `pi-search` | Datensatz ansehen (readonly) |
| `delete` | `pi-trash` | Datensatz löschen |

Die konkreten Actions je Epic definiert das jeweilige Epic-Dokument.

---

## 5. Sortierung

Jede Spalte ist standardmäßig sortierbar. Das Epic-Dokument kann einzelne Spalten explizit als nicht-sortierbar ausweisen.

### Sortiermodi

| Modus | Bedienung | Verhalten |
|---|---|---|
| **Single-Sort** | Klick auf Spaltenheader | ▲ aufsteigend → ▼ absteigend → unsortiert |
| **Multi-Sort** | Shift + Klick auf weiteren Header | Nummeriertes Badge ①②③ pro aktiver Sortierspalte |

### Sortierpfeil-Anzeige

- Aktiv aufsteigend: `▲` (oder PrimeNG-Standardpfeil nach oben) im Spaltenheader
- Aktiv absteigend: `▼` (oder Pfeil nach unten)
- Inaktiv / unsortiert: kein Pfeil oder gedimmter Doppelpfeil

### Output

Jede Sortierungsänderung emittiert `sortChange` mit dem aktuellen Sort-State:

```
sortChange → [{ field: 'name', order: 'asc' }, { field: 'price', order: 'desc' }]
```

Das Parent entscheidet: Array lokal umsortieren — oder Backend-Request mit Sort-Parametern auslösen.

---

## 6. Spalten-Filter

Filterbare Spalten (Standard: alle außer Aktionsspalte) zeigen ein **Trichter-Icon** im Spaltenheader.
Basis: PrimeNG `p-columnFilter` mit `display="menu"`.

### Verhalten

Klick auf das Trichter-Icon öffnet ein **Overlay-Menü** mit folgendem Aufbau:

```
┌──────────────────────────────┐
│  [Eingabefeld / Freitext   ] │  ← pInputText (bei Freitext-Spalten)
│                              │
│  [gleich] [enthält] [endet…] │  ← Match-Mode-Auswahl (Button-Group)
│                              │
│ ─────────────────────────── │  ← Divider (nur wenn filterOptions gesetzt)
│  ○ Wert A                    │  ← Preset-Werte (z. B. Enum), mit "gleich"
│  ○ Wert B                    │
│  ○ Wert C                    │
│                              │
│       [Leeren]   [Anwenden]  │
└──────────────────────────────┘
```

- Der Filter-State der Komponente ist zustandslos: **kein internes Speichern** — das Parent verwaltet den Zustand
- Jede Filteränderung emittiert `filterChange` mit allen aktuell aktiven Filtern

```
filterChange → { name: { value: 'Nike', matchMode: 'contains' }, status: { value: 'active', matchMode: 'equals' } }
```

### Match-Modi

Das Parent legt **pro Spalte** fest, welche Match-Modi angeboten werden:

| Match-Mode | Bedeutung | Typisch für |
|---|---|---|
| `equals` | gleich | Zahlen, Enum, Badge |
| `startsWith` | beginnt mit | Text |
| `contains` | enthält | Text |
| `endsWith` | endet mit | Text |
| `lt` / `lte` | kleiner / kleiner gleich | Zahl, Währung, Datum |
| `gt` / `gte` | größer / größer gleich | Zahl, Währung, Datum |

Gibt das Parent **keine** `matchModes` an, verwendet die Komponente einen sinnvollen Standardsatz abhängig vom Spalten-`type`:

| Spaltentyp | Standard-Match-Modi |
|---|---|
| `text` | `contains`, `startsWith`, `endsWith`, `equals` |
| `number`, `currency` | `equals`, `lt`, `lte`, `gt`, `gte` |
| `date` | `equals`, `lt`, `lte`, `gt`, `gte` |
| `badge` | `equals` |

### Enum / Preset-Werte (`filterOptions`)

Gibt das Parent `filterOptions` für eine Spalte an, erscheint nach dem Divider eine **auswählbare Liste** der vordefinierten Werte (PrimeNG `p-listbox` oder `p-multiSelect`).
Diese Werte werden immer mit `equals` gefiltert — kein Match-Mode-Selector für diesen Bereich.

Freitext-Eingabe und Preset-Liste sind unabhängig voneinander: beide können gleichzeitig aktiv sein.

### `ColumnConfig`

```ts
interface ColumnConfig {
  field: string;
  header: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'badge';
  sortable?: boolean;                              // default: true
  filterable?: boolean;                            // default: true
  matchModes?: MatchMode[];                        // erlaubte Filter-Modi; fehlt → Typ-Standard
  filterOptions?: { label: string; value: any }[]; // Enum-Preset-Werte unterhalb des Dividers
}

type MatchMode = 'equals' | 'startsWith' | 'contains' | 'endsWith'
               | 'lt' | 'lte' | 'gt' | 'gte';
```

### Parent-Entscheidung

| Strategie | Wann sinnvoll |
|---|---|
| **In-Memory** | Kleine Datenmenge komplett geladen, kein Backend nötig |
| **Backend-Request** | Große Datenmenge, serverseitige Filterung erforderlich (Virtual Scroll) |

Die Komponente kennt diese Entscheidung nicht — sie emittiert nur.

---

## 7. Paginierung

Wird aktiviert, wenn die Datenmenge eine definierte Schwelle überschreitet (Standard: **25 Zeilen**).

- Position: unterhalb der Tabelle, rechtsbündig
- Seitengrößen-Auswahl: `[10, 25, 50]`
- Anzeige: `„Zeige X – Y von Z Einträgen"`
- Bei weniger Einträgen als die kleinste Seitengröße: Paginierung wird **ausgeblendet**
- Jeder Seiten- oder Größenwechsel emittiert `pageChange`

---

## 8. Leerer Zustand (Empty State)

Sind keine Datensätze vorhanden (oder liefert der aktive Filter kein Ergebnis):

```
Keine Einträge gefunden.
```

Mit aktivem Filter:

```
Keine Einträge für den gewählten Filter gefunden.
```

Kein Icon, kein Button — nur Text, zentriert.

### Überschreibbarer Erstfall-Text

Der Text für „keine Datensätze, kein Filter" ist über einen **Input überschreibbar**
(`emptyText`); der Filter-Text bleibt fest.

Grund für die Unterscheidung: Der Filterfall ist überall derselbe — der Nutzer hat gerade
gefiltert und weiß es. Der Erstfall ist dagegen je Liste unterschiedlich aussagekräftig. Wo
eine leere Liste der **erwartbare Anfangszustand** ist, gehört dort der nächste Schritt hin
statt einer Feststellung.

Überschrieben wird nur, wo es einen Unterschied macht — nicht durchgängig:

| Liste | Erstfall-Text |
|---|---|
| Marken, Kategorien (Haupt-App) | „Noch keine Marken. Beim Import aus der Voranmelde-App werden sie mit übernommen." |
| Verkäufer-Typen (Haupt-App) | „Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit **+ Neu** beginnen." |
| Leaderboard (Statistik) | „Noch keine Verkäufe." |
| Artikel, Benutzer | generisch, keine Überschreibung |
| Meine Artikel (Voranmelde-App) | „Noch keine Artikel angemeldet. Mit **+ Neu** den ersten anlegen." |
| Alle Artikel (Voranmelde-App, Admin) | „Noch hat kein Verkäufer Artikel angemeldet." |
| Verkäufer (Voranmelde-App, Admin) | „Noch keine Verkäufer registriert." |
| Verkäufer-Typen (Voranmelde-App) | „Noch keine Verkäufer-Typen. Ohne Typ ist keine Registrierung möglich — mit **+ Neu** beginnen." |
| Marken, Kategorien (Voranmelde-App) | generisch — Verkäufer legen sie beim Erfassen selbst an |

Der Hinweis bei den Verkäufer-Typen ist in beiden Apps der wichtigste: Es ist die einzige
leere Liste, die die App **blockiert** — `sellerTypeId` ist am Verkäufer ein Pflichtfeld. In
der Voranmelde-App wiegt das schwerer, weil dort die **Selbstregistrierung** daran scheitert
und mit `registration.not_enabled` abgelehnt wird, ohne dass ein Admin es merkt
([`advance-registration/api/cross-cutting.md`](../../requirements/advance-registration/api/cross-cutting.md)).

**Marken und Kategorien brauchen in der Voranmelde-App keinen Sondertext**, obwohl sie in
der Haupt-App einen haben: Dort sind sie reine Import-Empfänger, hier entstehen sie
beiläufig über die `+`-Anlage im Artikel-Dialog. Eine leere Liste ist der normale
Anfangszustand und kein Handlungsbedarf für den Admin.

**Nicht-Tabellen-Listen erben diesen Zustand nicht.** Karten-Grids, Sitzungslisten und
Modal-Inhalte definieren ihn selbst; für die Haupt-App stehen sie in
[`seller-card`](../../requirements/bazaar-app/components/seller-card.md),
[`intake-wizard`](../../requirements/bazaar-app/components/intake-wizard.md),
[`seller-detail-modal`](../../requirements/bazaar-app/components/seller-detail-modal.md) und
[`import-panel`](../../requirements/bazaar-app/components/import-panel.md).

---

## 9. Verhalten bei Aktionen (Edit / Neu)

- **Bearbeiten:** Edit-Button emittiert `rowEdit` mit dem Datensatz — Parent öffnet Dialog.
- **Neu anlegen:** „+ Neu"-Button emittiert `rowAdd` — Parent öffnet Dialog im Anlegen-Modus.
- Nach Speichern oder Löschen im Dialog: Parent aktualisiert `data` — Tabelle rendert automatisch neu.

---

## 10. Responsive

| Viewport | Verhalten |
|---|---|
| Desktop (≥ 1024 px) | Alle Spalten sichtbar |
| Tablet (768–1023 px) | Unwichtige Spalten ausgeblendet (je Epic definiert) |
| Mobil (< 768 px) | Gestapelte Darstellung (`responsiveLayout="stack"`) |

---

## 11. PrimeNG-Basis

```
p-table
  [sortMode]="'multiple'"        ← Single + Multi-Sort
  [virtualScroll]="true"         ← Nur sichtbare Zeilen rendern
  [virtualScrollItemSize]="46"   ← Zeilenhöhe in px (Basis-Wert, je Epic anpassen)
  [lazy]="true"                  ← Parent lädt Daten bei Sort/Filter/Page-Events
  (onSort)="…"
  (onFilter)="…"
  (onPage)="…"
```

Virtual Scroll sorgt dafür, dass auch bei großen Datenlisten (tausende Zeilen) nur die sichtbaren Zeilen im DOM gerendert werden — Performance bleibt konstant.

Spalten-Filter: `p-columnFilter` mit `display="menu"` — öffnet ein Overlay-Menü mit Eingabefeld, Match-Mode-Auswahl und optionaler Preset-Liste.
Match-Modi pro Spalte: `[matchModeOptions]` auf `p-columnFilter`.
Enum-Preset-Werte: `<ng-template pTemplate="filter">` mit `p-listbox` oder `p-multiSelect`.

---

## 12. Visual Stil

### 12.1 Striped Rows

Jede zweite Tabellenzeile erhält einen abweichenden Hintergrund:

| Zeile | Hintergrund |
|---|---|
| Ungerade (1., 3., …) | Weiß (Standard) |
| Gerade (2., 4., …) | `#FAFAFA` |

PrimeNG-Attribut: `[stripedRows]="true"` am `p-table`-Element.

### 12.2 Hover-Highlight

Beim Überfahren einer Zeile mit der Maus wird diese optisch hervorgehoben.

PrimeNG-Attribut: `[rowHover]="true"` am `p-table`-Element.
Die Hover-Farbe folgt dem aktiven PrimeNG-Theme (`var(--p-datatable-row-hover-background)`).

### 12.3 Loading-Skeleton

Solange `loading = true` (beim **ersten** Laden), werden anstelle der echten Zeilen **5 Skelett-Zeilen** als Shimmer-Platzhalter dargestellt:

- Jede Skelett-Zeile enthält pro Datenspalte ein `p-skeleton`-Element
- Während des Ladens sind Filter und Sortierung inaktiv
- Sobald `loading = false` und `data` befüllt ist, verschwinden die Skelett-Zeilen

PrimeNG-Umsetzung: `[loading]="loading"` am `p-table`-Element mit `<ng-template pTemplate="loadingbody">`.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN eine sortierbare Spalte geklickt wird, THEN SHALL das System die Tabelle nach dieser Spalte aufsteigend sortieren und das Sortier-Icon auf `▲` setzen.
2. **AC-2** — WHEN dieselbe sortierbare Spalte erneut geklickt wird, THEN SHALL das System die Sortierreihenfolge auf absteigend umkehren und das Sortier-Icon auf `▼` setzen.
3. **AC-3** — WHEN Shift+Klick auf eine weitere sortierbare Spalte erfolgt, THEN SHALL das System Multi-Sort aktivieren und nummerierte Badges ①②③ an den aktiven Sortier-Spalten einblenden.
4. **AC-4** — WHEN die Anzahl der Einträge die konfigurierte Seitengröße überschreitet, THEN SHALL das System eine Paginierungs-Leiste mit Seitengrößen-Auswahl `[10, 25, 50]` und der Anzeige „Zeige X – Y von Z Einträgen" unterhalb der Tabelle einblenden.
5. **AC-5** — WHEN ein Action-Button in der Aktionsspalte geklickt wird, THEN SHALL das System das Event `actionClick` mit `{ actionId, row }` emittieren.
6. **AC-6** — WHEN keine Datensätze vorhanden sind und kein Filter aktiv ist, THEN SHALL das System den Text „Keine Einträge gefunden." zentriert anzeigen — oder den über `emptyText` übergebenen Text, falls gesetzt.
7. **AC-7** — WHEN ein aktiver Filter kein Ergebnis liefert, THEN SHALL das System den Text „Keine Einträge für den gewählten Filter gefunden." zentriert anzeigen.
8. **AC-8** — WHEN die Tabelle gerendert wird, THEN SHALL jede zweite Datenzeile den Hintergrund `#FAFAFA` erhalten (Striped Rows).
9. **AC-9** — WHEN der Mauszeiger über eine Tabellenzeile bewegt wird, THEN SHALL die Zeile optisch hervorgehoben werden (Hover-Highlight).
10. **AC-10** — WHEN `loading = true` ist, THEN SHALL die Tabelle anstelle der Datenzeilen 5 Skelett-Zeilen mit `p-skeleton`-Shimmer-Platzhaltern pro Datenspalte anzeigen.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #table #primeng #sortierung #paginierung #listen-ansicht
