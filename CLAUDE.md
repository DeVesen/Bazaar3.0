# Bazaar Suite

Die **Bazaar Suite** ist eine zweiteilige Software-Suite zur Verwaltung eines Nummern-Basars.
Sie besteht aus der **Haupt-App** (operativer Basar-Betrieb, lokal) und der **Voranmelde-App**
(Selbstregistrierung der Verkäufer, Cloud).

## Anforderungen

Einstieg → [`docs/requirements/overview.md`](docs/requirements/overview.md)

Dort liegt die Suite-Beschreibung sowie die Links zu den Anforderungen beider Apps.

## Komponenten

Unter [`docs/components/`](docs/components/) liegen alle UI-Komponenten-Beschreibungen —
unabhängig davon, ob sie App-übergreifend, Epic-übergreifend oder Epic-intern sind.

**Struktur:**
```
docs/components/<name>/        ← Verzeichnisname auf Englisch
├── component.md               ← Aussehen, Verhalten, Funktionen
└── reference/                 ← optional: Referenz-Anhänge
```

Einstieg und Index → [`docs/components/overview.md`](docs/components/overview.md)

Dort liegt auch die **PrimeNG-Grundregel**: Ausschließlich PrimeNG, kein natives HTML,
keine anderen Libraries. Fehlende Komponenten → eigener Wrapper auf PrimeNG-Basis.

Epic-spezifische Ausprägungen (z. B. welche Spalten eine Tabelle zeigt) bleiben
im jeweiligen Epic-Dokument.

## Architektur

> **Diese Datei ist nicht die Quelle der Wahrheit.** Alle App-Entscheidungen — Architektur,
> Tech-Stack, Sprachregel, Entwicklungsrichtlinie — stehen in der jeweiligen App-Spec unter
> `docs/requirements/<app>/`, damit ein App-Verzeichnis vollständig für sich stehend in ein
> anderes Projekt kopiert werden kann. Bei Widerspruch gewinnt die App-Spec.

| App | Verbindlicher Abschnitt |
|-----|------------------------|
| Voranmelde-App | [`advance-registration/spec.md`](docs/requirements/advance-registration/spec.md) §10.0.1 Architektur · §10.0.2 Durchstich · §10.0.3 UI-Bibliothek |
| Haupt-App | [`bazaar-app/spec.md`](docs/requirements/bazaar-app/spec.md) §7.0.1 Architektur · §7.0.2 Durchstich · §7.0.3 UI-Bibliothek |

Kurzorientierung (Details ausschließlich dort): Backend **hexagonal** in vier Projekten
(`Bazaar.Domain` / `.Application` / `.Infrastructure` / `.Api`), Frontend **Feature-First**
(`src/app/features/<feature>/` + `core/` + `shared/`), Deployment **Monolith**, Data-Flow
**CRUD** mit eigenen Query-Ports für Read-Models. Code, Routen und JSON-Contract englisch,
Doku deutsch.

Stil-Nachschlagewerk (nicht projektverbindlich): Skill `architecture-styles`

## Epics

Jedes Epic ist ein **Verzeichnis** (Name des Epics), nicht eine einzelne Datei.

**Struktur:**
```
docs/requirements/<app>/epics/<Epic-Name>/
├── epic.md                    ← Überblick, Zweck, Story-Index
└── stories/                   ← eine Datei pro User Story
```

## Entwicklungsrichtlinie: Epic als vollständiger Durchstich

Jedes fachliche Epic wird als **kompletter vertikaler Durchstich** implementiert — Frontend
und Backend gemeinsam, nicht nacheinander. Ausnahmen sind die beiden Setup-Epics
(`Epic_Projektanlage`, `Epic_App_Shell`).

Verbindlich mit Schichten-Tabelle und Reihenfolge in der App-Spec:
[Voranmelde-App §10.0.2](docs/requirements/advance-registration/spec.md) ·
[Haupt-App §7.0.2](docs/requirements/bazaar-app/spec.md)

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #project-setup #claude-instructions #struktur #primeng #features
