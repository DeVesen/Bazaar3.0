# Lastenheft — Voranmelde-App

**Version:** 0.7
**Datum:** 2026-06-25
**Autor:** Sven Reichert
**Status:** Entwurf

---

## 1. Überblick

Die **Voranmelde-App** ermöglicht Verkäufern die Selbstregistrierung und Vorab-Erfassung ihrer Artikel. Admins verwalten Verkäufer, Stammdaten und erstellen am Basar-Morgen einen JSON-Export für die Haupt-App.

| | |
|---|---|
| **Betrieb** | Cloud (z. B. Azure Container Apps) |
| **Zielgruppe** | Admin, Verkäufer (Selbstregistrierung) |
| **Offline-fähig** | Nein |
| **Mehrsprachigkeit** | DE + EN via ngx-translate |

---

## 2. Stakeholder

| Rolle | Beschreibung |
|---|---|
| **Admin** | Betreiber des Basars. Verwaltet Verkäufer, Stammdaten, Einstellungen, Export. Darf selbst als Verkäufer Artikel erfassen. |
| **Verkäufer** | Privatpersonen oder Händler. Registrieren sich selbst und pflegen ihre Artikelliste. |

---

## 3. Ziel

Die Voranmelde-App unterstützt die Voranmeldephase vor dem Basar:

1. **Registrierung** — Selbstregistrierung oder Admin-Einladung
2. **Artikelerfassung** — Verkäufer pflegen ihre Artikelliste vorab
3. **Export** — Admin erstellt JSON-Export für die Haupt-App

---

## 4. Rollen & Rechte

| Rolle | Rechte |
|---|---|
| **Admin** | Alles: Verkäufer anlegen/einladen, Stammdaten verwalten, Export erstellen, eigene Artikel pflegen |
| **Verkäufer** | Eigenes Profil + eigene Artikelliste verwalten |

**Role-Toggle:** Admins können in der Sidebar zwischen Admin-Ansicht und Verkäufer-Ansicht wechseln (ohne erneuten Login). Verkäufer ohne Admin-Rechte sehen diesen Toggle nicht.

---

## 5. Registrierung & Einladung

**Selbstregistrierung:**
- Verkäufer registriert sich mit E-Mail + Passwort
- Profil wird direkt angelegt
- Nummernblock wird automatisch zugewiesen (nächster freier)

**Admin-Einladung:**
- Admin legt Verkäufer an und sendet Einladungs-Link
- Verkäufer vervollständigt Profil und setzt Passwort über den Link
- Anzahl initialer Nummernblöcke wird beim Anlegen vom Admin festgelegt

---

## 6. Nummernblock-System

- **Startpunkt:** konfigurierbar (z. B. Nummer 1, 100, 1000)
- **Blockgröße:** konfigurierbar (z. B. 10 Nummern pro Block)
- Jeder Verkäufer erhält beim Anlegen einen oder mehrere **zusammenhängende** Blöcke
- **Automatische Erweiterung:** Nächster freier Block wird zugewiesen, wenn aktueller Block voll
- **Sichtbarkeit:** Verkäufer sieht seine Blöcke (read-only), kann sie nicht ändern oder weitere beantragen

**Einstellungs-Parameter:**

| Parameter | Beschreibung |
|---|---|
| `startNumber` | Erste Artikelnummer überhaupt |
| `blockSize` | Anzahl Nummern pro Block |
| `defaultBlockCount` | Standard-Anzahl Blöcke für neue Verkäufer |

---

## 7. Navigation (Sidebar)

#### Admin — Sidebar-Reihenfolge

```
── Mein Bereich ──────────────
  Home
  Meine Artikel  (Admin darf selbst verkaufen)
  ─────────────── (Trennlinie)
── Verwaltung ────────────────
  Verkäufer
  Artikel
  ─────────────── (Trennlinie)
── Stammdaten ────────────────
  Marken
  Kategorien
  Verkäufer-Types
  ─────────────── (Trennlinie)
── System ────────────────────
  Profil
  Einstellungen
  Export
```

#### Verkäufer — Sidebar-Reihenfolge

```
── Mein Bereich ──────────────
  Home
  Meine Artikel
  ─────────────── (Trennlinie)
── Konto ─────────────────────
  Profil
  Nummernblöcke
```

**Sidebar-Footer** (immer am unteren Rand, auch im mobilen Zustand):
User-Info (Avatar, Name, Logout) + Role-Toggle (Admin/Verkäufer — nur für Admins sichtbar).

---

## 8. Seiten-Übersicht

| Seite | Sichtbar für | Feature-Datei |
|---|---|---|
| **Home (Verkäufer-Ansicht)** | Alle | [Feature_Home_Verkaeufer.md](Features/Feature_Home_Verkaeufer.md) |
| **Home (Admin-Ansicht)** | Admin | [Feature_Home_Admin.md](Features/Feature_Home_Admin.md) |
| **Login** | Alle (nicht eingeloggt) | [Feature_Login.md](Features/Feature_Login.md) |
| **Meine Artikel** | Alle | [Feature_Meine_Artikel.md](Features/Feature_Meine_Artikel.md) |
| **Profil** | Alle | [Feature_Profil.md](Features/Feature_Profil.md) |
| **Nummernblöcke** | Verkäufer | [Feature_Nummernbloecke.md](Features/Feature_Nummernbloecke.md) |
| **Verkäufer (Admin)** | Admin | [Feature_Verkaeufer.md](Features/Feature_Verkaeufer.md) |
| **Alle Artikel (Admin)** | Admin | [Feature_Alle_Artikel.md](Features/Feature_Alle_Artikel.md) |
| **Marken** | Admin | [Feature_Marken.md](Features/Feature_Marken.md) |
| **Kategorien** | Admin | [Feature_Kategorien.md](Features/Feature_Kategorien.md) |
| **Verkäufer-Typen** | Admin | [Feature_Verkaeufer_Typen.md](Features/Feature_Verkaeufer_Typen.md) |
| **Einstellungen** | Admin | [Feature_Einstellungen.md](Features/Feature_Einstellungen.md) |
| **Export** | Admin | [Feature_Export.md](Features/Feature_Export.md) |

---

## 9. UI-Konventionen & Komponenten

### 9.0 Grundlayout

```
┌──────────────┬──────────────────────────────────┐
│   Sidebar    │           Content-Bereich         │
│  (240 px)    │                                   │
└──────────────┴──────────────────────────────────┘
```

- Kein Toolbar/Titel-Banner solange Sidebar sichtbar ist
- **Burger-Menü (Tablet ≤ 1024 px + Mobile ≤ 768 px):** Titelleiste `#topbar` erscheint — **dieselbe Farbe/Gradient wie die Sidebar**. Burger-Button `#btnBurger` links; Overlay-Tap schließt Sidebar.
- **Sidebar-Footer:** User-Info + Role-Toggle immer am unteren Rand, auch bei mobiler Sidebar.

### 9.1 InputGroup (IG)

```
[ 🔍 Left-Addon ][ Input-Feld              ][ ✕ ][ Spinner ][ ↩ / 📷 ]
```

| Bereich | Beschreibung |
|---|---|
| **Left-Addon** | Optional (🔍 bei Suchfeldern) |
| **Input-Feld** | Debounce-Suche (800 ms Default) |
| **✕ Clear-Button** | Erscheint wenn Input nicht leer |
| **Spinner** | Ersetzt temporär Clear-Button während Suche |
| **Action-Button** | ↩ wenn Input gefüllt · 📷 wenn leer |

**€-Addon (Preis-Felder):**
```
[ Preis eingeben (Kommazahl)    ][ € ]
```

### 9.2 InfoArea

| Typ | Hintergrund | Textfarbe | Ton |
|---|---|---|---|
| `success` | Hellgrün | Dunkelgrün | Ping |
| `error` | Hellrot | Dunkelrot | Zonk |
| `warn` | Hellgelb | Orangerot | Zonk |
| `info` | Hellblau | Dunkelblau | — |

### 9.3 AutoComplete-Dropdown (Marke & Kategorie)

```
[ Texteingabe                                   ][ ▾ / + ]
```

- **▾ Button**: Öffnet Dropdown bei Fokus/Klick (kein Mindest-Zeichen)
- **+ Button**: Wenn Wert nicht in Liste → Mini-Popup „Neu anlegen"
- Tastatur: `↓/↑` navigieren · `Enter` bestätigt / öffnet Dialog · `Escape` schließt

### 9.4 Verkäufer-Feldanordnung

Gilt für: **Steckbrief (Profil)**, **Admin Verkäufer-Dialog**.

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

- Im **Seller-Steckbrief** sind Type/Gebühr/Provision **schreibgeschützt** — nur Admin kann ändern
- Im **Admin-Dialog** gibt es zusätzlich das Feld „Anzahl initialer Nummernblöcke" unterhalb von Panel 03

**Visuelle Panel-Gestaltung:**
Hintergrund `#f5f9f6` · Border 1 px `#d4e8dc` · Radius 8 px · Padding 15 px 16 px.

Panel-Titel: 11 px · 700 · uppercase · 0.8 px letter-spacing · `#3a7057` · mb 12 px.

**Modal-Größen:**
- `≥ 768 px`: 80 % Breite / 90 % Höhe
- `< 768 px`: 100 % Breite / 100 % Höhe, kein border-radius

### 9.5 Tabellen-Stil (PrimeNG)

Identisch mit Haupt-App — PrimeNG Table, Striped, Hover, Multi-Sort, Loading-Skeleton.

| Tabelle | Tabellen-ID | Sortierbare Spalten |
|---|---|---|
| Meine Artikel (Verkäufer) | `table-meine-artikel` | Nr. · Bezeichnung · Kategorie · Marke · Preis |
| Admin — Verkäufer | `table-admin-verkaeufer` | Nr. · Vorname · Nachname · PLZ · Ort · Typ · Provision · Gebühr · Artikel |
| Admin — Alle Artikel | `table-admin-artikel` | Nr. · Bezeichnung · Kategorie · Marke · Preis · Verkäufer |
| Marken | `table-marken` | ID · Name · Original · Artikel |
| Kategorien | `table-kategorien` | ID · Name · Original · Artikel |
| Verkäufer-Typen | `table-types` | Bezeichnung · Provision % · Gebühr € |

---

## 10. Technische Rahmenbedingungen

### 10.0 Tech-Stack

| Komponente | Technologie |
|---|---|
| **Frontend** | Angular 19 (Standalone Components, Signals, OnPush) |
| **Backend** | .NET 9 Minimal API (Microservices) |
| **ORM** | Entity Framework Core |
| **Datenbank** | PostgreSQL |
| **UI-Bibliothek** | PrimeNG 18 |
| **Containerisierung** | Docker / Docker Compose |
| **Mehrsprachigkeit** | ngx-translate (DE + EN) |
| **Icons** | Angular Material Icons (npm-Paket) |

### 10.1 Responsive Design

| Breakpoint | Sidebar | Titelleiste | Modals |
|---|---|---|---|
| **Desktop** (> 1024 px) | fest sichtbar | keine | 80 % / 90 vh |
| **Tablet** (≤ 1024 px) | Burger-Menü, slide-in | sichtbar | 80 % / 90 vh |
| **Mobile** (≤ 768 px) | Burger-Menü, slide-in | sichtbar | 100 % / 100 vh, kein radius |

Titelleiste: Hintergrundfarbe = Sidebar-Farbe. Sidebar bei `top: 56px` unter der Titelleiste.

---

## 11. Gemeinsame Anforderungen

### 11.1 Marken & Kategorien — Synchronisierung

Marken und Kategorien können exportiert und in die Haupt-App importiert werden (und umgekehrt).

### 11.2 `original`-Flag (Marken & Kategorien)

| Wert | Bedeutung |
|---|---|
| `true` | Vom Admin als Stammdaten-Eintrag angelegt |
| `false` | Nachträglich angelegt (z. B. von Verkäufer über AutoComplete-Popup) |

In Listen: Badge `✓ Original` (grün) / `Neu` (orange).
Neue Einträge via AutoComplete → automatisch `original = false`.

Zweck: Erkennen, welche Marken/Kategorien während der Voranmeldephase neu angelegt wurden.

### 11.3 AutoComplete-Verhalten (Marke & Kategorie)

- Dropdown öffnet beim **Anklicken** (kein Mindest-Zeichen)
- Unbekannter Wert → Popup: *„‹XYZ› als neue Marke/Kategorie speichern?"*

### 11.4 Artikel-Timestamps

| Feld | Beschreibung |
|---|---|
| `erstelltAm` | Beim Anlegen gesetzt (server-seitig) |
| `updatedAm` | Bei jeder Änderung aktualisiert; wird für Aktivitäts-Heatmap ausgewertet |

### 11.5 IDs

Alle Entitäten: **8-stellige alphanumerische ID** (case-sensitive).

### 11.6 Verkäufer-Types

- Template / Vorlage: Provision (%) + Gebühr pro Stück (€)
- Beim Anlegen/Ändern werden `provision` und `gebuehr` vorausgefüllt, sind überschreibbar
- Admin kann Provision und Gebühr pro Verkäufer individuell nachjustieren

### 11.7 Verkäufer-Konditionen (eigene Felder)

Jeder Verkäufer trägt eigene Felder `provision` und `gebuehr` — maßgeblich beim Import in die Haupt-App.

---

## 12. Design-Entscheidungen

### 12.1 Visuelles Branding & Farben

| Element | Wert |
|---|---|
| Sidebar-Hintergrund | Dunkles Teal `#1b3a4b` |
| Akzentfarbe | Grün `#0e8a5f` |
| Avatar-Akzent | `#3ecf8e` |
| Sidebar-Logo | „Basar **Voranmelde**" (Wort in Akzentfarbe) |
| Topbar-Text | „Bazaar Voranmelde" |
| Content-Hintergrund | `#f0f4f7` |
| Titel-Farbe | `#0d1f2a` |

### 12.2 Toast-Benachrichtigungen

Kurze Einblendungen unten rechts (3 Sek. auto-dismiss) für Aktionsbestätigungen.
Beispiele: „✓ Artikel gespeichert", „✓ Einladungs-Link kopiert".

### 12.3 Countdown-Darstellung (KPI-Kachel)

```
12T
06:44:22
```

Erste Zeile: Tage. Zweite Zeile: HH:MM:SS. Aktualisierung jede Sekunde.

### 12.4 Role-Toggle (Sidebar-Footer)

- Wechsel zu „Verkäufer": Admin sieht Seiten wie ein Verkäufer
- Wechsel zurück zu „Admin": volle Admin-Ansicht
- Aktivitäts-Heatmap nur sichtbar wenn Toggle auf „Admin"
- Nur für Admins sichtbar

### 12.5 Login-Seite Demo-Hinweis

In der Entwicklungsversion: kleiner Hinweis auf Demo-Accounts. In Produktion entfällt dieser Hinweis.

---

## 13. Visual Specs (Global)

### 13.1 PrimeNG-Komponenten-Mapping

#### Form & Eingaben

| UI-Element | PrimeNG-Komponente | Hinweis |
|---|---|---|
| Text-Eingabe | `pInputText` | — |
| Passwort | `p-password` | — |
| Zahl (Preis, Provision …) | `p-inputnumber` | Locale DE, `minFractionDigits="2"` |
| Textarea | `pTextarea` | — |
| Dropdown / Select | `p-select` | — |
| AutoComplete | `p-autocomplete [dropdown]="true" [forceSelection]="false"` | Neuer Wert → `p-dialog` |
| InputGroup | `p-inputgroup` + `p-inputgroupaddon` | — |
| Datum / Uhrzeit | `p-datepicker` | Einstellungen |
| Checkbox | `p-checkbox` | Export-Optionen |
| Toggle-Schalter | `p-toggleswitch` | „Original"-Flag, Admin-Rechte |

#### Buttons

| Typ | PrimeNG |
|---|---|
| Primär | `p-button severity="primary"` |
| Erfolg | `p-button severity="success"` |
| Gefahr | `p-button severity="danger"` |
| Sekundär | `p-button severity="secondary" [outlined]="true"` |
| Klein | `p-button size="small"` |
| Icon-Button | `p-button [text]="true" [rounded]="true"` |

#### Tabellen & Feedback

| UI-Element | PrimeNG-Komponente |
|---|---|
| Tabelle | `p-table [sortMode]="'multiple'"` |
| Dialog | `p-dialog [modal]="true"` (via `DialogService`) |
| Toast | `p-toast` + `MessageService` |

### 13.2 Globales Layout & Abstände

| Eigenschaft | Desktop | Mobile |
|---|---|---|
| Content-Padding oben/unten | 26 px | 14 px |
| Content-Padding links/rechts | 22 px | 12 px |
| Content-Hintergrund | `#f0f4f7` | — |

**Page-Header:** `display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px`
- Titel: 20 px, 800, `#0d1f2a`
- Actions (rechts): `display: flex; gap: 8px`

**Sidebar-Details:** Breite 240 px.

### 13.3 KPI-Kacheln

| Element | Font-Size | Font-Weight | Farbe |
|---|---|---|---|
| Label | 10.5 px | 700 | `--muted` (uppercase) |
| Hauptwert | 28 px | 800 | `#0d1f2a` oder farbig |
| Sub-Label | 12 px | 400 | `--muted` |

**Grid-Klassen:** `c4` (Home) · `c5` (Admin-Home) · `c3` · `c6`.

### 13.4 Cards & Panel-Blöcke

**Standard-Card:** `#ffffff`, 1 px `--border`, 8 px radius, 18 px 16 px Padding.

**Panel-Blöcke (Formulare):**

| Eigenschaft | Wert |
|---|---|
| Hintergrund | `#f5f9f6` |
| Border | 1 px `#d4e8dc` |
| Border-radius | 8 px |
| Padding | 15 px 16 px |
| Titel | 11 px, 700, uppercase, `#3a7057` |

### 13.5 Modals (`p-dialog`)

| Größe | Max-Breite | Einsatz |
|---|---|---|
| `sm` | 420 px | Marke, Kategorie, Typ |
| Standard | 80 % / max 700 px | Artikel-Dialog |
| `lg` | max 940 px | Admin-Seller-Dialog |

**Footer-Muster:** Standard / Mit Löschen / Nur Schließen (identisch mit Haupt-App).

### 13.6 Badges & Tags

Identisch mit Haupt-App (success/danger/warn/info/sec/original/neu).

### 13.7 Sidebar-Footer

```
┌─────────────────────────────────────────┐
│  [A]  Admin User              ← Avatar  │
│       Administrator           ← Rolle   │
│  ┌──────────┬──────────┐                │
│  │  Admin   │ Verkäufer│  ← Role-Toggle │
│  └──────────┴──────────┘                │
│  🚪 Abmelden                            │
└─────────────────────────────────────────┘
```

| Element | Stil |
|---|---|
| Avatar-Kreis | 36 px, `#3ecf8e`, weiß, Initial-Buchstabe 15 px 700 |
| Username | 13 px, 600, weiß |
| Role-Label | 11 px, `--sidebar-section`-Farbe |
| Role-Toggle-Container | `background: rgba(255,255,255,0.08)`, radius 6 px |
| Toggle-Button | flex: 1, padding 6 px 10 px, 12 px, 600; aktiv = Akzentfarbe + weiß |
| Logout | 13 px, muted; hover = weiß; mt 8 px |

**Sichtbarkeit:** Role-Toggle nur für Admins.

### 13.8 PrimeNG MISC-Komponenten

| Komponente | Einsatz |
|---|---|
| `pAutoFocus` | Erstes Feld in Dialogen |
| `pFocusTrap` | Fokus in offenem `p-dialog` |
| `pAnimateOnScroll` | KPI-Kacheln beim Scrollen |
| `p-avatar` | Sidebar-Footer: Initial-Buchstabe, Farbe `#3ecf8e` |
| `p-badge` | Artikel-Anzahl im Sidebar-Menüpunkt |
| `p-chip` | Aktive Filter-Tags |
| `p-progressspinner` | Ladeindikator bei Suche |
| `p-skeleton` | Tabellen-Lade-Skelett |
| `p-scrolltop` | Scroll-nach-oben ab 400 px |

---

## 14. Offene Fragen

| # | Frage | Status |
|---|---|---|
| 5 | Mehrsprachigkeit? | ✅ Ja — DE + EN via ngx-translate |
| 6 | Provisionssystem / unterschiedliche Konditionen? | ✅ Ja, via Verkäufer-Type |
