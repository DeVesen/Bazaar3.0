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
- 5. Epic-Übersicht & Implementierungsreihenfolge — Setup + fachliche Epics
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

## 5. Epic-Übersicht & Implementierungsreihenfolge

Die Epics sind in der empfohlenen Implementierungsreihenfolge aufgelistet.
Setup-Epics sind Voraussetzung für alle fachlichen Epics und werden zuerst umgesetzt.
Fachliche Epics folgen in der Reihenfolge ihrer Abhängigkeiten.

### Setup (Voraussetzung)

| # | Epic | Beschreibung | Epic-Datei |
|---|---|---|---|
| 1 | **Projektanlage** | Angular + .NET + Docker Compose + EF Core anlegen | [Epic_Projektanlage](epics/Epic_Projektanlage/epic.md) |
| 2 | **App Shell** | Sidebar, responsives Layout, Routing-Skeleton, PrimeNG-Theme | [Epic_App_Shell](epics/Epic_App_Shell/epic.md) |

### Stammdaten (zuerst, da Tagesgeschäft davon abhängt)

| # | Epic | Beschreibung | Epic-Datei |
|---|---|---|---|
| 3 | **Marken** | Marken-Tabelle, Anlegen/Bearbeiten | [Epic_Marken](epics/Epic_Marken/epic.md) |
| 4 | **Kategorien** | Kategorien-Tabelle, Anlegen/Bearbeiten | [Epic_Kategorien](epics/Epic_Kategorien/epic.md) |
| 5 | **Verkäufer-Typen** | Typen-Tabelle, Provision/Gebühr | [Epic_Verkaeufer_Typen](epics/Epic_Verkaeufer_Typen/epic.md) |
| 6 | **Verkäufer** | Verkäuferliste, Karten-Layout, Artikel-Freigeben | [Epic_Verkaeufer](epics/Epic_Verkaeufer/epic.md) |
| 7 | **Artikel** | Artikel-Übersicht aller Verkäufer, Status-Popup | [Epic_Artikel](epics/Epic_Artikel/epic.md) |

### Tagesgeschäft (abhängig von Stammdaten)

| # | Epic | Beschreibung | Epic-Datei |
|---|---|---|---|
| 8 | **Artikelannahme** | Verkäufer suchen/anlegen, Artikel aufnehmen, Wizard | [Epic_Artikelannahme](epics/Epic_Artikelannahme/epic.md) |
| 9 | **Verkauf** | Kassenvorgang, Barcode-Scan, Warenkorb | [Epic_Verkauf](epics/Epic_Verkauf/epic.md) |
| 10 | **Abrechnung** | Rückgabe, Abrechnen, Auszahlungsberechnung | [Epic_Abrechnung](epics/Epic_Abrechnung/epic.md) |

### System

| # | Epic | Beschreibung | Epic-Datei |
|---|---|---|---|
| 11 | **Statistik** | KPI-Kacheln, Leaderboard (read-only) | [Epic_Statistik](epics/Epic_Statistik/epic.md) |
| 12 | **Druckfunktionen** | Artikelannahme-Liste, Verkäufer-Übersicht | [Epic_Druckfunktionen](epics/Epic_Druckfunktionen/epic.md) |
| 13 | **Einstellungen** | Systemparameter + JSON-Import | [Epic_Einstellungen](epics/Epic_Einstellungen/epic.md) |

---

## 6. UI-Konventionen & Komponenten

Geteilte UI-Komponenten (app- und feature-übergreifend):
→ [`docs/components/`](../../components/overview.md)

Feature-spezifische UI-Specs:
→ jeweils als Story im Verzeichnis des betreffenden Features

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

## 11. UI-Komponenten (Visual Specs)

Geteilte UI-Komponenten (app- und feature-übergreifend):
→ [`docs/components/`](../../components/overview.md)

Feature-spezifische UI-Specs:
→ jeweils als Story im Verzeichnis des betreffenden Features

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
