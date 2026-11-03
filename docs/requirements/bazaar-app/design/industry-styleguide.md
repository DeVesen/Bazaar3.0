---
status: draft
updated: 2026-08-18
---

# Industry — Styleguide & Theme

Quelle: gebundenes Design System „Industry" (`_ds/industry-.../`). Wireframe-Ästhetik: helle
Stahlblau-Palette, Barlow Condensed für Headings, modulares Grid, Karten/Buttons/Panels als
„Blueprint"-Objekte mit eckigen Ecken und Registrierkreuzen.

Dieses Dokument ist die **1:1-Übernahme des gelieferten Styleguides**. Es beschreibt das
Design System in seiner Original-Notation (CSS-Klassen, Lucide-Icons). Wo das der
PrimeNG-Grundregel der App widerspricht, ist das in Abschnitt 8 als offener Punkt notiert —
nicht stillschweigend übersetzt.

## Index
- 1. Theme-Parameter — theme.json
- 2. Farb-Tokens — CSS-Variablen, tonale Ramps
- 3. Typografie — Barlow / Barlow Condensed
- 4. Spacing, Radius, Shadow — Skalen
- 5. Das „Blueprint"-Frame — Eckkreuze
- 6. Komponenten — visuelle Spezifikation
- 7. Projekt-spezifische Überschreibung — App-Bezug
- 8. Offene Punkte gegenüber der PrimeNG-Grundregel — Konflikte
- Tags & Piles — Ablage

---

## 1. Theme-Parameter (theme.json)

```json
{
  "name": "Industry",
  "palette": { "hue": 210, "band": "light", "scheme": "mono", "sat": 0.3,
    "bg": "#f7f7f8", "surface": "#dfe3e8", "text": "#1d1f20",
    "accent": "#416180", "accent2": "#486077" },
  "fonts": {
    "heading": { "family": "Barlow Condensed", "weights": [400,600] },
    "body":    { "family": "Barlow", "weights": [400,500,700] }
  },
  "density": 0.85,
  "radius": 4,
  "layoutStyle": "grid",
  "frame": "blueprint",
  "imageTreatment": "duotone",
  "iconSet": "lucide-thin"
}
```

---

## 2. Farb-Tokens (CSS-Variablen)

| Rolle | Wert |
|---|---|
| `--color-bg` | `#f7f7f8` (Grundfläche der App) |
| `--color-surface` | `#dfe3e8` (Alternative Fläche, Sidebar) |
| `--color-text` | `#1d1f20` |
| `--color-text-muted` | `#5d5d60` (= Neutral 700, gedämpfter Text) |
| `--color-accent` | `#416180` (Basis-Akzent, Steel Blue = Accent 700) |
| `--color-accent-2` | `#486077` (mono — verhält sich wie accent, = Accent-2 700) |
| `--color-divider` | `color-mix(in srgb, #1d1f20 24%, transparent)` |

**Tonale Ramps** (100 = hell/Tint, 500 = Basis, 900 = dunkel/Text-auf-Tint), in OKLCH
generiert, gleiche Helligkeitsstufe = gleicher visueller Wert über alle Ramps hinweg:

- Neutral: 100 `#f5f5f8` · 200 `#e7e7ea` · 300 `#d4d4d7` · 400 `#b7b7ba` · 500 `#98989b` · 600 `#7a7a7d` · 700 `#5d5d60` · 800 `#424244` · 900 `#2b2b2d`
- Accent: 100 `#eef6ff` · 200 `#d6ebff` · 300 `#b5d9fd` · 400 `#94bce3` · 500 `#749dc4` · 600 `#597ea3` · 700 `#416180` · 800 `#2c455d` · 900 `#1d2d3d`
- Accent-2: 100 `#eef6ff` · 200 `#d6ebff` · 300 `#bdd8f2` · 400 `#9ebbd8` · 500 `#7e9cb8` · 600 `#627d98` · 700 `#486077` · 800 `#314457` · 900 `#1f2d3a`

Nutzung: helle Stufen (100–300) für Tint-Flächen/Hover/Border, dunkle Stufen (700–900) für
Text, gefüllte Flächen mit weißem Text und Pressed-States. 500 ist nur noch Referenzwert der Ramp.

**Kontrast-Regel (seit 2026-11-03, siehe Abschnitt 7):** Text ≥ 4,5:1, Rahmen/Icons ≥ 3:1 (WCAG AA).
Daraus folgt für die Ramps: Text höchstens Neutral 700, Primär-Füllung Accent 700 (Weiß darauf
6,5:1), Neutral 500/600 nur für Rahmen, Placeholder und deaktivierte Elemente.

---

## 3. Typografie

- Headings: **Barlow Condensed**, Gewicht 600 (`--font-heading`)
- Fließtext: **Barlow**, Gewichte 400/500/700 (`--font-body`)
- Google Fonts Import: `Barlow:wght@400;500;700` + `Barlow+Condensed:wght@400;600`

---

## 4. Spacing, Radius, Shadow

- Spacing-Skala (Dichte-Faktor 0.85): `--space-1` 3.4px · `--space-2` 6.8px · `--space-3` 10.2px · `--space-4` 13.6px · `--space-6` 20.4px · `--space-8` 27.2px
- Radius: `--radius-sm` 2px · `--radius-md` 4px · `--radius-lg` 7px — **wird bei Blueprint-Objekten auf 0 überschrieben** (eckige Ecken)
- Shadows (Elevation): `--shadow-sm` `0 1px 2px` · `--shadow-md` `0 3px 10px` · `--shadow-lg` `0 12px 32px`, jeweils mit ink-getöntem Halbtransparenz-Schwarz

---

## 5. Das „Blueprint"-Frame (Karten, Panels, primäre Buttons, Figuren)

Kernstück des Systems — das Motiv „Demo: Admin" mit den vier Eck-Kreuzen.

- Container erhält Klasse `.blueprint`: `border: 1px solid var(--color-divider)`, `border-radius: 0`, `position: relative`
- Vier Kind-Elemente `<i class="corner tl">`, `tr`, `bl`, `br` — je 11×11px, positioniert an den vier Ecken; jedes zeichnet ein kleines **Plus-/Fadenkreuz** (zwei sich kreuzende 1px-Linien, Farbe `color-mix(var(--color-text) 55%, transparent)`) leicht über den Rand hinausragend — das Registrierkreuz-Motiv
- Gilt für: `.card.blueprint`, `.dialog.blueprint`, `.btn-primary.blueprint` (und jede weitere Fläche, die als „technische Zeichnung" wirken soll)
- Cards/Panels/Dialoge sind **transparent** (Linienzeichnung, keine Füllung) — Ausnahme: der primäre Button ist die einzige vollflächig gefüllte Fläche im System

---

## 6. Komponenten — visuelle Spezifikation

**Button**
- `.btn` Basis: `border-radius: 0` (eckig), Border 1px, Barlow 500/600
- `.btn-primary`: volle Akzentfüllung (`--color-accent`), heller Text, **einziges** solides Objekt im UI, trägt `.blueprint` + Eckkreuze
- `.btn-secondary`: transparent, 1px Border in `--color-divider`, Text in `--color-text`, trägt ebenfalls `.blueprint` + Eckkreuze wenn es wie eine „Karte" wirken soll
- `.btn-ghost`: kein Border, transparenter Hintergrund, nur Text/Icon
- `.btn-icon`: quadratisch, nur Icon, gleiche Border-Logik wie secondary
- `.btn-block`: volle Breite
- Hover/Pressed: Tönung aus der Accent-Ramp (einen Schritt dunkler als Basis); Fokus: `outline: 2px solid var(--color-accent); outline-offset: 2px`
- Disabled: 45% Opacity

**Input / Feld**
- `.field` = Wrapper aus `label` + `.input`
- `.input`: `border-radius: 0`, 1px Border `--color-divider`, Hintergrund transparent/`--color-bg`, Fokusring wie Button
- `label`: Barlow, kleine Caps-artige Kennzeichnung, gedämpfte Textfarbe

**Card / Panel**
- `.card` + `.blueprint` + vier Eckkreuze
- Transparenter Hintergrund (Linienzeichnung), 1px Border
- `.card-kicker` (kleine Überschrift, gedämpft), `.card-title` (Barlow Condensed), `.card-body`, `.card-meta`
- Elevation optional über `.elev-sm/md/lg` (Schatten-Tokens), meist aber bewusst flach/linear gehalten

**Dialog / Modal**
- `.dialog-backdrop` (Scrim) + `.dialog` (+ `.blueprint` + Eckkreuze), `.dialog-title/-body/-actions`
- **Bekannter Fehler in der Original-`styles.css`:** `.card, .dialog { background: transparent }` ist nicht auf `.blueprint` gescoped — dadurch ist jeder Dialog immer transparent, auch über dem Scrim. Sollte auf `.card.blueprint, .dialog.blueprint` eingeschränkt werden; Dialoge ohne Blueprint-Absicht brauchen eine solide Fläche (`--color-surface` bzw. `#f2f2f3`, siehe Abschnitt 7).

**Tag**
- `.tag` mit Varianten `.tag-accent`, `.tag-accent-2`, `.tag-neutral`, `.tag-outline` — kleine, farblich getönte Labels aus den Ramps (100/200 als Fläche, 700/800 als Text)

**Tabelle**
- `.table`: themed Header (gedämpfter Hintergrund/Border), Zeilen durch `--color-divider`-Linien getrennt, kein Zebra-Streifen

**Navigation**
- `.nav` + `.nav-brand`: Kopfleiste, Barlow Condensed Marke, flache Linienoptik

**Icons**
- Lucide-Icons, Stroke-Width 1.5 (dünn, technisch)

**Bilder**
- `.duotone`-Wrapper: Fotos werden entsättigt und in den Akzentton getaucht (Duotone-Screenprint-Optik)

---

## 7. Projekt-spezifische Überschreibung (Haupt-App)

- Farbschema, Button- und Inputstile wie oben beibehalten (User-Präferenz)
- Modal-/Formular-Hintergrund: **`#f2f2f3`** statt transparent — überschreibt lokal die in
  Abschnitt 6 beschriebene `.dialog`-Transparenz (Fix aus dem Prototyp `Bazaar POC.dc.html`)
- **Fonts lokal, kein CDN:** Barlow und Barlow Condensed werden als npm-Pakete gebundelt
  (`@fontsource/barlow`, `@fontsource/barlow-condensed`) — der Google-Fonts-Import aus
  Abschnitt 3 wird **nicht** verwendet. Gewichte wie dort: Barlow 400/500/700,
  Barlow Condensed 400/600.

**Ableitung der Branding-Werte** (ersetzt das frühere Navy/Blau-Schema, verbindlich in
[`spec.md` §10.1](../spec.md)):

| Element | Industry-Token | Wert |
|---|---|---|
| Sidebar-Hintergrund | `--color-surface` | `#dfe3e8`, 1px `--color-divider` als rechte Kante |
| Titelleiste | = Sidebar-Farbe | `#dfe3e8` |
| Akzentfarbe | Accent 700 | `#416180` |
| Content-Hintergrund | `--color-bg` | `#f7f7f8` |
| Titel-Farbe | `--color-text` | `#1d1f20` |
| Sidebar-Logo | Barlow Condensed 600 | „Bazaar **Suite**" — zweites Wort in `--color-accent` |

Abweichung zur Vorgängerfassung: Die Sidebar ist **nicht mehr dunkel** — entschieden am
2026-08-18. Industry kennt keine dunkle Fläche; die Kopf-/Seitenleiste ist flache Linienoptik
auf `--color-surface`. Accent 800 (`#2c455d`) wäre der Ersatzwert für eine dunkle Variante,
wird aber nicht verwendet.

**Kontrast angehoben — entschieden am 2026-11-03.** Grund: Test der Haupt-App auf älteren
Laptops (Lenovo E325, Acer Aspire V5, 1366×768, TN-Panel) — Gruppenlabels, gedämpfter Text und
Primär-Buttons waren schwer lesbar. Gemessen vorher: Weiß auf Primär 500 2,85:1, gedämpfter Text
(Neutral 500) 2,88:1, Gruppenlabels auf der Sidebar 2,37:1, Sidebar gegen Hintergrund 1,08:1.
Änderungen (Farbton bleibt Steel Blue, Sidebar bleibt hell):

| Element | vorher | jetzt | Kontrast jetzt |
|---|---|---|---|
| Primär-Füllung (Buttons) | Accent 500 `#749dc4` | Accent 700 `#416180`, Hover 800 | 6,5:1 (Weiß) |
| Text / gedämpfter Text (PrimeNG) | Neutral 700 / 500 | Neutral 900 / 700 | 14:1 / 6,6:1 |
| Feldrahmen, Placeholder | Neutral 300 / 500 | Neutral 600 | 4,3:1 |
| Sekundär-Buttons (Text) | Neutral 500/600 | Neutral 800 | ≥ 7:1 |
| Sidebar-Fläche / App-Hintergrund | `#e9e9ea` / `#f2f2f3` | `#dfe3e8` / `#f7f7f8` | 1,2:1 |
| Sidebar-Menüeintrag | 13,5 px, Neutral 700 | 14 px/500, Neutral 800 | 7,8:1 |
| Sidebar-Gruppenlabel | 10 px, Neutral 500 | 12 px, Neutral 700 | 5,1:1 |
| Aktiver Menüeintrag | Surface 100 | `#c9d6e3`, Text Accent 800 | 6,7:1 |
| Fokusring | 1 px | 2 px | — |

Zusätzlich ist die Sidebar auf Fensterhöhe fixiert: Nur die Menüliste scrollt, Logo und
Benutzer-Footer bleiben sichtbar. Unter 800 px Fensterhöhe wird sie kompakter.

---

## 8. Offene Punkte gegenüber der PrimeNG-Grundregel

Dieser Styleguide ist 1:1 übernommen und noch **nicht** auf den Tech-Stack der App
übersetzt. Widersprüche zu [`spec.md` §7.0.3](../spec.md) (Grundregel: ausschließlich
PrimeNG, kein natives HTML, keine weiteren UI-Libraries):

| # | Konflikt | Styleguide sagt | App-Spec sagt | Status |
|---|---|---|---|---|
| 1 | Icon-Set | Lucide, Stroke 1.5 | `@primeicons/angular`, Einzelimport | offen |
| 2 | Komponenten-CSS | Eigene Klassen `.btn`, `.input`, `.card`, `.dialog`, `.table`, `.tag` auf nativem HTML | PrimeNG-Komponenten, kein natives HTML für interaktive Elemente | offen |
| 3 | Theming-Mechanismus | Freie CSS-Variablen (`--color-*`, `--space-*`) | PrimeNG-Theme mit eigenen Design-Tokens | offen |
| 4 | Blueprint-Eckkreuze | Vier `<i class="corner">`-Kindelemente im Container | kein Mechanismus vorgesehen | offen |
| 5 | Dunkle Sidebar | nicht vorgesehen | bisher dunkles Navy | ✅ Entschieden — Sidebar hell auf `--color-surface`, siehe Abschnitt 7 |

Bis zur Entscheidung gilt: Farb-, Typo-, Spacing- und Radius-Werte (Abschnitte 1–4) sind
verbindlich, die Klassen- und Icon-Notation (Abschnitte 5–6) ist Referenz für das Aussehen,
nicht für die Implementierung.

---

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #design #styleguide #theme #industry #haupt-app
