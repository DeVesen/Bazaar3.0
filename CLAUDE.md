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

## Quellcode-Ablage

Die Anforderungen aus `docs/requirements/<app>/` werden unter `src/<app>/` umgesetzt —
Doku-Verzeichnisname und Code-Verzeichnisname sind identisch.

**Voranmelde-App** (`docs/requirements/advance-registration/`):
```
src/advance-registration/
├── frontend/                  ← Angular-Frontend
└── backend/                   ← BAR.SharedKernel, BAR.Modules.<Abteilung>[.Contracts], BAR.Host
```

**Haupt-App** (`docs/requirements/bazaar-app/`):
```
src/bazaar-app/
├── frontend/                  ← Angular-Frontend
└── backend/                   ← alle Backend-Projekte (Domain/Application/Infrastructure/Api)
```

## Knowledge Graph (graphify)

Der Skill `graphify` legt seine Ergebnisse in `graphify-out/` **relativ zum Working Directory**
ab — bei einem Lauf im Repo-Root also `C:\Develop\Bazaar3.0\graphify-out\`.

| Datei | Inhalt |
|-------|--------|
| `graph.json` | Rohgraph, GraphRAG-ready |
| `GRAPH_REPORT.md` | Audit-Report: God Nodes, Surprising Connections, Suggested Questions |
| `graph.html` | interaktiver Graph für den Browser |
| `cost.json` | kumulierter Token-Verbrauch aller Läufe |
| `obsidian/` | Obsidian-Vault, nur mit `--obsidian` |
| `.graphify_*` | Zwischenstände und Extraktions-Cache |

`graphify-out/` ist in `.gitignore` — generierte Artefakte werden **nicht** versioniert.

Ein Lauf im Repo-Root fasst `docs/` und beide Apps in einen Graph. Für einen App-scharfen
Graph aus dem jeweiligen App-Verzeichnis heraus starten (`src/advance-registration/` bzw.
`src/bazaar-app/`) — das `graphify-out/` entsteht dann dort.

## Architektur

> **Diese Datei ist nicht die Quelle der Wahrheit.** Alle App-Entscheidungen — Architektur,
> Tech-Stack, Sprachregel, Entwicklungsrichtlinie — stehen in der jeweiligen App-Spec unter
> `docs/requirements/<app>/`, damit ein App-Verzeichnis vollständig für sich stehend in ein
> anderes Projekt kopiert werden kann. Bei Widerspruch gewinnt die App-Spec.

| App | Verbindlicher Abschnitt |
|-----|------------------------|
| Voranmelde-App | [`advance-registration/spec.md`](docs/requirements/advance-registration/spec.md) §10.0.1 Architektur · §10.0.2 Durchstich · §10.0.4 UI-Bibliothek |
| Haupt-App | [`bazaar-app/spec.md`](docs/requirements/bazaar-app/spec.md) §7.0.1 Architektur · §7.0.2 Durchstich · §7.0.3 UI-Bibliothek |

Kurzorientierung (Details ausschließlich dort) — die beiden Apps sind seit dem
Modulith-Umbau der Voranmelde-App **keine Kopien mehr voneinander**, jede App-Spec ist die
alleinige Wahrheit für ihre App:

- **Voranmelde-App:** Backend **modularer Monolith**, ein Hexagon je Abteilung
  (`BAR.Modules.<Abteilung>` + `.Contracts`, `BAR.SharedKernel`, `BAR.Host` als Composition
  Root). Frontend **Feature-First mit Abteilungs-Gruppierung**
  (`src/app/features/<abteilung>/<feature>/` + `core/` + `shared/`), Cross-Feature-Imports
  per `eslint-plugin-boundaries` erzwungen, nicht nur dokumentiert.
- **Haupt-App:** Backend **hexagonal**, ein Hexagon pro App (`Domain` / `Application` /
  `Infrastructure` + Host-Projekt). Frontend **Feature-First**
  (`src/app/features/<feature>/` + `core/` + `shared/`).

Beide Apps: Deployment **Monolith** (ein Container je App), Data-Flow **CRUD** mit eigenen
Query-Ports für Read-Models. Code, Routen und JSON-Contract englisch, Doku deutsch.

Die Assembly-Präfixe unterscheiden sich je App, damit die Namen nicht kollidieren:

| App | Präfix | Host-Projekt |
|-----|--------|--------------|
| Voranmelde-App | `BAR.` | `BAR.Host` |
| Haupt-App | `Bazaar.` | `Bazaar.Api` |

Stil-Nachschlagewerk (nicht projektverbindlich): Skill `architecture-styles`

## Anwendungswissen (module-profile / feature-profile / glossary)

Ablage für die `dv-working-capturing`-Skills (module-profile, feature-profile, glossary,
update) — Code-Ist-Zustand, nicht Anforderung:

| Skill | Root |
|-------|------|
| `module-profile` | `docs/knowledge/module-profile/<modul-name>/module.md` |
| `feature-profile` | `docs/knowledge/feature-profile/<feature-name>/feature.md` |
| `glossary` | `docs/glossary/<area>.md` |

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
