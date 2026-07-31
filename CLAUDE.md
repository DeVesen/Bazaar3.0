# Bazaar Suite

Die **Bazaar Suite** ist eine zweiteilige Software-Suite zur Verwaltung eines Nummern-Basars.
Sie besteht aus der **Haupt-App** (operativer Basar-Betrieb, lokal) und der **Voranmelde-App**
(Selbstregistrierung der Verkäufer, Cloud).

## Anforderungen

Einstieg → [`docs/requirements/overview.md`](docs/requirements/overview.md)

Dort liegt die Suite-Beschreibung sowie die Links zu den Anforderungen beider Apps.

## Komponenten

Unter [`docs/components/`](docs/components/) liegen alle UI-Komponenten-Beschreibungen —
unabhängig davon, ob sie App-übergreifend, Feature-übergreifend oder Feature-intern sind.

**Struktur:**
```
docs/components/<name>/        ← Verzeichnisname auf Englisch
├── component.md               ← Aussehen, Verhalten, Funktionen
└── reference/                 ← optional: Referenz-Anhänge
```

Einstieg und Index → [`docs/components/overview.md`](docs/components/overview.md)

Dort liegt auch die **PrimeNG-Grundregel**: Ausschließlich PrimeNG, kein natives HTML,
keine anderen Libraries. Fehlende Komponenten → eigener Wrapper auf PrimeNG-Basis.

Feature-spezifische Ausprägungen (z. B. welche Spalten eine Tabelle zeigt) bleiben
im jeweiligen Feature-Dokument.

## Features

Jedes Feature ist ein **Verzeichnis** (Name des Features), nicht eine einzelne Datei.

**Struktur:**
```
docs/requirements/<app>/features/<Feature-Name>/
├── feature.md                 ← Überblick, Zweck, Story-Index
└── stories/                   ← eine Datei pro User Story
```

## Entwicklungsrichtlinie: Feature als vollständiger Durchstich

Jedes fachliche Feature wird als **kompletter vertikaler Durchstich** implementiert — Frontend und Backend gemeinsam, nicht nacheinander.

**Was das konkret bedeutet:**

| Schicht | Inhalt |
|---|---|
| **Angular (Frontend)** | Seite / Komponente, Routing, Service, State (Signals) |
| **.NET Minimal API (Backend)** | API-Endpoint(s), Request/Response-DTOs, Fehlerbehandlung |
| **EF Core / DB** | Entity, Migration (nur wenn neue Tabelle oder Spalte entsteht) |

**Reihenfolge je Feature:**
1. API-Vertrag definieren (Endpoint, Request, Response)
2. Backend implementieren und lokal testen
3. Angular-Service und Komponente gegen echten Endpoint implementieren

**Ausnahmen — keine fachlichen Durchstiche:**
- `Feature_Projektanlage` — technisches Setup (Projekte anlegen, Docker, EF Core)
- `Feature_App_Shell` — Grundgerüst (Sidebar, Layout, Routing-Skeleton, Theme)

Diese beiden Setup-Features sind Voraussetzung für alle fachlichen Features und enthalten keine eigene Business-Logik.

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #project-setup #claude-instructions #struktur #primeng #features
