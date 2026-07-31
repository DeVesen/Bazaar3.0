---
id: DOC-005
status: draft
updated: 2026-07-31
---

# Lastenheft — Bazaar Haupt-App

## Index
- 1. Überblick — App-Beschreibung
- 2. Stakeholder — Rollen
- 3. Ziel — Kernprozesse
- 4. Navigation (Sidebar) — Seitenstruktur
- 5. Feature-Übersicht & Implementierungsreihenfolge — Setup + fachliche Features
- 6. UI-Konventionen & Komponenten — Design
- 7. Technische Rahmenbedingungen — Tech-Stack
- 8. Einstellungen — Parameter
- 9. Gemeinsame Anforderungen — Querschnitt
- 10. Design-Entscheidungen — Visuelles
- 11. Visual Specs (Global) — PrimeNG-Mapping
- 12. Offene Fragen — Backlog
- Tags & Piles — Ablage

**Version:** 0.8
**Datum:** 2026-07-31
**Autor:** Sven Reichert
**Status:** Entwurf

---

## 1. Überblick

Die **Bazaar Haupt-App** ist das operative Herzstück des Nummern-Basars. Sie läuft lokal im internen Netz und verwaltet den gesamten Ablauf von der Artikelannahme bis zur Abrechnung.

| | |
|---|---|
| **Betrieb** | Lokal / intern (kein Internetzugang erforderlich) |
| **Zielgruppe** | Admin, Kassenpersonal |
| **Offline-fähig** | Ja — vollständig offline-fähig |

Am Basar-Morgen exportiert der Admin alle Daten aus der Voranmelde-App als JSON und importiert sie in diese Haupt-App. Dadurch ist die Artikelannahme erheblich vereinfacht.

---

## 2. Stakeholder

| Rolle | Beschreibung |
|---|---|
| **Admin** | Betreiber des Basars. Verwaltet Stammdaten, Verkäufer, Einstellungen und führt den Import durch. |
| **Kassenpersonal** | Führt Verkauf und Abrechnung am Basar-Tag durch. |

---

## 3. Ziel

Die Haupt-App unterstützt drei operative Kernprozesse:

1. **Artikelannahme** — Verkäufer und ihre Artikel werden aufgenommen; Artikel erhalten Status „Im Verkauf"
2. **Verkauf** — Kassenvorgang mit Barcode/QR-Scan oder manueller Eingabe
3. **Abrechnung** — Rückgabe nicht verkaufter Artikel + finanzielle Abrechnung mit dem Verkäufer

---

## 4. Navigation (Sidebar)

```
── Tagesgeschäft ─────────────
  Artikelannahme
  Verkauf
  Abrechnung
  ─────────────── (Trennlinie)
── Stammdaten ────────────────
  Verkäufer
  Artikel
  Marken
  Kategorien
  Verkäufer-Types
  ─────────────── (Trennlinie)
── System ────────────────────
  Statistik
  Einstellungen
```

**Home** leitet automatisch auf **Artikelannahme** weiter — kein eigener Seiteninhalt.

---

## 5. Feature-Übersicht & Implementierungsreihenfolge

Die Features sind in der empfohlenen Implementierungsreihenfolge aufgelistet.
Setup-Features sind Voraussetzung für alle fachlichen Features und werden zuerst umgesetzt.
Fachliche Features folgen in der Reihenfolge ihrer Abhängigkeiten.

### Setup (Voraussetzung)

| # | Feature | Beschreibung | Feature-Datei |
|---|---|---|---|
| 1 | **Projektanlage** | Angular + .NET + Docker Compose + EF Core anlegen | [Epic_Projektanlage](features/Epic_Projektanlage/epic.md) |
| 2 | **App Shell** | Sidebar, responsives Layout, Routing-Skeleton, PrimeNG-Theme | [Epic_App_Shell](features/Epic_App_Shell/epic.md) |

### Stammdaten (zuerst, da Tagesgeschäft davon abhängt)

| # | Feature | Beschreibung | Feature-Datei |
|---|---|---|---|
| 3 | **Marken** | Marken-Tabelle, Anlegen/Bearbeiten | [Epic_Marken](features/Epic_Marken/epic.md) |
| 4 | **Kategorien** | Kategorien-Tabelle, Anlegen/Bearbeiten | [Epic_Kategorien](features/Epic_Kategorien/epic.md) |
| 5 | **Verkäufer-Typen** | Typen-Tabelle, Provision/Gebühr | [Epic_Verkaeufer_Typen](features/Epic_Verkaeufer_Typen/epic.md) |
| 6 | **Verkäufer** | Verkäuferliste, Karten-Layout, Artikel-Freigeben | [Epic_Verkaeufer](features/Epic_Verkaeufer/epic.md) |
| 7 | **Artikel** | Artikel-Übersicht aller Verkäufer, Status-Popup | [Epic_Artikel](features/Epic_Artikel/epic.md) |

### Tagesgeschäft (abhängig von Stammdaten)

| # | Feature | Beschreibung | Feature-Datei |
|---|---|---|---|
| 8 | **Artikelannahme** | Verkäufer suchen/anlegen, Artikel aufnehmen, Wizard | [Epic_Artikelannahme](features/Epic_Artikelannahme/epic.md) |
| 9 | **Verkauf** | Kassenvorgang, Barcode-Scan, Warenkorb | [Epic_Verkauf](features/Epic_Verkauf/epic.md) |
| 10 | **Abrechnung** | Rückgabe, Abrechnen, Auszahlungsberechnung | [Epic_Abrechnung](features/Epic_Abrechnung/epic.md) |

### System

| # | Feature | Beschreibung | Feature-Datei |
|---|---|---|---|
| 11 | **Statistik** | KPI-Kacheln, Leaderboard (read-only) | [Epic_Statistik](features/Epic_Statistik/epic.md) |
| 12 | **Druckfunktionen** | Artikelannahme-Liste, Verkäufer-Übersicht | [Epic_Druckfunktionen](features/Epic_Druckfunktionen/epic.md) |
| 13 | **Einstellungen** | Systemparameter + JSON-Import | [Epic_Einstellungen](features/Epic_Einstellungen/epic.md) |

---

## 6. UI-Konventionen & Komponenten

### 6.0 Grundlayout

```
┌──────────────┬──────────────────────────────────┐
│   Sidebar    │           Content-Bereich         │
│  (228 px)    │                                   │
└──────────────┴──────────────────────────────────┘
```

- Kein Toolbar/Titel-Banner solange Sidebar sichtbar ist
- **Burger-Menü (Mobile ≤ 768 px):** Titelleiste `#topbar` erscheint — **dieselbe Farbe/Gradient wie die Sidebar**. Burger-Button `#btnBurger` links; Overlay-Tap schließt Sidebar.
- **Beim Drucken:** Nur relevanter Content — keine Sidebar, kein Layout-Chrome.

### 6.1 InputGroup (IG)

Alle Eingabefelder mit Such- oder Scan-Funktion:

```
[ 🔍 Left-Addon ][ Input-Feld              ][ ✕ ][ Spinner ][ ↩ / 📷 ]
```

| Bereich | Beschreibung |
|---|---|
| **Left-Addon** | Optional (🔍 Lupe bei Suchfeldern, kein Addon bei reinen Nummernfeldern) |
| **Input-Feld** | Debounce-Suche (800 ms Default, konfigurierbar) |
| **✕ Clear-Button** | Erscheint wenn Input nicht leer; löscht + Fokus |
| **Spinner** | Ersetzt temporär Clear-Button während Suche |
| **Action-Button** | ↩ wenn Input gefüllt · 📷 wenn leer |

**€-Addon (Preis-Felder):**
```
[ Preis eingeben (Kommazahl)    ][ € ]
```
Erlaubte Eingabe: Dezimalzahl mit Komma oder Punkt.

### 6.2 InfoArea

| Typ | Hintergrund | Textfarbe | Ton |
|---|---|---|---|
| `success` | Hellgrün | Dunkelgrün | Ping (Sinus 880→1320 Hz) |
| `error` | Hellrot | Dunkelrot | Zonk (Quadratwelle 180→120 Hz) |
| `warn` | Hellgelb | Orangerot | Zonk |
| `info` | Hellblau | Dunkelblau | — |

Format: `[Icon] Nachrichtentext` — einzeilig, fett.

**Im Verkauf-Kontext:**
- Beim Navigieren zur Verkauf-Seite: blauer Info-Text *„Ersten Artikel eingeben …"*
- Nach Buchen / Leeren: blauer Info-Text *„Ersten Artikel eingeben …"*
- Nach erfolgreichem Scan: grüner Erfolgstext mit Preis
- Bei unbekanntem Artikel / falschem Status: roter Fehlertext

### 6.3 AutoComplete-Dropdown (Marke & Kategorie)

```
[ Texteingabe                                   ][ ▾ / + ]
```

- **▾ Button**: Öffnet Dropdown bei Fokus/Klick (kein Mindest-Zeichen)
- **+ Button**: Wenn Wert nicht in Liste → Mini-Popup „Neu anlegen"
- Tastatur: `↓/↑` navigieren · `Enter` bestätigt / öffnet Dialog · `Escape` schließt

### 6.4 Kamera-Modi

#### Popup-Modus (Standard)
Kontext: **Verkauf**, **Wizard Schritt 2**
Modal-Overlay mit Kamerabild. Nach Scan: Modal schließt, Wert ins Eingabefeld.

#### Inline-Modus
Kontext: **Artikel-Freigeben-Popup**, **Rückgabe-Popup**
Kamerafenster ersetzt das Eingabefeld an derselben Position. Bereiche darunter bleiben sichtbar.

**Ablauf nach Scan (Inline-Modus):**
1. Barcode/QR erkannt → Artikel gesucht
2. InfoArea zeigt Ergebnis (grün/gelb/rot) mit Tonfeedback
3. Countdown-Display (kreisförmig, SVG) läuft ab (`scannerPauseMs`, Default 3 000 ms)
4. Kamerabild erscheint wieder
5. **← Eingabe Button**: jederzeit → zurück in Eingabe-Modus

### 6.5 Verkäufer-Feldanordnung

Gilt für: **Verkäufer bearbeiten**, **Wizard Schritt 1 (Verkäuferanlage)**.

**Panel 01 — Personendaten**
```
[Vorname *       50%] [Nachname *     50%]
[Anschrift                           100%]
[PLZ             50%] [Ort            50%]
```

**Panel 02 — Kontakt**
```
[Telefon         50%] [E-Mail *       50%]
```

**Panel 03 — Konditionen**
```
[Verkäufer-Type                      100%]
[Gebühr je Stück 50%] [Provision     50%]
```

- Gebühr/Provision werden beim Type-Wechsel **vorausgefüllt**, sind individuell überschreibbar
- Maßgeblich für Berechnungen sind die **eigenen Felder des Verkäufers**, nicht die des Types

**Visuelle Panel-Gestaltung:**
Hintergrund `#f8fafc` · Border 1 px `#dde6ee` · Radius 8 px · Padding 15 px 16 px · Abstand 12 px.

Panel-Titel: 11 px · 700 · uppercase · 0.8 px letter-spacing · `#4a6080` · mb 12 px.

**Modal-Größen:**
- `≥ 768 px`: 80 % Breite / 90 % Höhe
- `< 768 px`: 100 % Breite / 100 % Höhe, kein border-radius

### 6.6 Tabellen-Stil (PrimeNG)

- **Striped rows** — jede zweite Zeile `#FAFAFA`
- **Hover-Highlight**
- **Sortierbare Spalten** — Klick sortiert auf-/absteigend (▲/▼)
- **Multi-Column-Sort** — Shift+Klick; nummeriertes Badge (①②…) am Header
- **Loading-Skeleton** — Shimmer-Platzhalter beim ersten Laden

---

## 7. Technische Rahmenbedingungen

### 7.0 Tech-Stack

| Komponente | Technologie |
|---|---|
| **Frontend** | Angular 20 (Standalone Components, Signals, OnPush) |
| **Backend** | .NET 9 Minimal API (Microservices) |
| **ORM** | Entity Framework Core |
| **Datenbank** | PostgreSQL |
| **UI-Bibliothek** | PrimeNG 20 (kein Angular Material) |
| **Containerisierung** | Docker / Docker Compose |
| **Barcode/QR-Scan** | ZXing / ngx-scanner (Browser-Kamera, offline) |
| **Icons** | Angular Material Icons (npm-Paket, kein CDN) |

### 7.1 Responsive Design

| Breakpoint | Sidebar | Titelleiste | Modals |
|---|---|---|---|
| **Desktop** (> 768 px) | fest sichtbar | keine | 80 % / 90 vh |
| **Mobile** (≤ 768 px) | Burger-Menü, slide-in | sichtbar | 100 % / 100 vh, kein radius |

Titelleiste: Hintergrundfarbe = Sidebar-Farbe. Sidebar bei `top: 56px` unter der Titelleiste.

### 7.2 Offline-Fähigkeit

Die Haupt-App **muss vollständig offline-fähig** sein. Sie läuft auf einem Server im lokalen LAN ohne Internetzugang.

| Bereich | Anforderung |
|---|---|
| Fonts | Lokal im App-Bundle — kein CDN |
| Icons | Lokal (Material Icons als npm-Paket) |
| CSS-Bibliotheken | Lokal über npm |
| JS-Abhängigkeiten | Ausschließlich npm-Bundle |
| QR-/Barcode-Scanner | Browser-Kamera, kein externer Service |
| Angular-Build | `ng build --configuration production` vollständig selbstständig |

---

## 8. Einstellungen

| Parameter | Beschreibung | Default |
|---|---|---|
| `suchDebounceMs` | Verzögerung in ms bevor Suchanfrage ausgelöst wird | 800 ms |
| `scannerPauseMs` | Anzeigedauer Scan-Ergebnis im Inline-Kamera-Modus | 3 000 ms |

Einstellungen werden im `localStorage` gespeichert.

---

## 9. Gemeinsame Anforderungen

### 9.1 Marken & Kategorien — Synchronisierung

Marken und Kategorien können in der Voranmelde-App exportiert und hier importiert werden (und umgekehrt) — für konsistente Stammdaten.

### 9.2 `original`-Flag (Marken & Kategorien)

| Wert | Bedeutung |
|---|---|
| `true` | Vom Admin als Stammdaten-Eintrag angelegt |
| `false` | Nachträglich angelegt (z. B. von Kassierer über AutoComplete-Popup) |

In Listen: Badge `✓ Original` (grün) / `Neu` (orange).
Neue Einträge via AutoComplete-Popup → automatisch `original = false`.

Zweck: Erkennen, welche Marken/Kategorien während der Annahmephase am Basar-Tag neu hinzukamen.

### 9.3 AutoComplete-Verhalten (Marke & Kategorie)

- Dropdown öffnet beim **Anklicken** des Feldes (kein Mindest-Zeichen)
- Unbekannter Wert → Popup: *„‹XYZ› als neue Marke/Kategorie speichern?"*
  - Bestätigt: Eintrag angelegt, ausgewählt, `original = false`
  - Abgebrochen: Eingabe bleibt, kein neuer Eintrag

### 9.4 Artikel-Timestamps

| Feld | Typ | Beschreibung |
|---|---|---|
| `erstelltAm` | DateTime | Beim Anlegen gesetzt (server-seitig) |
| `updatedAm` | DateTime | Bei jeder Änderung aktualisiert (server-seitig) |

Beide Felder nicht editierbar. Bei Neuanlage gilt `updatedAm = erstelltAm`.

### 9.5 IDs

Alle Entitäten verwenden eine **8-stellige alphanumerische ID** (Groß-/Kleinbuchstaben + Zahlen, case-sensitive).

### 9.6 Verkäufer-Types

- Enthalten: Provision (%) + Gebühr pro Stück (€)
- Template / Vorlage — kein verbindlicher Join
- Beim Anlegen/Ändern eines Verkäufers werden `provision` und `gebuehr` vorausgefüllt, können individuell überschrieben werden

### 9.7 Verkäufer-Konditionen (eigene Felder)

Jeder Verkäufer trägt **eigene** Felder `provision` (%) und `gebuehr` (€/Stück).
Diese sind **maßgeblich** für alle Berechnungen — nicht die aktuellen Werte des zugewiesenen Types.

---

## 10. Design-Entscheidungen

### 10.1 Visuelles Branding & Farben

| Element | Wert |
|---|---|
| Sidebar-Hintergrund | Dunkles Navy `#1a2e4a` |
| Akzentfarbe | Blau `#2e86c1` |
| Sidebar-Logo | „Bazaar **Suite**" (Wort „Suite" in Akzentfarbe) |
| Topbar-Text | „Bazaar Haupt-App" |
| Content-Hintergrund | `#f0f2f5` |
| Titel-Farbe | `#0f1f30` |

### 10.2 Toast-Benachrichtigungen

Kurze Einblendungen unten rechts (3 Sek. auto-dismiss) für Aktionsbestätigungen ohne eigene Ergebnisseite.
Beispiele: „✓ Import erfolgreich", „✓ Buchung erfolgreich".
**Nicht** bei Fehlern, die eine Reaktion erfordern — dort InfoArea.

### 10.3 Countdown-Darstellung (KPI-Kachel)

```
12T
06:44:22
```

Erste Zeile: Tage (ganzzahlig, kein Padding). Zweite Zeile: HH:MM:SS (zero-padded). Aktualisierung jede Sekunde via `setInterval`.

---

## 11. Visual Specs (Global)

### 11.1 PrimeNG-Komponenten-Mapping

#### Form & Eingaben

| UI-Element | PrimeNG-Komponente | Hinweis |
|---|---|---|
| Text-Eingabe | `pInputText` (Direktive auf `<input>`) | — |
| Zahl (Preis, Provision, Gebühr …) | `p-inputnumber` | Locale DE; `minFractionDigits="2"` für Preise |
| Textarea | `pTextarea` (Direktive auf `<textarea>`) | — |
| Dropdown / Select | `p-select` | PrimeNG 18+ |
| AutoComplete (Marke/Kategorie) | `p-autocomplete [dropdown]="true" [forceSelection]="false"` | Neuer Wert → `p-dialog` via `DialogService` |
| InputGroup | `p-inputgroup` + `p-inputgroupaddon` + `pInputText` | — |
| Datei-Upload | `p-fileupload mode="basic"` | Import JSON |
| Toggle-Schalter | `p-toggleswitch` | „Original"-Flag, Admin-Rechte |

#### Buttons

| Typ | PrimeNG | Einsatz |
|---|---|---|
| Primär | `p-button severity="primary"` | Hauptaktion |
| Erfolg | `p-button severity="success"` | Buchen, Abrechnen, Speichern |
| Gefahr | `p-button severity="danger"` | Löschen |
| Sekundär / Outline | `p-button severity="secondary" [outlined]="true"` | Abbrechen, Zurück, Drucken |
| Klein | `p-button size="small"` | Karten-Aktionen |
| Icon-Button (Text-Stil) | `p-button [text]="true" [rounded]="true"` | Status Löschen/Setzen |

#### Tabellen & Feedback

| UI-Element | PrimeNG-Komponente |
|---|---|
| Tabelle | `p-table [sortMode]="'multiple'"` |
| Dialog / Modal | `p-dialog [modal]="true"` (via `DialogService`) |
| Toast | `p-toast` + `MessageService` |

### 11.2 Globales Layout & Abstände

| Eigenschaft | Desktop | Mobile (≤ 768 px) |
|---|---|---|
| Content-Padding oben/unten | 26 px | 14 px |
| Content-Padding links/rechts | 22 px | 12 px |
| Content-Hintergrund | `#f0f2f5` | — |

**Page-Header:** `display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px`
- Titel: 20 px, 800, `#0f1f30`
- Actions (rechts): `display: flex; gap: 8px`

**Sidebar-Details:**

| Element | Wert |
|---|---|
| Breite | 228 px |
| Logo-Block Padding | 20 px 18 px 16 px |
| Logo Font | 17 px, 800, weiß |
| Logo Border-Bottom | 1 px solid rgba(255,255,255,0.1) |
| Section-Label | 10 px, 700, uppercase, 1.2 px letter-spacing |
| Trennlinie | 1 px solid rgba(255,255,255,0.07), mx 14 px |
| Nav-Item Padding | 9 px 18 px |
| Nav-Item Font | 13.5 px |
| Nav-Icon | 16 px, Breite 18 px |

### 11.3 KPI-Kacheln

| Eigenschaft | Wert |
|---|---|
| Hintergrund | `#ffffff` |
| Border | 1 px solid `--border` |
| Border-radius | 8 px |
| Padding | 16 px 14 px |
| Text-align | center |
| Grid-Gap | 12 px |

| Element | Font-Size | Font-Weight | Farbe |
|---|---|---|---|
| Label | 10.5 px | 700 | `--muted` (uppercase, letter-spacing 0.5 px) |
| Hauptwert | 28 px | 800 | `#0f1f30` oder farbig |
| Sub-Label | 12 px | 400 | `--muted`, mt 3 px |

**Grid-Klassen:**

| Klasse | Spalten | Einsatz |
|---|---|---|
| `c6` | 6 gleichbreit | Statistik Zeile 1 |
| `c5` | 5 gleichbreit | Statistik Zeile 3 |
| `c4` | 4 gleichbreit | — |
| `c3` | 3 gleichbreit | Statistik Zeile 2, Abrechnung |

### 11.4 Cards & Panel-Blöcke

**Standard-Card:** Hintergrund `#ffffff` · Border 1 px `--border` · Radius 8 px · Padding 18 px 16 px · mb 14 px · Titel 700/14 px/`#0f1f30` · mb 12 px.

**Filter-Panel:** Wie Standard-Card, Padding 13 px 15 px.
- Zeile 1: Suchfeld (flex: 1) + Dropdowns (180 px / 200 px)
- Zeile 2: 4-Spalten-Grid je 25 %, gap 10 px (nur Artikel-Seite)

**Panel-Blöcke (Formulare):**

| Eigenschaft | Wert |
|---|---|
| Hintergrund | `#f8fafc` |
| Border | 1 px `#dde6ee` |
| Border-radius | 8 px |
| Padding | 15 px 16 px |
| Margin-bottom | 12 px |
| Titel | 11 px, 700, uppercase, 0.8 px, `#4a6080`, mb 12 px |

**Form-Grid:** 2 Spalten, gap 12 px. `.full` → volle Breite.
Label: 11.5 px, 700, uppercase, 0.4 px letter-spacing, `--muted`. Pflichtmarker `*` in Danger-Farbe.

### 11.5 Modals (`p-dialog`)

| Eigenschaft | Wert |
|---|---|
| Backdrop | `rgba(0,0,0,0.52)` |
| Box-Shadow | `0 20px 60px rgba(0,0,0,0.3)` |
| Border-radius | 10 px (Desktop) / 0 (Mobile ≤ 768 px) |
| Max-Height | 90 vh |

| Größe | Max-Breite | Einsatz |
|---|---|---|
| `sm` | 420 px | Checkout, Marke, Kategorie, Typ |
| Standard | 80 % / max 700 px | Seller-Edit, Freigabe, Rückgabe |

**Dialog-Bereiche:**

| Bereich | Padding | Details |
|---|---|---|
| Header | 17 px 20 px | Titel 700/16 px; Schließen-Button kein BG, 22 px, muted |
| Body | 20 px | overflow-y auto |
| Footer | 13 px 20 px | Standard: flex-end, gap 8 px. Mit Löschen: space-between |

**Footer-Muster:**

| Muster | Layout |
|---|---|
| Standard | Rechts: `[Abbrechen (secondary outlined)]` `[Speichern (primary)]` |
| Mit Löschen | Links: `[Löschen (danger)]` · Rechts: `[Abbrechen]` `[Speichern]` |
| Nur Schließen | Rechts: `[Schließen (secondary outlined)]` |

### 11.6 Badges & Tags

Alle Status-Badges: border-radius 4 px, padding 2 px 8 px, 11 px, 600.

| Typ | Hintergrund | Textfarbe | Einsatz |
|---|---|---|---|
| `success` | `#d5f5e3` | `#1a5c38` | Abgerechnet, Verkauft |
| `danger` | `#fadbd8` | `#7b241c` | Fehler-Status |
| `warn` | `#fef9e7` | `#7e5109` | Händler-Typ |
| `info` | `#d6eaf8` | `#1a5276` | Im Verkauf |
| `sec` | `#eaecee` | `#566573` | Offen, neutral |
| `original` | `#d5f5e3` | `#1a5c38` | „✓ Original"-Flag |
| `neu` | `#fdebd0` | `#784212` | „Neu"-Flag |

**Rang-Badges** (Leaderboard, 26×26 px, Kreis, 700, 12 px):

| Rang | Hintergrund | Textfarbe |
|---|---|---|
| 1 | `#ffd700` (Gold) | `#5d4e00` |
| 2 | `#c0c0c0` (Silber) | `#3d3d3d` |
| 3 | `#cd7f32` (Bronze) | `#4a2800` |
| ≥ 4 | `#eaecee` (Grau) | `#566573` |

### 11.7 PrimeNG MISC-Komponenten

| Komponente | Einsatz |
|---|---|
| `pAutoFocus` | Suchfeld (Annahme, Abrechnung), Artikelnummer (Verkauf, Wizard Schritt 2), erstes Feld in Dialogen |
| `pFocusTrap` | Fokus bleibt in offenem `p-dialog` |
| `pAnimateOnScroll` | KPI-Kacheln und Karten-Grids beim Scrollen in Viewport |
| `p-badge` | Offene Artikel-Anzahl im Sidebar-Menüpunkt |
| `p-chip` | Aktive Filter-Tags im Filter-Panel (mit × zum Entfernen) |
| `p-progressbar` | Import-Fortschritt (Einstellungen) |
| `p-metergroup` | Statistik: Anteil Verkauft / Im Verkauf / Retour als Balken |
| `p-progressspinner` | Ladeindikator bei Such-Debounce (ersetzt Clear-Button) |
| `p-skeleton` | Tabellen-Lade-Skelett (5 Zeilen, nur beim ersten Laden) |
| `p-scrolltop` | Scroll-nach-oben ab 400 px Scrolltiefe, `smooth` |

---

## 12. Offene Fragen

| # | Frage | Status |
|---|---|---|
| 1 | Kassenvorgang: Scanner-Typ? | ✅ Beides: USB-Scanner (Tastaturemulation) + Kamera-Scan |
| 2 | Maximale Artikel-Anzahl pro Verkäufer? | ✅ Keine harte Grenze |
| 3 | Marken/Kategorien Freitext oder Liste? | ✅ AutoComplete + Freitext via Popup |
| 4 | Welche Einstellungen soll der Admin konfigurieren? | ✅ `suchDebounceMs` (800 ms) + `scannerPauseMs` (3 000 ms) |
| 7 | Offline-Fähigkeit? | ✅ Ja — lokales LAN, kein Internetzugang, alles im Bundle |
| 8 | Scan-Ergebnis Anzeigedauer? | ✅ Konfigurierbar, Default 5 Sekunden |
| 9 | Artikel löschen im Wizard (noch nicht gespeichert)? | ✅ Ja — Löschen-Button pro Eintrag in Session-Liste |
| 10 | Scan-Feedback: Ton und/oder Vibration? | ✅ Beides — Web Audio API + `Navigator.vibrate()` |

---

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #requirements #haupt-app #lastenheft #kassenpersonal #admin
