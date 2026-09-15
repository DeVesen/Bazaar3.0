---
id: VSHELL-S06
status: draft
depends-on: [VSHELL-S02, VSHELL-S03]
---

# Story: Page-Layout & Page-Titel-Leiste

## Ziel

Jede Seite außer dem Dashboard (`/home`) zeigt eine Page-Titel-Leiste oberhalb ihres Inhalts. Der Titel kommt zentral aus der Routen-Konfiguration, nicht aus der einzelnen Seiten-Komponente.

## Kontext

Die Shell (Main-Layout, VSHELL-S02) liefert Sidebar/Hamburger-Menü und den `<router-outlet>` für den Seiteninhalt — aber keinen Seitentitel. Bislang zeigt keine Seite an, wo der Nutzer sich befindet. Ein zusätzliches, dem Main-Layout untergeordnetes Page-Layout schließt diese Lücke: es wird zwischen Shell und der eigentlichen Feature-Route gehängt und rendert Titel-Leiste + verschachtelten `<router-outlet>`.

**Ausnahme Dashboard:** `/home` hängt direkt unter der Shell (kein Page-Layout, kein Titel) — das Dashboard ist Startpunkt, kein "Unterseiten"-Kontext.

## Scope

**In Scope:** `PageLayout`-Komponente (`core/shell/page-layout/`) mit Titel-Leiste + `<router-outlet>`; Routing-Umbau in `app.routes.ts` — jede Feature-Route außer `home` und `**` bekommt `component: PageLayout` mit `data: { title }` als Zwischen-Ebene, Feature-eigene `<feature>.routes.ts` bleiben als `children` unverändert eingehängt.

**Out of Scope:** Seiteninhalte selbst, Titel-Leisten-Actions (z. B. Buttons rechts im Titel — nicht Teil dieser Story).

## UI-Spezifikation

```
Main-Layout (≥ Tablet)              Main-Layout (< Tablet)
┌────────┬──────────────────┐       ┌───────────────────────┐
│Sidebar │  Content          │       │ Header [☰]            │
│        │  = Page-Layout    │       ├───────────────────────┤
│        │  oder Dashboard   │       │ Content = Page-Layout  │
│        │                   │       │ oder Dashboard         │
└────────┴──────────────────┘       └───────────────────────┘

Page-Layout (jeder Breakpoint):
┌────────────────────────────┐
│ PAGE TITEL                  │  ← 56px, --color-surface, IMMER sichtbar
├────────────────────────────┤
│ <router-outlet>              │  ← eigentliche Seite (z. B. Meine Artikel)
└────────────────────────────┘
```

Die Page-Titel-Leiste ist ein **eigenes** Element, unabhängig von der Hamburger-Titelleiste aus VSHELL-S02 (die nur Tablet/Mobile zeigt und nur den Menü-Trigger enthält). Die Page-Titel-Leiste ist auf **allen** Breakpoints sichtbar, auch Desktop — siehe korrigierte Tabelle in `spec.md` §10.1.

Titel-Text kommt aus `route.data['title']`, gesetzt auf der `PageLayout`-Route in `app.routes.ts` (nicht in der Feature-Routen-Datei, nicht in der Seiten-Komponente).

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL für jede Route außer `/home` und der Wildcard-Route `component: PageLayout` mit `data.title` als Zwischen-Ebene zwischen Shell und der lazy-geladenen Feature-Route einhängen.
- [ ] **AC-2** — THE SYSTEM SHALL den Titel aus `ActivatedRoute`-Snapshot-`data['title']` lesen und in der Titel-Leiste anzeigen.
- [ ] **AC-3** — WHILE eine Page-Layout-Route aktiv ist, SHALL die Titel-Leiste auf **jedem** Breakpoint (Desktop/Tablet/Mobile) sichtbar sein.
- [ ] **AC-4** — THE SYSTEM SHALL `/home` **ohne** Page-Layout direkt unter der Shell rendern (kein Titel).
- [ ] **AC-5** — THE SYSTEM SHALL die Titel-Leiste mit Hintergrund `--color-surface` und Höhe 56 px rendern.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VSHELL-S02 | Shell (Main-Layout) mit `<router-outlet>` und Content-Padding muss existieren |
| VSHELL-S03 | Routing-Skeleton mit Lazy-Feature-Routen muss existieren, bevor die Page-Layout-Zwischenebene eingehängt werden kann |

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #layout #page-layout #page-title #routing #responsive
