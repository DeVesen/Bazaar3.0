---
round: Round-8
status: geklärt
---

# Spec: Round 8 — PrimeNG-Theme & globale Styles

## Fein-Spezifikation

### Ziel

Visuelles Grunderscheinungsbild der App: PrimeNG-22-Theme-Preset mit der Akzentfarbe des
Design Systems „Industry", globale CSS Custom Properties für Farben, Typografie
(Barlow/Barlow Condensed), Modal-Grundverhalten nach Breakpoint-Tabelle. Keine
fachlichen Komponenten-Styles, keine Blueprint-Eckkreuze/eigene CSS-Klassen (offener
Punkt, s. u.).

### Vorab-Klärung des in round.md geforderten Blockers (spec.md §11.11)

round.md verlangt ausdrücklich: „falls zum Zeitpunkt der Umsetzung noch offen, wird
dieses Häppchen um eine Klärung ergänzt, bevor es beginnt." Der Punkt war beim Planen
tatsächlich noch offen (spec.md §11, Punkt 11: „⏳ Offen"). Mit dem Nutzer geklärt
(2026-09-17), in zwei Teilen:

**1. Farbschema/Token-Namen (betrifft auch Round-6 rückwirkend):**
[`design/industry-styleguide.md`](../../../requirements/bazaar-app/design/industry-styleguide.md)
§7 (Entscheidung vom 2026-08-18, App-spezifische Überschreibung) gilt — **helle**
Sidebar auf `--color-surface`, Token-Namen `--color-*` statt der in BSHELL-S01/BSHELL-S04
wörtlich beschriebenen dunklen Navy-Sidebar mit `--sidebar-bg`/`--accent`.
[Round-6/plan.md](../Round-6/plan.md) wurde entsprechend nachgezogen (Token-**Namen**
umbenannt, keine Werte — Round-6 definiert ohnehin keine Werte). BSHELL-S01/BSHELL-S04
sind an dieser Stelle veraltet (gehört zum selben Doku-Abgleich wie die Icon-/
Test-Runner-Abweichungen aus Round-1/plan.md — nicht Teil dieses Plans).

**2. PrimeNG-Grundregel-Konflikt (spec.md §11.11, Styleguide §8):** Round-8 übernimmt
**ausschließlich die Tokens** (Farben, Typografie, Spacing/Radius) aus dem
Industry-Styleguide — das deckt BSHELL-S04 vollständig ab (Theme-Setup, kein
Komponenten-Styling). Der eigentliche Mechanismus-Konflikt (eigene CSS-Klassen
`.btn`/`.card`/`.dialog` auf nativem HTML, Blueprint-Eckkreuze) bleibt laut round.md
„Nicht enthalten" ausdrücklich offen für ein späteres Round — er betrifft
Komponenten-Implementierung, nicht Theme-Setup, und liegt außerhalb Round 1–9.

### Übernommene Werte aus `industry-styleguide.md`

Ersetzt die BSHELL-S04-Tabelle vollständig (Industry-Werte statt Navy/Blau):

| CSS Custom Property | Wert | Quelle |
|---|---|---|
| `--color-bg` | `#f2f2f3` | Styleguide §2 |
| `--color-surface` | `#e9e9ea` | Styleguide §2 (Sidebar/Titelleiste, §7) |
| `--color-text` | `#1d1f20` | Styleguide §2 |
| `--color-accent` | `#5980a6` | Styleguide §2 (Steel Blue, Basis-Akzent) |
| `--color-accent-2` | `#728fab` | Styleguide §2 |
| `--color-divider` | `color-mix(in srgb, #1d1f20 16%, transparent)` | Styleguide §2 |

Sechs statt der in BSHELL-S04 AC-2 genannten sechs Properties (`--sidebar-bg`,
`--accent`, `--content-bg`, `--title-color`, `--border`, `--muted`) — **inhaltlich
gleiche Rolle, andere Namen und Werte**, s. Zuordnungstabelle in Schritt 2.

### Akzeptanzkriterien

Wie in [BSHELL-S04](../../../requirements/bazaar-app/epics/Epic_App_Shell/stories/BSHELL-S04-primeng-theme-setup.md)
AC-1 bis AC-5, mit AC-1 und AC-2 wertlich an den Industry-Styleguide angepasst (Akzent
`#5980a6` statt `#2e86c1`, sechs `--color-*`-Tokens statt `--sidebar-bg` & Co., s. o.).
AC-3, AC-4, AC-5 unverändert.

### Bewusst nicht in diesem Round

Fachliche Komponenten-Styles, Blueprint-Eckkreuze/eigene CSS-Klassen
(`.btn`/`.card`/`.dialog` auf nativem HTML — spec.md §11.11, weiterhin offen für ein
späteres Round außerhalb 1–9), Modal-Hintergrund-Fix aus Styleguide §7 („Bekannter
Fehler in der Original-`styles.css`" — betrifft Komponenten-Implementierung, nicht
Theme-Tokens).

