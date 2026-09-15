---
status: draft
reviewed-date: 2026-09-15
---

# Component: page-layout

**Hinweis zur Abgrenzung:** Kein Formular-/Anzeige-Baustein wie die übrigen `docs/components/`-Einträge,
sondern die Shell-Chrome-Komponente, die den Seitentitel zentral über der jeweiligen Feature-Seite
rendert. Ersetzt die früher pro Seite gepflegte eigene `<h1>`-Zeile — die einzelnen Feature-Seiten
(Marken, Kategorien, Verkäufer-Typen, Meine Artikel, Verkäufer, …) setzen keinen eigenen Titel mehr.

**Verwendung:** Voranmelde-App, alle eingeloggten Routen unter der Shell (`app.routes.ts`) — jede Route
mit `component: PageLayout` und `data: { title: '<Seitentitel>' }` bekommt automatisch die Titel-Leiste.

## Kontext

```
┌──────────────────────────────────────────┐
│ Marken                                    │  ← page-title-bar, volle Breite
├──────────────────────────────────────────┤
│ [🔍 Suche...] [Original ▾]      [+ Neu]  │  ← Feature-eigene Toolbar (z. B. master-data-filter-toolbar)
├──────────────────────────────────────────┤
│ ... Tabelle ...                           │
└──────────────────────────────────────────┘
```

## Aufbau

| Element | Quelle |
|---|---|
| Titel-Leiste (`<h1 class="page-title">`) | `route.snapshot.data['title']` — statischer String, je Route in `app.routes.ts` gesetzt |
| Seiteninhalt | `<router-outlet />` — rendert die Feature-Route als Kind |

## Verhalten

- `PageLayout` liest den Titel einmalig aus `ActivatedRoute.snapshot.data['title']` (kein Reagieren auf spätere Datenänderungen der Route nötig, da pro Route fix).
- Ohne `title` in den Route-Daten bleibt die Titel-Leiste leer (kein Fallback-Text).
- Feature-Seiten selbst rendern **keinen** eigenen Titel mehr — deren Toolbar (Filter-Panel / Master-Data-Filter-Toolbar) beginnt direkt mit den Filterfeldern.

**Bekannte Lücke:** Der Titel ist ein statischer String in den Route-Daten, nicht über `TranslateService`
übersetzt — anders als der Rest der UI. Bei Sprachumschaltung bleibt der Seitentitel in der beim
Laden aktiven Sprache stehen.

## Responsive

Titel-Leiste volle Breite auf allen Viewports, zieht sich per negativem Margin bis an den Rand des
Content-Bereichs (gleiche Optik wie der Hamburger-Header darüber).

## Tags & Piles

**Tags:** #page-layout #shell #page-title #shared-across-epics
