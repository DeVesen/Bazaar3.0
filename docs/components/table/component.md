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
| Seitenüberschrift / Feature-Titel | links | immer |
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

Die konkreten Actions je Feature definiert das jeweilige Feature-Dokument.

---

## 5. Sortierung

Jede Spalte ist standardmäßig sortierbar. Das Feature-Dokument kann einzelne Spalten explizit als nicht-sortierbar ausweisen.

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
| Tablet (768–1023 px) | Unwichtige Spalten ausgeblendet (je Feature definiert) |
| Mobil (< 768 px) | Gestapelte Darstellung (`responsiveLayout="stack"`) |

---

## 11. PrimeNG-Basis

```
p-table
  [sortMode]="'multiple'"        ← Single + Multi-Sort
  [virtualScroll]="true"         ← Nur sichtbare Zeilen rendern
  [virtualScrollItemSize]="46"   ← Zeilenhöhe in px (Basis-Wert, je Feature anpassen)
  [lazy]="true"                  ← Parent lädt Daten bei Sort/Filter/Page-Events
  (onSort)="…"
  (onFilter)="…"
  (onPage)="…"
```

Virtual Scroll sorgt dafür, dass auch bei großen Datenlisten (tausende Zeilen) nur die sichtbaren Zeilen im DOM gerendert werden — Performance bleibt konstant.

Spalten-Filter: `p-columnFilter` mit `display="menu"` — öffnet ein Overlay-Menü mit Eingabefeld, Match-Mode-Auswahl und optionaler Preset-Liste.
Match-Modi pro Spalte: `[matchModeOptions]` auf `p-columnFilter`.
Enum-Preset-Werte: `<ng-template pTemplate="filter">` mit `p-listbox` oder `p-multiSelect`.
