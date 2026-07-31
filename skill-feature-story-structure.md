# Skill: Feature & Story Structure

Dieses Skill definiert, wie Features und ihre Stories in der Dokumentation aufgebaut sind.
Es ist project-agnostisch: Es macht keine Annahmen über den genauen Ablageort der Features.

---

## Kernkonzept

### Feature

Ein Feature ist ein eigenständiger Funktionsbereich der Anwendung. Es lebt in einem
**eigenen Verzeichnis** mit dieser festen internen Struktur:

```
<feature-verzeichnis>/
├── feature.md
└── stories/
    ├── <FEAT-CODE>-S<nn>-<slug>.md
    └── ...
```

Der Pfad zu `<feature-verzeichnis>` ist project-spezifisch und wird außerhalb dieses
Skills definiert.

---

### feature.md

Beschreibt das Feature auf hohem Niveau — nicht mehr.

Enthält:
- Zweck und Ziel des Features
- Beteiligte Rollen / Stakeholder
- Welche Seiten, Views oder Bereiche dazugehören
- Einen Link-Index auf die zugehörigen Stories

**feature.md enthält keine UI-Specs, keine Implementierungsdetails, keine Feldlisten.**
Diese gehören ausschließlich in Stories.

---

### Story

Eine Story ist eine **atomare, in sich abgeschlossene Implementierungseinheit**.
Ein Entwickler liest sie und weiß danach genau, was zu bauen ist — ohne weitere
Dokumente zu benötigen (außer den ggf. abhängigen Stories).

#### Dateiname

```
<FEAT-CODE>-S<nn>-<slug>.md
```

- `<FEAT-CODE>` — Kurzcode des Features (z. B. `VERK`, `LOGIN`, `ARTIKEL`)
- `S<nn>` — nullgepaddte Sequenznummer: S01, S02, …
- `<slug>` — sprechender Name in Kebab-Case

Story-IDs sind **stabil** — einmal vergeben, werden sie nicht geändert.

#### Dateistruktur

```markdown
---
id: <FEAT-CODE>-S<nn>
status: draft | ready | in-progress | done
depends-on: []
---

# Story: <Titel>

## Ziel
Ein Satz: Was liefert diese Story dem Nutzer oder dem System?

## Kontext
Kurz: Warum existiert diese Story? Was ist der Auslöser / Bedarf?

## Scope
**In Scope:** Was wird in dieser Story implementiert.
**Out of Scope:** Was explizit ausgeschlossen ist.

## UI-Spezifikation
*(Nur wenn die Story UI enthält)*
Layout, Feldanordnung, verwendete Komponenten, Interaktionsverhalten —
präzise genug, um ohne Rückfragen implementieren zu können.

## Akzeptanzkriterien
- [ ] Kriterium 1
- [ ] Kriterium 2
- [ ] …

## Abhängigkeiten
| Story-ID | Grund |
|---|---|
| FEAT-S01 | Muss abgeschlossen sein bevor diese Story starten kann |
```

---

## Regeln

1. **Selbstständig** — Eine Story braucht keine andere Story als Lesekontext
   (außer explizit in `depends-on` genannten Abhängigkeiten).

2. **UI-Specs in der Story** — Nicht im übergeordneten feature.md, nicht in separaten
   Spec-Dokumenten. Die Story, die ein UI-Element implementiert, enthält dessen Spec.

3. **Abhängigkeiten explizit** — `depends-on` listet alle Story-IDs, die den Status
   `done` haben müssen, bevor diese Story gestartet werden kann.

4. **feature.md bleibt schlank** — Kein Detail, nur Überblick und Story-Verweise.

5. **Keine Wiederholung** — Wenn eine UI-Regel mehrere Stories betrifft, wird sie in
   einer gemeinsamen Quelle referenziert, nicht in jede Story kopiert.

6. **Stories entstehen inkrementell** — Ein Feature kann zu Beginn eine Story haben
   und später weitere dazubekommen. Die Nummerierung bleibt dabei stabil.
