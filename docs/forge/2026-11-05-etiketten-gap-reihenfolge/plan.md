# Implementierungs- und Testplan: Etiketten-Vordruck – Abstand-Felder unter Offset X/Y (Rev. 1)

## Freigabe
- Status: freigegeben
- Freigegeben von: Sven Reichert, 2026-11-05, Rev. 1, Chat

## Änderungen gegenüber Rev. –
- Erste Revision.

## Kontext
- Work Item: Im Bereich „Bogenformat“ des Etiketten-Vordrucks stehen die Felder „Abstand waagerecht (mm)“ (Gap zwischen Spalten) und „Abstand senkrecht (mm)“ (Gap zwischen Zeilen) unterhalb von „Offset X (mm)“/„Offset Y (mm)“.
- Anlass: Bögen mit Gap zwischen den Etiketten (z. B. Rand links/rechts je 4 mm, Etikett 99,1 mm, Gap 3,8 mm in der Mitte) sollen ohne Suchen eingetragen werden können.
- Bestand (beobachtet): Gap-Funktion existiert bereits vollständig – Felder `gapHorizontal`/`gapVertical`, Vorbelegung 0 (`label-geometry.ts`, `AVERY_16_GEOMETRY`), Lageberechnung `slotRects()`, Rasterprüfung `fitsSheetWidth/Height`, Persistenz und API. Fachlich entschieden (Chat, 2026-11-05): Felder nur verschieben, Beschriftung bleibt.
- Quelle: Auftrag im Chat, 2026-11-05. Kein Work Item im Tracker (Projekt: „Workitem: keine“).

## Akzeptanzkriterien
- AK1: Im Bereich „Bogenformat“ folgen „Abstand waagerecht (mm)“ und „Abstand senkrecht (mm)“ direkt auf „Offset X (mm)“ und „Offset Y (mm)“ und sind die letzten beiden Eingabefelder.
- AK2: Reihenfolge der übrigen Felder bleibt: Bogenbreite, Bogenhöhe, Etikettbreite, Etiketthöhe, Rand oben, Rand rechts, Rand unten, Rand links, Spalten, Zeilen, Offset X, Offset Y.
- AK3: Beschriftung, Vorbelegung (0), Prüfregeln, Speichern/Laden und Druckergebnis der Abstand-Felder bleiben unverändert.

## Delta
- Feldreihenfolge – `SHEET_FORMAT_FIELDS` in `features/blank-labels/model/sheet-format-rules.ts` legt Anzeigereihenfolge fest (`sheet-format-form.ts:53`, `@for` im Template); `gapHorizontal`/`gapVertical` stehen nach `marginLeft` – an das Ende nach `offsetY` verschieben.
- Backend, API, Persistenz, `FIELD_LABELS`, Prüfregeln – keine Änderung.

## Entscheidungen
- E1: Reihenfolge über `SHEET_FORMAT_FIELDS` ändern, keine separate Anzeigeliste – Liste bestimmt sonst nur Iterationsreihenfolge in `textsFromGeometry`/`validateSheetFormat` (Objekt-Ergebnis, reihenfolgeunabhängig); eine zweite Liste wäre Duplikat. Kein ADR.
- E2: Grid mit zwei Spalten (`sheet-format-form.scss`) bleibt – neue Reihenfolge ergibt Paare (Spalten|Zeilen), (Offset X|Offset Y), (Abstand waagerecht|Abstand senkrecht).

## Implementierungsschritte
1. Test zuerst: `sheet-format-form.spec.ts` – Reihenfolge der `input[data-field]` als Liste prüfen (AK1, AK2); schlägt vor Änderung fehl.
2. `SHEET_FORMAT_FIELDS` umsortieren: `gapHorizontal`, `gapVertical` hinter `offsetY`.
3. Doku-Nachführung: Feldreihenfolge in `docs/requirements/bazaar-app/entities/etiketten-vordruck.md` und Bogenformat-Abschnitt in `docs/requirements/bazaar-app/spec.md` prüfen und angleichen, falls dort Reihenfolge beschrieben; Feature-Profil `bazaar-app-blank-labels` nur bei Reihenfolgeangabe.

## Task-Schnitt
- T1 – Schritte 1–3 – abhängig von: Umsetzung Plan `2026-11-05-etiketten-offset` (fügt `offsetX`/`offsetY` in dieselbe Liste ein).

## Tests
- AK1/AK2 – Component (Vitest) – `sheet-format-form.spec`: `data-field`-Werte aller Eingaben in erwarteter Reihenfolge (14 Felder, letzte zwei `gapHorizontal`, `gapVertical`).
- AK3 – Unit (Vitest), Bestand – `sheet-format-rules.spec`, `label-geometry.spec`, `label-sheet.spec` laufen unverändert grün; keine neuen Tests nötig.
- E2E: keiner; Sichtprüfung im Browser durch Mensch.

## Betrieb
- Keine neue Infrastruktur oder Datenhaltung.

## Abhängigkeiten und Übergaben
- Plan `2026-11-05-etiketten-offset` (in Umsetzung) – muss vorher gemergt sein bzw. Umsetzung baut auf dessen Branch auf; sonst Konflikt in `SHEET_FORMAT_FIELDS` und Formular-Spec.

## Offene Fragen
- F1 – Felder verschieben oder zusätzlich umbenennen? – Default: nur verschieben – Status: geklärt (Chat 2026-11-05: „Nur verschieben“)

## Risiken und Annahmen
- Annahme (beobachtet): Kein anderer Code hängt an der Reihenfolge von `SHEET_FORMAT_FIELDS` (Suche: nur `sheet-format-form.ts`, `sheet-format-rules.ts`).
- Annahme (abgeleitet): Offset-Umsetzung hängt `offsetX`/`offsetY` ans Listenende an (Plan `2026-11-05-etiketten-offset`, Schritt 6).
