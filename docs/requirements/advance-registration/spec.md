---
id: DOC-004
status: draft
updated: 2026-07-31
---

# Lastenheft — Voranmelde-App

## Index
- 1. Überblick — App-Beschreibung
- 2. Stakeholder — Rollen
- 3. Ziel — Kernprozesse
- 4. Rollen & Rechte — Zugriffsmatrix
- 5. Registrierung & Einladung — Onboarding
- 6. Nummernblock-System — Nummerierung
- 7. Navigation (Sidebar) — Seitenstruktur
- 8. Epic-Übersicht & Implementierungsreihenfolge — Setup + fachliche Epics
- 9. UI-Konventionen & Komponenten — Design
- 10. Technische Rahmenbedingungen — Tech-Stack
- 11. Gemeinsame Anforderungen — Querschnitt
- 12. Design-Entscheidungen — Visuelles
- 13. Visual Specs (Global) — PrimeNG-Mapping
- 14. Offene Fragen — Backlog
- Tags & Piles — Ablage

**Version:** 0.8
**Datum:** 2026-07-31
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

### Admin — Sidebar-Reihenfolge

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

### Verkäufer — Sidebar-Reihenfolge

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

## 8. Epic-Übersicht & Implementierungsreihenfolge

Die Epics sind in der empfohlenen Implementierungsreihenfolge aufgelistet.
Setup-Epics sind Voraussetzung für alle fachlichen Epics und werden zuerst umgesetzt.
Fachliche Epics folgen in der Reihenfolge ihrer Abhängigkeiten.

### Setup (Voraussetzung)

| # | Epic | Sichtbar für | Beschreibung | Epic-Datei |
|---|---|---|---|---|
| 1 | **Projektanlage** | — | Angular + .NET + Docker Compose + EF Core + JWT-Basis anlegen | [Epic_Projektanlage](epics/Epic_Projektanlage/epic.md) |
| 2 | **App Shell** | — | Sidebar, responsives Layout, Routing + Guards, JWT-Auth-Infrastruktur, PrimeNG-Theme | [Epic_App_Shell](epics/Epic_App_Shell/epic.md) |

### Zugang

| # | Epic | Sichtbar für | Beschreibung | Epic-Datei |
|---|---|---|---|---|
| 3 | **Login** | Alle (nicht eingeloggt) | Login-Formular, Token empfangen, Weiterleitung | [Epic_Login](epics/Epic_Login/epic.md) |

### Stammdaten (zuerst, da alle anderen davon abhängen)

| # | Epic | Sichtbar für | Beschreibung | Epic-Datei |
|---|---|---|---|---|
| 4 | **Marken** | Admin | Marken-Tabelle, Anlegen/Bearbeiten | [Epic_Marken](epics/Epic_Marken/epic.md) |
| 5 | **Kategorien** | Admin | Kategorien-Tabelle, Anlegen/Bearbeiten | [Epic_Kategorien](epics/Epic_Kategorien/epic.md) |
| 6 | **Verkäufer-Typen** | Admin | Typen-Tabelle, Provision/Gebühr | [Epic_Verkaeufer_Typen](epics/Epic_Verkaeufer_Typen/epic.md) |

### Verwaltung & Konto (abhängig von Stammdaten)

| # | Epic | Sichtbar für | Beschreibung | Epic-Datei |
|---|---|---|---|---|
| 7 | **Verkäufer** | Admin | Verkäuferliste, Einladen, Nummernblock-Zuweisung | [Epic_Verkaeufer](epics/Epic_Verkaeufer/epic.md) |
| 8 | **Profil** | Alle | Eigenes Profil anzeigen und bearbeiten | [Epic_Profil](epics/Epic_Profil/epic.md) |
| 9 | **Nummernblöcke** | Verkäufer | Zugewiesene Nummernblöcke einsehen (read-only) | [Epic_Nummernbloecke](epics/Epic_Nummernbloecke/epic.md) |

### Artikel (abhängig von Marken + Kategorien)

| # | Epic | Sichtbar für | Beschreibung | Epic-Datei |
|---|---|---|---|---|
| 10 | **Meine Artikel** | Alle | Eigene Artikelliste verwalten | [Epic_Meine_Artikel](epics/Epic_Meine_Artikel/epic.md) |
| 11 | **Alle Artikel** | Admin | Artikel-Übersicht aller Verkäufer | [Epic_Alle_Artikel](epics/Epic_Alle_Artikel/epic.md) |

### Dashboards (abhängig von Artikel + Profil + Nummernblöcke)

| # | Epic | Sichtbar für | Beschreibung | Epic-Datei |
|---|---|---|---|---|
| 12 | **Home (Verkäufer-Ansicht)** | Alle | KPI-Kacheln, Countdown, Aktivitäts-Heatmap | [Epic_Home_Verkaeufer](epics/Epic_Home_Verkaeufer/epic.md) |
| 13 | **Home (Admin-Ansicht)** | Admin | Admin-KPIs, Verkäufer-Statistik | [Epic_Home_Admin](epics/Epic_Home_Admin/epic.md) |

### System

| # | Epic | Sichtbar für | Beschreibung | Epic-Datei |
|---|---|---|---|---|
| 14 | **Einstellungen** | Admin | Systemparameter, Nummernblock-Konfiguration | [Epic_Einstellungen](epics/Epic_Einstellungen/epic.md) |
| 15 | **Export** | Admin | JSON-Export für Haupt-App | [Epic_Export](epics/Epic_Export/epic.md) |

---

## 9. UI-Konventionen & Komponenten

Geteilte UI-Komponenten (app- und feature-übergreifend):
→ [`docs/components/`](../../components/overview.md)

Feature-spezifische UI-Specs:
→ jeweils als Story im Verzeichnis des betreffenden Features

---

## 10. Technische Rahmenbedingungen

### 10.0 Tech-Stack

| Komponente | Technologie |
|---|---|
| **Frontend** | Angular 20 (Standalone Components, Signals, OnPush) |
| **Backend** | .NET 9 Minimal API (Microservices) |
| **ORM** | Entity Framework Core |
| **Datenbank** | PostgreSQL |
| **UI-Bibliothek** | PrimeNG 20 |
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

## 13. UI-Komponenten (Visual Specs)

Geteilte UI-Komponenten (app- und feature-übergreifend):
→ [`docs/components/`](../../components/overview.md)

Feature-spezifische UI-Specs:
→ jeweils als Story im Verzeichnis des betreffenden Features

---

## 14. Offene Fragen

| # | Frage | Status |
|---|---|---|
| 5 | Mehrsprachigkeit? | ✅ Ja — DE + EN via ngx-translate |
| 6 | Provisionssystem / unterschiedliche Konditionen? | ✅ Ja, via Verkäufer-Type |

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #requirements #voranmelde-app #lastenheft #verkäufer #admin
