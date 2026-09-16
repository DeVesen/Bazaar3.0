---
status: reviewed
reviewed-date: 2026-09-14
---

# Component: master-data-filter-toolbar

**Hinweis zur Abgrenzung:** Verwandt mit dem [Filter-Panel](../filter-panel/component.md), aber
bewusst eine eigene, einfachere Komponente statt einer weiteren Filter-Panel-Variante — Master-Data-Listen
(Verkäufer-Typen, Marken, Kategorien) sind klein, clientseitig geladen (`[lazy]="false"`) und filtern
**live** beim Tippen, ohne „Suchen"-Button. Das Filter-Panel dagegen ist für serverseitig gefilterte,
paginierte Listen gebaut und löst **explizit** aus (Enter/„Suchen"-Klick). Beide Komponenten teilen sich
den Breakpoint und das Dropdown-Kollaps-Muster < Tablet, nicht aber die Auslöse-Logik.

**Verwendung:** Voranmelde-App, Master-Data-Listen mit Anlege-Funktion.

| Verwendung | Felder | Epic |
|---|---|---|
| [Epic_Verkaeufer_Typen](../../requirements/advance-registration/epics/Epic_Verkaeufer_Typen/epic.md) | Freitext (Name) | Verkäufer-Typen |
| [Epic_Kategorien](../../requirements/advance-registration/epics/Epic_Kategorien/epic.md) | Freitext (Name) + Original/Neu-Filter | Kategorien |
| [Epic_Marken](../../requirements/advance-registration/epics/Epic_Marken/epic.md) | Freitext (Name) + Original/Neu-Filter | Marken |

## Kontext

```
≥ Tablet (≥ 768 px):
┌───────────────────────────────────────────────────┐
│ [🔍 Suche...]                             [+ Neu] │
├───────────────────────────────────────────────────┤
│ Bezeichnung │ Provision │ Gebühr │ Verkäufer │✎│🗑│

< Tablet (< 768 px):
┌─────────────────────────────┐
│ [Filter ▾]          [+ Neu] │
├─────────────────────────────┤
│ Bezeichnung │ Provision │✎│🗑│
```

## Aufbau

| Element | PrimeNG | Wann |
|---|---|---|
| Original/Neu-Filter | [Select](../select/component.md), Variante Dropdown — Optionen „✓ Original“ / „Neu" | nur wenn `showOriginalFilter` gesetzt (Kategorien, Marken) |
| Freitext-Feld | [Input](../input/component.md), Variante Icon (Such-Icon) | immer |
| Filter-Dropdown (< Tablet) | [Select](../select/component.md)-artiges Overlay-Panel, Trigger-Label „Filter" — ersetzt Freitext-Feld (und ggf. Original/Neu-Filter), öffnet ein Dropdown-Panel mit denselben Feldern | immer |
| Neu-Button | [Button](../button/component.md), Text „+ Neu" (gleiche Optik wie [Table](../table/component.md) `canAdd`), ganz rechts, außerhalb des Dropdowns | nur wenn `canAdd` gesetzt |

## Verhalten

- **Live-Filter**: Freitext-Eingabe emittiert `filterChange` 300 ms nach Tippstopp (Debounce), Auswahl im Original/Neu-Filter emittiert sofort — kein „Suchen"-Button, kein Enter nötig.
- Das Parent filtert die bereits geladene Liste clientseitig (Dumb Component: keine eigene Datenbeschaffung, keine Server-Anfrage).
- „+ Neu"-Button steht immer neben den Filterfeldern bzw. neben dem „Filter"-Button — unabhängig vom Breakpoint sichtbar, öffnet über `create` das Anlege-Popup der jeweiligen Liste.

## Responsive

Breakpoint identisch zu [Table](../table/component.md) Abschnitt 10 und [Filter-Panel](../filter-panel/component.md).

| Viewport | Verhalten |
|---|---|
| ≥ Tablet (≥ 768 px) | Freitext-Feld (und ggf. Original/Neu-Filter) nebeneinander sichtbar, „+ Neu"-Button ganz rechts |
| < Tablet (< 768 px) | Filterfelder kollabiert zu einem „Filter"-Dropdown (links) — Klick öffnet ein Overlay-Panel mit denselben Feldern. „+ Neu"-Button bleibt daneben sichtbar, außerhalb des Dropdowns |

Das Live-Filter-Verhalten selbst ändert sich im Overlay nicht — nur die Darstellung wird kollabiert.

## Akzeptanzkriterien

1. **AC-1** — WHEN der Nutzer im Freitext-Feld tippt, THEN SHALL das System die Liste 300 ms nach der letzten Eingabe nach dem eingegebenen Text filtern (Name, case-insensitive, Teilstring).
2. **AC-2** — WHILE kein Filter gesetzt ist, SHALL das System alle geladenen Einträge anzeigen.
3. **AC-3** — WHILE der Viewport < 768 px breit ist, SHALL das System die Filterfelder zu einem „Filter"-Dropdown kollabieren; ein Klick öffnet ein Overlay-Panel mit denselben Feldern. Der „+ Neu"-Button bleibt außerhalb des Dropdowns sichtbar.
4. **AC-4** — WHEN der Nutzer auf „+ Neu" klickt, THEN SHALL das System das Anlege-Popup der jeweiligen Liste öffnen — unabhängig vom Breakpoint.

## Tags & Piles

**Tags:** #master-data-filter-toolbar #filter #search #shared-across-epics
