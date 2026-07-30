# Component: Seller-Search

**Bibliothek:** PrimeNG-Komposition — `p-inputgroup` + `p-card` + `p-listbox`
**Verwendung:** Bazaar Haupt-App — überall dort, wo ein Verkäufer per Suche ausgewählt werden muss, bevor ein weiterer Schritt möglich ist.

## Index

- Überblick — Konzept & Varianten
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter & Events
- 3. Filterlogik — Suchverhalten
- 4. Tastaturverhalten — Shortcuts
- 5. „+ Neu anlegen"-Button — Anlegen-Option
- 6. Layout — Aufbau
- 7. PrimeNG-Basis — Technische Basis

---

## Überblick

Das Seller-Search-Panel ist die einheitliche Einstiegs-Ansicht für Prozesse, die einen einzelnen Verkäufer erfordern. Es besteht aus einem Suchfeld in einer Card sowie einer Trefferliste darunter.

Feature_Abrechnung beschreibt es explizit als „identische Suchfeld-Ansicht wie Artikelannahme". Einzige Unterschiede zwischen den Verwendungsstellen sind über Parameter steuerbar:

| Parameter | Artikelannahme | Abrechnung |
|---|---|---|
| Hinweistext | „ENTER bei 1 Treffer öffnet Wizard · Kein Treffer: Anlegen-Button erscheint" | „ENTER bei 1 Treffer oder direkt klicken" |
| Anlegen-Button | ✅ (erscheint bei 0 Treffern) | ❌ |

---

## 1. ASCII-Darstellung

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌────────────────────────────────────┬────────┐  │
│   │ 🔍  Name, Vorname oder Nummer ...  │ Suchen │  │
│   └────────────────────────────────────┴────────┘  │
│                                                     │
│   ENTER bei 1 Treffer öffnet Wizard …  ← Hinweis   │
│                                                     │
│   ┌─────────────────────────────────────────────┐  │
│   │  Müller, Hans        #42  ·  Köln           │  │
│   │  Schmidt, Anna       #17  ·  Berlin         │  │
│   │  Weber, Klaus        #85  ·  Hamburg        │  │
│   └─────────────────────────────────────────────┘  │
│                                                     │
│   [+ Neuen Verkäufer anlegen]  ← nur wenn          │
│                                   showCreateButton  │
│                                   und 0 Treffer     │
└─────────────────────────────────────────────────────┘

Zustandsübersicht Suchfeld:
┌──────────────────────────────────────────────────────┐
│ (leer)     → Alle Verkäufer in der Liste             │
│ Text       → Filtert nach ID, Vorname, Nachname      │
│ 1 Treffer  → ENTER → sellerSelected emittiert        │
│ > 1 Treffer→ ENTER → keine Aktion                   │
│ 0 Treffer  → Liste ausgeblendet                      │
│             → Anlegen-Button sichtbar (wenn aktiv)   │
└──────────────────────────────────────────────────────┘
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `sellers` | `SellerSummary[]` | `@Input` | Vollständige Verkäufer-Liste (Filterung erfolgt in der Komponente) |
| `hint` | `string` | `@Input` | Hinweistext unterhalb des Suchfelds |
| `showCreateButton` | `boolean` | `@Input` | Zeigt den „+ Neu anlegen"-Button wenn `true` und 0 Treffer vorhanden (Default: `false`) |
| `sellerSelected` | `SellerSummary` | `@Output` | Emittiert wenn ein Verkäufer angeklickt oder per ENTER bestätigt wird |
| `createRequested` | `string` | `@Output` | Emittiert wenn „+ Neu anlegen" geklickt wird; übergibt den aktuellen Suchtext |
| `searchChanged` | `string` | `@Output` | Emittiert bei jeder Texteingabe (debounced, für optionales Parent-Tracking) |

### SellerSummary-Typ

```
{
  id:        string   // Verkäufer-ID
  firstName: string
  lastName:  string
  zip:       string
  city:      string
}
```

---

## 3. Filterlogik

Die Filterung erfolgt **in der Komponente** (In-Memory) auf Basis der übergebenen `sellers`-Liste.

**Felder:** `id`, `firstName`, `lastName` — case-insensitive, Substring-Match.

Der Hinweistext unter dem Feld (Slot für `hint`) erscheint immer, unabhängig vom Zustand.

---

## 4. Tastaturverhalten

| Taste | Verhalten |
|---|---|
| `Enter` (genau 1 Treffer) | `sellerSelected` emittiert |
| `Enter` (> 1 Treffer) | Keine Aktion |
| `Enter` (0 Treffer + `showCreateButton`) | `createRequested` emittiert |
| `↓` / `↑` | Navigation in der Trefferliste |
| `Escape` | Suchfeld leert sich, Liste zeigt alle |

---

## 5. „+ Neu anlegen"-Button

Erscheint **ausschließlich** wenn:
1. `showCreateButton === true`
2. Aktuelle Trefferliste leer (0 Treffer)

`p-button label="+ Neuen Verkäufer anlegen" severity="secondary" [outlined]="true"`

Übergibt beim Klick den aktuellen Suchtext via `createRequested` — das Parent kann Vorname/Nachname daraus vorbelegen (Text vor erstem Leerzeichen = Vorname, danach = Nachname).

---

## 6. Layout

- Äußere Card: `max-width: 500px`, zentriert auf der Seite
- Suchfeld: `p-inputgroup` (volle Breite)
- Hinweistext: 12.5 px, muted, margin-top 10 px
- Trefferliste: `p-listbox` ohne Border, direkt unterhalb — kein eigener Card-Rahmen
- Anlegen-Button: margin-top 12 px, volle Breite

---

## 7. PrimeNG-Basis

```
p-card              ← Außenrahmen (max-width 500 px)

p-inputgroup
  pInputText        ← Suchfeld
  p-button          ← optionaler Such-Button (kein sichtbarer Nutzen nötig — Enter reicht)

p-listbox           ← Trefferliste
  [options]="filteredSellers"
  (onChange)="onSelect($event)"

p-button            ← „+ Neu anlegen" (conditional)
```
