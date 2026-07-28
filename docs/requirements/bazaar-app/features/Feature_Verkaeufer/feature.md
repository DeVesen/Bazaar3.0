# Feature: Verkäufer

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Verkäufer

---

## Überblick

Die Verkäufer-Seite zeigt alle Verkäufer als Karten-Grid. Von hier aus wird der Artikel-Freigeben-Prozess gestartet.

---

## 1. Filter-Panel

2-zeiliges Panel oberhalb der Karten-Liste:

| Zeile | Elemente |
|---|---|
| 1 | Freitext-Suche (Name, Ort) · Sortierung-Dropdown |
| 2 | Status-Dropdown |

**„+ Neu"-Button** befindet sich ausschließlich im Seitentitel (Page-Header) — nicht in der Filter-Toolbar.

**Status-Dropdown:** Alle · Offen · Im Verkauf · Abgerechnet

**Sortierung-Dropdown:**

| Option | Sortierkriterium |
|---|---|
| Name (Standard) | Nachname + Vorname alphabetisch |
| Angenom. Warenwert | Summe aller angenommenen Artikel, absteigend |
| Offener Warenwert | Summe der noch im Verkauf befindlichen Artikel, absteigend |
| Umsatz | Summe der verkauften Artikel, absteigend |

**Aktive Filter** werden als `p-chip`-Tags unterhalb des Filter-Panels angezeigt (mit × zum Entfernen).

---

## 2. Status-Definition

| Status | Bedingung |
|---|---|
| **Offen** | Kein Artikel ist aktuell freigegeben |
| **Im Verkauf** | Mindestens ein Artikel freigegeben; noch nicht abgerechnet |
| **Abgerechnet** | `abgerechnetAm` ist gesetzt |

---

## 3. Verkäufer-Karte

**Grid:** `repeat(auto-fill, minmax(340px, 1fr))`, gap 12 px.

```
┌──────────────────────────────────────────────┐
│ [Name 700/15px]  [Typ-Badge]  [✏️] [📷]      │
│ [PLZ Ort  #ID]  ← 12px, muted, mb 8px        │
│ [Status-Badge]  ← mb 8px                      │
│ ┌──────────────────────────────────────────┐  │
│ │ Artikel gesamt: X  │ Freigegeben: X      │  │
│ │ Verkauft: X        │ Rückgegeben: X      │  │
│ └──────────────────────────────────────────┘  │
│ ┌──────────────┬───────────────┬──────────┐   │
│ │ Angenom. WW  │ Offener WW    │ Umsatz   │   │
│ └──────────────┴───────────────┴──────────┘   │
└──────────────────────────────────────────────┘
```

**Elemente:**

| Element | Stil |
|---|---|
| Karte | padding 16 px |
| Kopfzeile | flex, justify-content space-between, align-items flex-start |
| Name + Typ-Badge | nebeneinander (gap 8 px), Typ-Badge 10 px |
| Action-Buttons | flex, gap 6 px |
| Adresse + ID | 12 px, muted; `#ID` in font-weight 600 |
| Stats-Grid | 2×2 Spalten, gap row 3px / col 16px, 12.5 px; dt=muted, dd=600 |
| Footer-Grid | 3 gleichbreite Spalten; border-top 1 px, pt 10 px, mt 6 px |
| Footer-Label | 10 px, muted, uppercase |
| Footer-Wert | 700, 14 px |

**Footer-Werte:**

| Wert | Berechnung |
|---|---|
| Angenom. Warenwert | Summe aller Artikel mit `freigegebenAm` gesetzt |
| Offener Warenwert | Summe aller Artikel mit `freigegebenAm` gesetzt, `verkauftAm` und `zurueckgegebenAm` leer |
| Umsatz | Summe aller Artikel mit `verkauftAm` gesetzt |

**Aktions-Buttons (top-right):**
- **Edit** (`p-button severity="secondary" [outlined]="true" size="small"`) → öffnet Verkäufer-Bearbeiten-Dialog
- **Scanner** (`p-button severity="secondary" [outlined]="true" size="small"`, Kamera-Icon) → öffnet Artikel-Freigeben-Dialog

**Status-Badge** (zeigt genau einen Badge):

| Bedingung | Badge |
|---|---|
| `abgerechnetAm` gesetzt | `Abgerechnet` (success, grün) |
| Mind. 1 Artikel freigegeben, nicht abgerechnet | `Im Verkauf` (info, blau) |
| Kein freigegebener Artikel | `Offen` (sec, grau) |

**Klick auf Status-Badge** → Popup mit Abrechnungs-Zeitstempel:
- Zeigt: „Abgerechnet Am ‹Zeitstempel›"
- **Löschen-Button** zum Zurücksetzen auf NULL
- Kein manuelles Setzen möglich

---

## 4. Verkäufer bearbeiten

Dialog (Standard-Größe) mit Panels 01–03 (Personendaten, Kontakt, Konditionen) — identische Feldanordnung wie Wizard Schritt 1.

Zusätzlich **Panel 05 — Sonstiges**:
- **Toggle-Schalter „Admin-Rechte"**: gibt nach Login die Admin-Ansicht frei (nur für Admins sichtbar)
  - In der Haupt-App nicht relevant (kein Auth-System) — dieses Feld existiert nur in der Voranmelde-App
- Kein Einladungs-Link in der Haupt-App

---

## 5. Artikel-Freigeben-Popup

→ Komponente: [Scan-Dialog](../../../../components/scan-dialog/component.md) — `targetField="freigegebenAm"`

Erreichbar über den **Scanner-Button** in der Verkäufer-Karte.

### Eingabe-Modus

Eingabefeld (Artikelnummer) + AutoComplete-Liste darunter.

| Zustand | Verhalten |
|---|---|
| (leer) | Liste zeigt alle noch **nicht freigegebenen** Artikel dieses Verkäufers |
| Eingabe | Filtert die Liste nach Artikelnummer |
| Genau 1 Treffer + ENTER | Artikel bekommt `freigegebenAm = jetzt`; Eingabefeld leert sich; Liste zeigt wieder alle ausstehenden |
| Kein Treffer | Liste verschwindet; Text: *„Artikel nicht bekannt"* |
| Alle freigegeben | Nur Text: *„Alle Artikel freigegeben"* |

Neben dem Eingabefeld: **BC-Button** → wechselt in Kamera-Modus (Inline-Modus).

### Kamera-Modus (Inline)

Kamerabild ersetzt Eingabefeld + Liste.

Nach erfolgreichem Scan:

| Ergebnis | Farbe | Dauer |
|---|---|---|
| Erfolgreich freigegeben | 🟢 Grün | konfigurierbar (Default 5 Sek.) |
| Bereits freigegeben | 🟡 Gelb | konfigurierbar |
| Nicht bekannt | 🔴 Rot | konfigurierbar |

Nach Ablauf der Anzeigezeit → Kamerabild wieder aktiv.

**Abbrechen-Button** → zurück in Eingabe-Modus.

**Feedback:** Ton (Web Audio API) + Vibration (`Navigator.vibrate()`).
