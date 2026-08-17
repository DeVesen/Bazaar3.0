---
id: C-010
status: reviewed
reviewed-date: 2026-08-14
updated: 2026-08-17
---

# Component: markdown-text

> **Verschoben am 2026-08-17** aus `docs/components/markdown-text/` (Suite-Ebene) hierher.
> Grund: die Einordnungsregel in [`components/overview.md`](../overview.md) lässt die
> Suite-Ebene nur für Komponenten zu, die in **beiden** Apps identisch auftreten. Diese
> Komponente gibt es ausschließlich in der Voranmelde-App — die Haupt-App hat auf ihrer
> Login-Seite bewusst keine Info-Area
> ([`bazaar-app/epics/Epic_Login`](../../../bazaar-app/epics/Epic_Login/epic.md), Abschnitt
> „Layout") und kennt kein `infoText`. Sollte die Haupt-App später einen gepflegten Markdown-Text
> anzeigen, wandert die Datei zurück nach `docs/components/`.

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter
- 3. Aufbau — Rendering
- 3.1 Unterstützte Markdown-Elemente — verbindliche Liste
- 3.2 Nicht unterstützte Syntax — Fallback-Verhalten
- 3.3 Leerer Inhalt — `null`/Leerstring
- 4. Verwendung in Epics — Einsatzorte
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**Gruppe:** Custom (Index → [`components/overview.md`](../overview.md))
**Bibliothek:** Eigener Wrapper — kein PrimeNG-Element beteiligt (reines Text-Rendering)
**Verwendung:** Voranmelde-App — überall dort, wo admin-gepflegter Markdown-Text (`infoText`) angezeigt wird.

---

## Überblick

Rendert admin-gepflegten Markdown-Text (`infoText` aus Epic_Einstellungen). Wird an drei Stellen der Voranmelde-App identisch verwendet — daher einmal zentral dokumentiert statt je Epic dupliziert.

**Diese Datei ist die verbindliche Quelle für den unterstützten Markdown-Umfang** (Abschnitt 3.1–3.3). Epics und Formulare verlinken hierher und zählen die Elemente nicht erneut auf.

---

## 1. ASCII-Darstellung

```
┌─────────────────────────┐
│  📄 Öffnungszeiten:      │
│     Sa 08:00–14:00      │  ← markdown-text
│  **Wichtig:** ...        │
└─────────────────────────┘
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `content` | `string \| null` | `@Input` | Markdown-Rohtext (`infoText`) — darf `null` oder leer sein, siehe Abschnitt 3.3 |

Die Komponente prüft **keine Länge**. Die Grenze von 4000 Zeichen ist eine Regel der
Einstellungen und wird beim Speichern durchgesetzt ([`entities/einstellungen.md`](../../entities/einstellungen.md));
ein bereits gespeicherter Text wird hier immer vollständig gerendert.

Keine Outputs — reine Anzeige, keine Interaktion.

---

## 3. Aufbau

Eigener, kleiner Markdown-Renderer (z. B. via `ngx-markdown` oder minimalem eigenem Parser). Kein PrimeNG-Element beteiligt, reines Text-Rendering.

**Leaf-Komponente** (Rollen-Regel → [`components/overview.md`](../overview.md) Abschnitt „Komponenten-Rollen"): liest nur `content`, injiziert keinen Service, entscheidet nichts über die umgebende Box.

### 3.1 Unterstützte Markdown-Elemente

Verbindliche, abschließende Liste. Was hier nicht steht, fällt unter Abschnitt 3.2.

| Element | Syntax | Rendering |
|---|---|---|
| Absatz | Leerzeile zwischen Textblöcken | `<p>` |
| Zeilenumbruch | einfacher Umbruch innerhalb eines Absatzes | `<br>` — der Umbruch bleibt erhalten (Admin tippt in einem Textarea, ein Umbruch dort ist als Umbruch gemeint) |
| Überschrift | `#` bis `###` | `<h1>`–`<h3>` — tiefere Ebenen sind in einer Info-Box ohne Nutzen |
| Fettdruck | `**Text**` | `<strong>` |
| Kursiv | `*Text*` | `<em>` |
| Aufzählung | `-` / `*` | `<ul><li>` |
| Nummerierte Liste | `1.` | `<ol><li>` |
| Trennlinie | `---` | `<hr>` |
| Inline-Code | `` `Code` `` | `<code>` |
| Code-Block | Fence aus drei Backticks | `<pre><code>` |
| Link | `[Text](url)` | `<a>` mit `target="_blank"` und `rel="noopener noreferrer"` — nur `http`-, `https`- und `mailto`-Schemata; jedes andere Schema (insbesondere `javascript:`) wird als Klartext ausgegeben, nicht verlinkt |

> **Links waren bis 2026-08-17 nicht spezifiziert** und wurden hier ergänzt, weil der Info-Text typischerweise auf eine Vereins- oder Anfahrtsseite verweist. Wenn Links unerwünscht sind, gehören sie stattdessen in Abschnitt 3.2 — dann bleibt `[Text](url)` als Klartext stehen.

### 3.2 Nicht unterstützte Syntax

Alles, was nicht in Abschnitt 3.1 steht — Tabellen, Blockquotes, Bilder, Fußnoten, Task-Listen, Überschriften ab `####` — wird **als Klartext ausgegeben**: die Syntaxzeichen bleiben sichtbar, es entsteht kein HTML. Kein Verschlucken, kein Entfernen, kein Fehler.

Roh eingebettete HTML-Tags im Eingabetext werden **escaped** (`&lt;div&gt;`) und dadurch sichtbar, aber nicht ausgeführt (siehe AC-2). Auch das ist bewusst Klartext statt stiller Entfernung: der Admin sieht am Ergebnis, dass er nicht unterstützte Syntax benutzt hat, und kann sie korrigieren.

### 3.3 Leerer Inhalt

Ist `content` `null`, leer oder nur Whitespace, rendert die Komponente **nichts** — kein leerer Wrapper, keine Platzhalter-Zeile.

Das **Ausblenden der umgebenden Info-Box** ist dagegen **nicht** Aufgabe dieser Komponente, sondern der einbettenden Page/des Panels — `markdown-text` ist Leaf und kennt die Box nicht. Konkret: [`login-info-panel`](login-info-panel.md) bzw. [`home-dashboard`](home-dashboard.md) blenden ihre Markdown-Box aus, wenn `infoText` aus `GET /api/public/info` `null` ist ([`api/public.md`](../../api/public.md) Abschnitt „Nicht konfigurierte Werte").

---

## 4. Verwendung in Epics

| Epic | Einsatzort |
|---|---|
| [Epic_Login](../../epics/Epic_Login/epic.md) | [`login-info-panel`](login-info-panel.md) |
| [Epic_Home_Verkaeufer](../../epics/Epic_Home_Verkaeufer/epic.md) | Markdown-Info-Panel in [`home-dashboard`](home-dashboard.md) |
| [Epic_Home_Admin](../../epics/Epic_Home_Admin/epic.md) | Markdown-Info-Panel in [`home-dashboard`](home-dashboard.md) |
| [Epic_Einstellungen](../../epics/Epic_Einstellungen/epic.md) | Live-Vorschau in [`einstellungen-form`](../forms/einstellungen-form.md) — dieselbe Komponente rendert die Vorschau, die der Verkäufer später sieht |

Überall derselbe Text (`infoText` aus Epic_Einstellungen).

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den übergebenen Markdown-Text in HTML rendern und dabei **jedes** in Abschnitt 3.1 gelistete Element korrekt darstellen — insbesondere Absätze und Zeilenumbrüche.
2. **AC-2** — THE SYSTEM SHALL keine über die unterstützten Markdown-Elemente hinausgehenden HTML-Tags aus dem Eingabetext ausführen (XSS-Schutz — Admin-Eingabe, aber dennoch sanitized rendern).
3. **AC-3** — IF der Eingabetext Syntax enthält, die nicht in Abschnitt 3.1 gelistet ist, THEN SHALL das System sie als Klartext mit sichtbaren Syntaxzeichen ausgeben und sie weder in HTML umsetzen noch entfernen.
4. **AC-4** — IF ein Link ein anderes Schema als `http`, `https` oder `mailto` verwendet, THEN SHALL das System ihn als Klartext ausgeben und kein `<a>`-Element erzeugen.
5. **AC-5** — IF `content` `null`, leer oder nur Whitespace ist, THEN SHALL das System nichts rendern — kein leeres Wrapper-Element und keine Platzhalter-Zeile.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #markdown #info-text #custom-component #shared-across-epics
