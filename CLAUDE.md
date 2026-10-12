# Bazaar Suite

Bazaar Suite: Nummern-Basar, zwei Apps — Haupt-App (lokal, Basar-Betrieb), Voranmelde-App (Cloud, Verkäufer-Selbstregistrierung).

## Anforderungen

Einstieg → [`docs/requirements/overview.md`](docs/requirements/overview.md)

## Komponenten

- UI-Komponenten: `docs/components/<name>/component.md` (Name englisch, optional `reference/`).
- Index + PrimeNG-Grundregel (nur PrimeNG, Wrapper für Fehlendes): [`docs/components/overview.md`](docs/components/overview.md).
- Epic-spezifische Ausprägungen (z. B. Tabellenspalten) stehen im Epic-Dokument.

## Quellcode-Ablage

- Code: `docs/requirements/<app>/` → `src/<app>/` (`frontend/`, `backend/`), gleiche Namen.

## Knowledge Graph (graphify)

- Skill `graphify`, Ausgabe `graphify-out/` relativ zum Working Directory (gitignored).
- App-scharfer Graph: aus `src/advance-registration/` bzw. `src/bazaar-app/` starten.

## Architektur

App-Entscheidungen (Architektur, Tech-Stack, Sprachregel, Entwicklungsrichtlinie) stehen in der App-Spec unter `docs/requirements/<app>/`; bei Widerspruch gewinnt die Spec.

| App | Verbindlicher Abschnitt |
|-----|------------------------|
| Voranmelde-App | [`advance-registration/spec.md`](docs/requirements/advance-registration/spec.md) §10.0.1 Architektur · §10.0.2 Durchstich · §10.0.4 UI-Bibliothek |
| Haupt-App | [`bazaar-app/spec.md`](docs/requirements/bazaar-app/spec.md) §7.0.1 Architektur · §7.0.2 Durchstich · §7.0.3 UI-Bibliothek |

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

- Epic = Verzeichnis `docs/requirements/<app>/epics/<Epic-Name>/` (`epic.md`, `stories/`).
- Fachliches Epic = vollständiger Durchstich FE+BE (Ausnahme: `Epic_Projektanlage`, `Epic_App_Shell`); Details: Spec §10.0.2 / §7.0.2.

## dv-forge

- Worktree: ja
