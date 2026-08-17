---
status: reviewed
reviewed-date: 2026-08-14
updated: 2026-08-17
---

# Component: einstellungen-form

Reine Formulare — keine neuen PrimeNG-Entscheidungen.

## Kontext

```
BASAR-KONFIGURATION
  Voranmeldeschluss    [📅 Datum + Uhrzeit]
  Abgabe von           [📅 Datum + Uhrzeit]
  Abgabe bis           [📅 Datum + Uhrzeit]
  Basar von            [📅 Datum + Uhrzeit]
  Basar bis            [📅 Datum + Uhrzeit]
  Standard-Verkäufer-Typ [p-select]

NUMMERNBLOCK-PARAMETER
  Startnummer          [_____]
  Blockgröße           [_____]
  Standard-Blockanzahl [_____]

INFO-TEXT                          Unterstützte Formatierung ⓘ
┌─────────────────────────┬─────────────────────────┐
│ [Markdown-Textarea]     │  Vorschau               │
│                         │                         │
│ ## Hinweise             │  Hinweise               │  ← <h2>
│                         │                         │
│ Bitte Artikel gut       │  Bitte Artikel gut      │
│ sichtbar mit Nummer …   │  sichtbar mit Nummer …  │
└─────────────────────────┴─────────────────────────┘

                              [Speichern]
```

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Feld | PrimeNG |
|---|---|
| Die 5 Basar-Termine | [Datepicker](../standard/datepicker.md) |
| `defaultTypeId` | [Select](../standard/select.md), Variante Dropdown — Liste aller Verkäufer-Typen |
| `startNumber` / `blockSize` / `defaultBlockCount` | [Input](../standard/input.md), Variante Number |
| `infoText` | `pTextarea` (min. 8 Zeilen, vertikal resizable), `maxlength="4000"` + Zeichenzähler |
| Info-Text-Vorschau | [`markdown-text`](../custom/markdown-text.md) — **dieselbe** Komponente, die den Text später auf Login-Seite und Home rendert |
| Syntax-Hilfe | `p-popover`, geöffnet über ein ⓘ-Icon (`p-button [text]="true" [rounded]="true"`) rechts neben dem Abschnittstitel |
| Speichern-Button | [Button](../standard/button.md) primary |
| Save-Feedback | [Toast](../standard/toast.md) „✓ Einstellungen gespeichert" |

### Info-Text: Vorschau

Textarea und Vorschau liegen **nebeneinander** (je 50 %), auf Mobile (≤ 768 px)
untereinander mit der Vorschau unten. Die Vorschau aktualisiert sich **live bei jeder
Eingabe** — kein Speichern nötig, kein „Vorschau"-Button. Grund: der Admin sieht sofort,
ob `## Hinweise` zur Überschrift wird oder als Klartext stehen bleibt; genau der Fall, der
sonst erst nach dem Speichern auf der öffentlichen Login-Seite auffällt.

**Bewusst dieselbe Komponente**, kein zweiter Renderer: eine abweichende Vorschau wäre
schlimmer als keine. Die Vorschau erbt damit automatisch den Umfang aus
[`markdown-text`](../custom/markdown-text.md) Abschnitt 3.1 und dessen Fallback für nicht
unterstützte Syntax (Abschnitt 3.2).

Die Vorschau zeigt den **Textfluss**, nicht die endgültige Optik: sie übernimmt nicht den
dunklen Box-Hintergrund des `login-info-panel` und nicht dessen 13 px/line-height 1.7,
sondern rendert auf dem hellen Formular-Untergrund. Ist das Feld leer, steht in der
Vorschau-Spalte der Platzhalter „Keine Vorschau — Info-Text ist leer" (12 px, muted);
in diesem Fall entfällt die Box auf Login und Home ganz (markdown-text Abschnitt 3.3).

### Info-Text: Längengrenze

Das Feld ist auf **4000 Zeichen** begrenzt (Begründung → [`entities/einstellungen.md`](../../entities/einstellungen.md)).
Unter der Textarea steht rechtsbündig ein Zeichenzähler `1204 / 4000` (12 px, muted), ab
3800 Zeichen in Warnfarbe. Das Feld nimmt über `maxlength` keine weiteren Zeichen an —
Kürzen bereits getippten Texts ist damit nie nötig, es lässt sich einfach nichts mehr
eingeben. Der Speichern-Button bleibt bedienbar; die Grenze ist keine Submit-Sperre.

Die Prüfung steht **zusätzlich** im Backend (`400`, siehe
[`api/settings.md`](../../api/settings.md)) — bei Text, der per Paste über die Grenze
kommt, oder bei direktem Aufruf des Endpoints ohne dieses Formular.

### Info-Text: Syntax-Hilfe

Das ⓘ-Icon neben dem Abschnittstitel „INFO-TEXT" öffnet ein `p-popover` mit der
Element-Tabelle aus [`markdown-text`](../custom/markdown-text.md) Abschnitt 3.1 —
Syntax links, Wirkung rechts — plus dem Satz: „Nicht aufgeführte Syntax bleibt als
Klartext stehen." Die Liste wird **nicht** in diese Datei kopiert; sie ist im Code aus der
Komponenten-Doku zu übernehmen und bleibt dort die einzige Quelle.

## Akzeptanzkriterien

Struktur-Referenz zu [Epic_Einstellungen](../../epics/Epic_Einstellungen/epic.md) — dort gelten **alle** Akzeptanzkriterien, hier bewusst ohne Nummernspanne. Zusätzlich für die Info-Text-Bearbeitung:

1. **AC-F1** — WHILE der Admin im `infoText`-Feld tippt, SHALL das System die Vorschau bei jeder Eingabe aktualisiert anzeigen, ohne dass gespeichert werden muss.
2. **AC-F2** — THE SYSTEM SHALL die Vorschau mit derselben `markdown-text`-Komponente rendern, die den Text auf Login-Seite und Home anzeigt.
3. **AC-F3** — IF das `infoText`-Feld leer ist, THEN SHALL das System in der Vorschau-Spalte den Platzhalter „Keine Vorschau — Info-Text ist leer" anzeigen.
4. **AC-F4** — WHEN das ⓘ-Icon neben „INFO-TEXT" geklickt wird, THEN SHALL das System ein Popover mit den unterstützten Markdown-Elementen und dem Hinweis anzeigen, dass nicht aufgeführte Syntax als Klartext stehen bleibt.
5. **AC-F5** — WHILE der Admin den `infoText` bearbeitet, SHALL das System die belegte Länge als `<n> / 4000` anzeigen und ab 3800 Zeichen in Warnfarbe hervorheben.
6. **AC-F6** — IF der Admin versucht, über 4000 Zeichen einzugeben, THEN SHALL das System die weitere Eingabe unterbinden statt bereits erfassten Text zu kürzen.

## Tags & Piles

**Tags:** #einstellungen #datepicker #inputnumber #select #textarea #markdown #vorschau #primeng
