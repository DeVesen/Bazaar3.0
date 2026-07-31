---
id: C-012
status: draft
updated: 2026-07-31
---

# Component: Card

**Bibliothek:** `p-card` (PrimeNG) als Basis
**Verwendung:** Beide Apps — überall dort, wo Inhalte in abgegrenzten Blöcken dargestellt werden.

## Index

- Überblick — Konzept
- 1. Standard-Card — Design
- 2. Filter-Panel — Design
- 3. Panel-Blöcke (Formulare) — Design & Theming
- 4. Form-Grid — Layout
- 5. Verwendung in Features — Einsatzorte
- 6. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Abgrenzender Container für Seiteninhalte, Filter-Bereiche und Formular-Blöcke.

---

## Überblick

Die Card ist der zentrale Inhalts-Container beider Apps. Sie tritt in drei Varianten auf:

1. **Standard-Card** — allgemeiner Inhalts-Container
2. **Filter-Panel** — Card mit Such- und Filter-Zeile
3. **Panel-Block** — hervorgehobener Abschnitt innerhalb eines Dialogs oder Formulars

Die Basis ist `p-card` (PrimeNG). Farben der Panel-Blöcke sind app-spezifisch und werden als Theming-Varianten geführt.

---

## 1. Standard-Card

| Eigenschaft | Wert |
|---|---|
| Hintergrund | `#ffffff` |
| Border | 1 px `--border` |
| Border-radius | 8 px |
| Padding | 18 px 16 px |
| Margin-bottom | 14 px |
| Titel | 700, 14 px, `#0f1f30`, mb 12 px |

---

## 2. Filter-Panel

Basis: Standard-Card mit abweichendem Padding.

| Eigenschaft | Wert |
|---|---|
| Padding | 13 px 15 px |

**Layout:**

- **Zeile 1:** Suchfeld (`flex: 1`) + Dropdowns (180 px / 200 px)
- **Zeile 2:** 4-Spalten-Grid je 25 %, gap 10 px *(nur Artikel-Seite)*

---

## 3. Panel-Blöcke (Formulare)

Panel-Blöcke gliedern Formulare in benannte Abschnitte. Alle Werte bis auf die Farben sind app-übergreifend gleich.

### Gemeinsame Eigenschaften

| Eigenschaft | Wert |
|---|---|
| Border-radius | 8 px |
| Padding | 15 px 16 px |
| Margin-bottom | 12 px |
| Titel | 11 px, 700, uppercase |

### Theming-Varianten

| Eigenschaft | Bazaar Haupt-App | Voranmelde-App |
|---|---|---|
| Hintergrund | `#f8fafc` | `#f5f9f6` |
| Border | 1 px `#dde6ee` | 1 px `#d4e8dc` |
| Titel-Farbe | `#4a6080` | `#3a7057` |
| Titel letter-spacing | 0.8 px | — |
| Titel margin-bottom | 12 px | — |

---

## 4. Form-Grid

Innerhalb von Panel-Blöcken und Dialogen.

| Eigenschaft | Wert |
|---|---|
| Spalten | 2 |
| Gap | 12 px |
| `.full` | volle Breite (beide Spalten) |

**Label-Stil:**

| Eigenschaft | Wert |
|---|---|
| Schriftgröße | 11.5 px |
| Font-weight | 700 |
| Text-transform | uppercase |
| Letter-spacing | 0.4 px |
| Farbe | `--muted` |
| Pflichtmarker `*` | Danger-Farbe |

---

## 5. Verwendung in Features

| Variante | App | Einsatz |
|---|---|---|
| Standard-Card | Beide | Seiteninhalte, Listen, Tabellen-Wrapper |
| Filter-Panel | Bazaar | Artikel-Seite (Suche + Dropdowns + 4-Spalten-Grid) |
| Panel-Block | Beide | Formular-Abschnitte in Dialogen und Edit-Seiten |
| Form-Grid | Beide | Layout innerhalb von Panel-Blöcken |

---

## 6. PrimeNG-Basis

```
p-card    ← Basis für Standard-Card und Filter-Panel
```

Panel-Blöcke und Form-Grid: reines CSS — kein PrimeNG-Element.

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL die Standard-Card mit Hintergrund `#ffffff`, Border 1 px `--border`, Radius 8 px, Padding 18 px 16 px und Margin-bottom 14 px rendern.
2. **AC-2** — THE SYSTEM SHALL den Card-Titel in 700, 14 px, `#0f1f30` mit Margin-bottom 12 px darstellen.
3. **AC-3** — THE SYSTEM SHALL das Filter-Panel als Standard-Card mit Padding 13 px 15 px rendern, wobei Zeile 1 Suchfeld (`flex: 1`) und Dropdowns (180 px / 200 px) enthält.
4. **AC-4** — WHERE die Artikel-Seite das Filter-Panel anzeigt, SHALL Zeile 2 ein 4-Spalten-Grid (je 25 %, gap 10 px) enthalten.
5. **AC-5** — THE SYSTEM SHALL Panel-Blöcke mit Radius 8 px, Padding 15 px 16 px und Margin-bottom 12 px rendern; Hintergrund, Border und Titel-Farbe folgen der jeweiligen App-Theming-Variante.
6. **AC-6** — THE SYSTEM SHALL das Form-Grid als 2-Spalten-Layout mit Gap 12 px rendern; Elemente mit Klasse `.full` nehmen die volle Breite ein.
7. **AC-7** — THE SYSTEM SHALL Form-Labels in 11.5 px, 700, uppercase, 0.4 px letter-spacing und `--muted` darstellen; Pflichtmarker `*` erscheinen in Danger-Farbe.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #card #filter-panel #panel-block #form-grid #layout
