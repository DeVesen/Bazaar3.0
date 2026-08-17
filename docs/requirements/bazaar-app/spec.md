---
id: DOC-005
status: draft
updated: 2026-08-17
---

# Lastenheft — Bazaar Haupt-App

## Index
- 1. Überblick — App-Beschreibung
- 2. Stakeholder — Rollen
- 3. Ziel — Kernprozesse
- 4. Navigation & Rechte — Seitenstruktur, Rechte-Matrix
- 5. Epic-Übersicht & Implementierungsreihenfolge — Setup + fachliche Epics
- 6. UI-Konventionen & Komponenten — Design
- 7. Technische Rahmenbedingungen — Tech-Stack, Architektur, Offline
- 8. Einstellungen — Parameter
- 9. Gemeinsame Anforderungen — Querschnitt
- 10. Design-Entscheidungen — Visuelles
- 11. Offene Fragen — Backlog
- Tags & Piles — Ablage

**Version:** 0.9
**Datum:** 2026-08-17
**Autor:** Sven Reichert
**Status:** Entwurf (6 von 14 Epics reviewed)

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
| **Admin** | Betreiber des Basars. Verwaltet Stammdaten, Verkäufer, Benutzer und Einstellungen und führt den Import durch. |
| **Kassenpersonal** | Führt Artikelannahme, Verkauf und Abrechnung am Basar-Tag durch. |

Beide Rollen sind **echte Berechtigungen**, keine bloße Tätigkeitsbeschreibung: Jeder Nutzer meldet sich mit eigenem Konto an, die Rolle steht als Claim im Token und wird am Endpoint geprüft. Zuschnitt und Begründung → [Epic_Login](epics/Epic_Login/epic.md), Matrix → Abschnitt 4.

Verkäufer sind **keine** Nutzer dieser App — sie kommen als Datensätze über den JSON-Import und melden sich nie an.

---

## 3. Ziel

Die Haupt-App unterstützt drei operative Kernprozesse:

1. **Artikelannahme** — Verkäufer und ihre Artikel werden aufgenommen; Artikel erhalten Status „Im Verkauf"
2. **Verkauf** — Kassenvorgang mit Barcode/QR-Scan oder manueller Eingabe
3. **Abrechnung** — Rückgabe nicht verkaufter Artikel + finanzielle Abrechnung mit dem Verkäufer

---

## 4. Navigation & Rechte

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
  Verkäufer-Typen
  ─────────────── (Trennlinie)
── System ────────────────────
  Statistik
  Einstellungen              (nur Admin)
──────────────────────────────
  Sidebar-Footer: Avatar · Benutzername · Rolle · Abmelden
```

**Druckfunktionen haben keinen Menüpunkt und keine Route** — der Ausdruck startet automatisch nach dem Buchen in der Artikelannahme bzw. per Button in der Abrechnung (siehe [Epic_Druckfunktionen](epics/Epic_Druckfunktionen/epic.md)).

**Routen-Pfade sind englisch** (`/intake`, `/checkout`, `/settlement`, `/sellers`, `/articles`, `/brands`, `/categories`, `/seller-types`, `/statistics`, `/settings`) — Sprachregel siehe Abschnitt 7.0.1. Die deutschen Menü-Labels oben sind Anzeigetexte, keine Pfade. Vollständige Tabelle → BSHELL-S03.

**Home** leitet automatisch auf **Artikelannahme** weiter — kein eigener Seiteninhalt.

Die Sidebar ist **rollenabhängig**: Kassenpersonal sieht den Eintrag **Einstellungen** nicht. Einen Role-Toggle wie in der Voranmelde-App gibt es **nicht** — der Admin hat ohnehin alle Rechte des Kassenpersonals, ein Toggle würde ihm nur künstlich Rechte wegnehmen.

Die Login-Seite (`/login`) läuft außerhalb der AppShell — ohne Sidebar und ohne Titelleiste.

### 4.1 Rechte-Matrix

Verbindlich für alle Epics. Ein Epic, das davon abweichen will, ändert diese Tabelle, statt es lokal anders zu regeln.

| Bereich | Admin | Kassenpersonal |
|---|---|---|
| Artikelannahme | ✅ | ✅ |
| Verkauf | ✅ | ✅ |
| Abrechnung | ✅ | ✅ |
| Drucken (Aktion in Artikelannahme und Abrechnung, keine eigene Seite) | ✅ | ✅ |
| Artikel (Übersicht) | ✅ | ✅ lesen, kein Status-Popup |
| Verkäufer | ✅ | ✅ anlegen und bearbeiten, kein Löschen |
| Verkäufer-Konditionen überschreiben (`salesCommission`, `feePerItem`) | ✅ | ❌ — sieht die aus dem Typ abgeleiteten Werte schreibgeschützt |
| Marken / Kategorien / Verkäufer-Typen | ✅ | ✅ lesen; Marken und Kategorien zusätzlich implizit über AutoComplete anlegen (Abschnitt 9.3) |
| Statistik | ✅ | ✅ lesen |
| Einstellungen (inkl. Import und Benutzerverwaltung) | ✅ | ❌ |
| Abrechnung stornieren, Artikel löschen | ✅ | ❌ |

Leitgedanke: Kassenpersonal darf am Basar-Tag alles Operative ohne Nachfragen, aber nichts Zerstörendes und nichts Konfigurierendes. Das implizite Anlegen von Marken und Kategorien ist bewusst erlaubt — sonst blockiert die Artikelannahme an der erstbesten unbekannten Marke.

Durchsetzung an zwei Stellen: `adminGuard` im Frontend (Route nicht erreichbar) und Rollenprüfung am Endpoint im Backend (`403`). Das Frontend ist die Bequemlichkeit, das Backend die Regel.

---

## 5. Epic-Übersicht & Implementierungsreihenfolge

Die Epics sind in der empfohlenen Implementierungsreihenfolge aufgelistet.
Setup-Epics sind Voraussetzung für alle fachlichen Epics und werden zuerst umgesetzt.
Fachliche Epics folgen in der Reihenfolge ihrer Abhängigkeiten.

### Setup (Voraussetzung)

| # | Epic | Beschreibung | Epic-Datei |
|---|---|---|---|
| 1 | **Projektanlage** | Angular + .NET + Docker Compose + EF Core anlegen | [Epic_Projektanlage](epics/Epic_Projektanlage/epic.md) |
| 2 | **App Shell** | Sidebar, responsives Layout, Routing + Guards, JWT-Auth-Infrastruktur, PrimeNG-Theme | [Epic_App_Shell](epics/Epic_App_Shell/epic.md) |

### Zugang

| # | Epic | Beschreibung | Epic-Datei |
|---|---|---|---|
| 3 | **Login** | Anmeldung mit Benutzername/Passwort, Rollen Admin und Kassenpersonal | [Epic_Login](epics/Epic_Login/epic.md) |

### Stammdaten (zuerst, da Tagesgeschäft davon abhängt)

| # | Epic | Beschreibung | Epic-Datei |
|---|---|---|---|
| 4 | **Marken** | Marken-Tabelle, Anlegen/Bearbeiten | [Epic_Marken](epics/Epic_Marken/epic.md) |
| 5 | **Kategorien** | Kategorien-Tabelle, Anlegen/Bearbeiten | [Epic_Kategorien](epics/Epic_Kategorien/epic.md) |
| 6 | **Verkäufer-Typen** | Typen-Tabelle, Provision/Gebühr | [Epic_Verkaeufer_Typen](epics/Epic_Verkaeufer_Typen/epic.md) |
| 7 | **Verkäufer** | Verkäuferliste, Karten-Layout, Artikel-Freigeben | [Epic_Verkaeufer](epics/Epic_Verkaeufer/epic.md) |
| 8 | **Artikel** | Artikel-Übersicht aller Verkäufer, Status-Popup | [Epic_Artikel](epics/Epic_Artikel/epic.md) |

### Tagesgeschäft (abhängig von Stammdaten)

| # | Epic | Beschreibung | Epic-Datei |
|---|---|---|---|
| 9 | **Artikelannahme** | Verkäufer suchen/anlegen, Artikel aufnehmen, Wizard | [Epic_Artikelannahme](epics/Epic_Artikelannahme/epic.md) |
| 10 | **Verkauf** | Kassenvorgang, Barcode-Scan, Warenkorb | [Epic_Verkauf](epics/Epic_Verkauf/epic.md) |
| 11 | **Abrechnung** | Rückgabe, Abrechnen, Auszahlungsberechnung | [Epic_Abrechnung](epics/Epic_Abrechnung/epic.md) |

### System

| # | Epic | Beschreibung | Epic-Datei |
|---|---|---|---|
| 12 | **Statistik** | KPI-Kacheln, Leaderboard (read-only) | [Epic_Statistik](epics/Epic_Statistik/epic.md) |
| 13 | **Druckfunktionen** | Artikelannahme-Liste, Verkäufer-Übersicht | [Epic_Druckfunktionen](epics/Epic_Druckfunktionen/epic.md) |
| 14 | **Einstellungen** | Systemparameter, Benutzerverwaltung, JSON-Import | [Epic_Einstellungen](epics/Epic_Einstellungen/epic.md) |

**Epic-IDs sind Identität, nicht Sortierung.** `Epic_Login` trägt F-BA-012, weil F-BA-001…011 vergeben sind; die Reihenfolge steht ausschließlich in dieser Tabelle.

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
| **Backend** | .NET 9 Minimal API |
| **ORM** | Entity Framework Core |
| **Datenbank** | PostgreSQL |
| **UI-Bibliothek** | PrimeNG 22.0.0 (kein Angular Material) |
| **Containerisierung** | Docker / Docker Compose |
| **Barcode/QR-Scan** | ZXing / ngx-scanner (Browser-Kamera, offline) |
| **QR-Code-Erzeugung** | `@zxing/library` (`BrowserQRCodeSvgWriter`, clientseitig, offline) — Shared-Component [`qr-code`](../../components/qr-code/component.md) |
| **Icons** | Material Symbols (npm-Paket, kein CDN) |
| **Tests** | Jest (Frontend) · xUnit v3 + FluentAssertions + Moq (Backend) · NetArchTest (Architektur) |
| **Auth** | JWT-Bearer, ein Access-Token (16 h), kein Refresh-Token |

Die PrimeNG-Major-Version ist **identisch zur Voranmelde-App** — beide Apps teilen dieselben
Komponenten-Muster und eigenen Wrapper; zwei Majors würden dieses Wissen doppeln.

### 7.0.1 Architektur

**Dieser Abschnitt ist die verbindliche Quelle der Architekturentscheidungen dieser
App.** Umsetzungsdetails gehören in die Stories von
[Epic_Projektanlage](epics/Epic_Projektanlage/epic.md) — alles innerhalb dieses
Verzeichnisses.

| Achse | Entscheidung |
|---|---|
| Backend-Layering | **Hexagonal** (Ports and Adapters), ein Hexagon pro App |
| Frontend-Struktur | **Feature-First** (`src/app/features/<feature>/`) |
| Deployment | **Monolith** — ein Backend- und ein Frontend-Container, Betrieb lokal im LAN (siehe 7.2 Offline-Fähigkeit). **Keine Microservices** |
| Data-Flow | **CRUD**; aggregierte Sichten (Statistik, Abrechnung) über eigene Query-Ports |

**Backend — vier Projekte**, Abhängigkeitsrichtung compiler-erzwungen:

```
Bazaar.Domain          ← referenziert nichts (Entities, Value Objects, Domain-Services, Ports)
Bazaar.Application     ← Domain (ein Handler pro Use Case)
Bazaar.Infrastructure  ← Domain, Application (EF Core, Repositories, Query-Ports)
Bazaar.Api             ← alle (Minimal-API-Endpoints, Filter, ExceptionHandler)
```

Feature-Ordner existieren **innerhalb** von `Application` und `Api` — kein Hexagon je
Feature. Die Domäne kennt weder EF Core noch ASP.NET; das Entity-Mapping läuft per
Fluent API in `Infrastructure` (`IEntityTypeConfiguration<T>` je Aggregate), die
Entities selbst tragen keine EF-Attribute. Repository-Interfaces liegen in
`Domain/Ports/`, ein Repository pro Aggregate — kein generisches `IRepository<T>`, kein
`IQueryable` über die Port-Grenze. Ein Architektur-Testprojekt (NetArchTest) prüft die
Richtung dort, wo der Compiler es nicht kann.

**Fehler und Validierung:** Fachliche Verstöße werfen Domain-Exceptions, ein globaler
`IExceptionHandler` im Web-Adapter bildet sie als einziger Ort auf `ProblemDetails`
(RFC 9457) ab. Formatvalidierung läuft über FluentValidation in einem generischen
Endpoint-Filter (`400` mit `errors`-Dictionary), Invarianten dagegen in Domäne bzw.
Handler (`409`).

**Frontend — Feature-First:**

```
src/app/features/<feature>/   ← <feature>.routes.ts, pages/, components/, data/, model/
src/app/core/                 ← app-weite Singletons
src/app/shared/               ← wiederverwendbare, dumme UI
```

Cross-Feature-Imports sind per ESLint (`no-restricted-imports`) verboten; `shared/` und
`core/` importieren nie aus `features/`. Path-Aliases `@core/*`, `@shared/*`,
`@features/*`. Pro Seite gilt Integration vs. Leaf: `pages/*.page.ts` orchestriert
(Store injizieren, Kinder verdrahten), `components/**` rendert nur (`input()`/`output()`,
kein Service-Inject, kein HTTP). Datenzugriff je Feature getrennt in
`data/<feature>-api.ts` (Adapter, kennt DTOs und URLs) und `<feature>-store.ts`
(Signals, feature-lokal bereitgestellt).

**Sprachregel:** Code, Routen-Pfade, JSON-Contract und Feldnamen **englisch**;
Doku-Prosa, Doku-Dateinamen und Epic-Ordner **deutsch**.

**Datenmodell:** verbindlich in [`entities/`](entities/overview.md) — eine Datei je
Entität mit vollständiger Feldtabelle, plus das
[Import-Format](entities/import-format.md) der Datei aus der Voranmelde-App.

> **Nachzuziehen:** Einige Epic-Dokumente dieser App führen noch deutsche Feldnamen.
> Verbindlich sind die Feldtabellen unter [`entities/`](entities/overview.md).

### 7.0.2 Entwicklungsrichtlinie: Epic als vollständiger Durchstich

Jedes fachliche Epic wird als **kompletter vertikaler Durchstich** umgesetzt — Frontend
und Backend gemeinsam, nicht nacheinander.

| Schicht | Inhalt |
|---|---|
| Angular (Frontend) | Seite/Komponente, Route, Api + Store, State (Signals) |
| .NET Minimal API (Backend) | Endpoint(s), Request/Response-DTOs, Handler, Fehlerbehandlung |
| EF Core / DB | Entity, Migration (nur wenn neue Tabelle oder Spalte entsteht) |

**Reihenfolge je Epic:** 1. API-Vertrag festlegen → 2. Backend implementieren und lokal
testen → 3. Angular-Api/Store und Seite gegen den echten Endpoint bauen.

**Ausnahmen — keine fachlichen Durchstiche:**
[Epic_Projektanlage](epics/Epic_Projektanlage/epic.md) (technisches Setup) und
[Epic_App_Shell](epics/Epic_App_Shell/epic.md) (Grundgerüst). Beide sind Voraussetzung
für alle fachlichen Epics und enthalten keine Business-Logik.

### 7.0.3 UI-Bibliothek — Grundregel

Ausschließlich **PrimeNG**, kein natives HTML für interaktive Elemente, keine weiteren
UI-Libraries. Fehlt eine Komponente, entsteht ein eigener Wrapper auf PrimeNG-Basis.

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

### 9.1 Marken & Kategorien — Übernahme aus der Voranmelde-App

Marken und Kategorien können in der Voranmelde-App exportiert und hier importiert werden — für konsistente Stammdaten.

**Der Datenfluss ist einseitig:** Die Voranmelde-App exportiert, die Haupt-App importiert. Einen Rückkanal gibt es nicht — die Voranmeldung endet, wenn der Basar beginnt.

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
| `createdAt` | DateTime | Beim Anlegen gesetzt (server-seitig) |
| `updatedAt` | DateTime | Bei jeder Änderung aktualisiert (server-seitig) |

Beide Felder nicht editierbar. Bei Neuanlage gilt `updatedAt = createdAt`.
Die Status-Zeitstempel (`acceptedAt`, `releasedAt`, `soldAt`, `returnedAt`) und das
abgeleitete Statusmodell stehen in [`entities/artikel.md`](entities/artikel.md).

### 9.5 IDs

Alle Entitäten verwenden eine **8-stellige alphanumerische ID** (Groß-/Kleinbuchstaben + Zahlen, case-sensitive).

### 9.6 Verkäufer-Typen

- Enthalten `commissionRate` (Provision in %) und `itemFee` (Gebühr pro Stück in €)
- Template / Vorlage — kein verbindlicher Join
- Beim Anlegen eines Verkäufers werden `salesCommission` und `feePerItem` daraus belegt; ein **Typwechsel überschreibt** beide Felder, auch manuell gesetzte (Bestätigungsdialog, siehe [Epic_Verkaeufer_Typen](epics/Epic_Verkaeufer_Typen/epic.md) Abschnitt 3)
- Überschreiben der Konditionen ist **Admin-only**; Kassenpersonal wählt nur den Typ

Details → [`entities/verkaeufer-typ.md`](entities/verkaeufer-typ.md)

### 9.7 Verkäufer-Konditionen (eigene Felder)

Jeder Verkäufer trägt **eigene** Felder `salesCommission` (%) und `feePerItem` (€/Stück).
Diese sind **maßgeblich** für alle Berechnungen — nicht die aktuellen Werte des
zugewiesenen Typs. Details → [`entities/verkaeufer.md`](entities/verkaeufer.md)

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

## 11. Offene Fragen

| # | Frage | Status |
|---|---|---|
| 1 | Kassenvorgang: Scanner-Typ? | ✅ Beides: USB-Scanner (Tastaturemulation) + Kamera-Scan |
| 2 | Maximale Artikel-Anzahl pro Verkäufer? | ✅ Keine harte Grenze |
| 3 | Marken/Kategorien Freitext oder Liste? | ✅ AutoComplete + Freitext via Popup |
| 4 | Welche Einstellungen soll der Admin konfigurieren? | ✅ `suchDebounceMs` (800 ms) + `scannerPauseMs` (3 000 ms) |
| 5 | Offline-Fähigkeit? | ✅ Ja — lokales LAN, kein Internetzugang, alles im Bundle |
| 6 | Scan-Ergebnis Anzeigedauer? | ✅ Konfigurierbar über `scannerPauseMs`, Default 3 000 ms (Abschnitt 8) |
| 7 | Artikel löschen im Wizard (noch nicht gespeichert)? | ✅ Ja — Löschen-Button pro Eintrag in Session-Liste |
| 8 | Scan-Feedback: Ton und/oder Vibration? | ✅ Beides — Web Audio API + `Navigator.vibrate()` |
| 9 | PrimeNG-Major-Version dieser App? | ✅ 22.0.0, identisch zur Voranmelde-App |
| 10 | Login und Rollen in der Haupt-App? | ✅ Ja — Admin + Kassenpersonal, siehe Abschnitt 4.1 und [Epic_Login](epics/Epic_Login/epic.md) |

---

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #requirements #haupt-app #lastenheft #kassenpersonal #admin
