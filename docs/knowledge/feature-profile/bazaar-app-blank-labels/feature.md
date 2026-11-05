# Etiketten-Vordruck (Bazaar-App)

**Intent:** Admin druckt Blanko-Etiketten (fortlaufende Nummer als QR-Code und Klartext, Logo, Verkäufer-Symbol, Preisfeld) auf frei einstellbare Etikettenbögen, ohne Bezug zu Artikeln.
**Coverage:** inventoried
**Last reviewed:** 2026-11-05

## Capabilities

### Bereich A — Bogenformat (`sheet-format-form`)
- Admin sieht beim ersten Öffnen Avery 16er (A4, 105 × 35, Ränder oben/unten 8,5, 2 × 8) und „16 Etiketten pro Seite" — `features/blank-labels/model/sheet-format-rules.ts`, `shared/components/label-sheet/label-geometry.ts` (`AVERY_16_GEOMETRY`)
- Admin ändert Maße, Spalten und Zeilen; Fehler stehen am Feld (jedes Maß höchstens 10000 mm, Spalten und Zeilen höchstens 1000, ein Raster, das den Bogen um mehr als 0,5 mm überragt, meldet den Fehler am zuletzt geänderten Feld der Achse, sonst Spalten bzw. Zeilen) — `validateSheetFormat()`
- Admin stellt Offset X und Offset Y (mm, −20 bis +20, eine Nachkommastelle, Vorbelegung 0) ein; der Druck wandert bei Plus nach rechts/unten, bei Minus nach links/oben, die Vorschau bleibt unverschoben; Hinweistext im Formular, Fehler „Zwischen −20 und 20 mm“ — `validateSheetFormat()`, `label-geometry.ts` (`slotRects` mit `applyOffset`), `label-sheet` (Input `applyOffset`)
- Admin speichert, lädt, überschreibt („Überschreiben?") und löscht benannte Bogenformate — `pages/blank-labels-page/blank-labels-page.ts`, `blank-labels-store.ts`, Backend `Features/BlankLabels/BlankLabelEndpoints.cs`

### Bereich B — Etiketten-Inhalt (`label-content-form`, `graphic-picker`)
- Admin gibt Startnummer, Anzahl und Währungssymbol ein und wählt Logo und Verkäufer-Symbol aus der Icon-Liste oder lädt ein eigenes Bild (PNG/JPEG/SVG bis 1 MB) — `model/label-content-rules.ts`, `model/image-file.ts`
- Vorschau eines Etiketts mit Falzlinie — `shared/components/label-sheet/label-card.ts`

### Bereich C — Angebrochener Bogen (`start-position-form`)
- Admin gibt die Startposition ein; Plätze davor erscheinen in der Vorschau grau — `shared/components/label-sheet/label-slots.ts` (`startPositionPreview`)

### Drucken
- „Drucken" öffnet den Browser-Druckdialog mit allen Bögen in Bogengröße, mit Falzlinie; Hinweis „Skalierung 100 %, keine Seitenränder" — `core/print/print.service.ts` (`printLabelSheets`), `shared/components/label-sheet/label-sheets-document.ts`
- Logo, Verkäufer-Symbol und Währungssymbol werden bei jedem Druck im Backend gemerkt und beim nächsten Öffnen auf jedem Gerät vorbelegt — `PUT /api/label-print-defaults`

## Spans
- **Frontend:** `features/blank-labels/` (Seite, Store, Api, Prüfregeln, Eingabe-Komponenten), `shared/components/label-sheet/` (Geometrie, Layout, Platzierung, Etikett, Bogen, Druckdokument), `core/print/print.service.ts`, Menüeintrag in `core/shell/sidebar/`
- **Backend:** `Bazaar.Api/Features/BlankLabels/`, `Bazaar.Application/BlankLabels/`, `Bazaar.Domain/BlankLabels/`, Repositories `LabelSheetFormatRepository`, `LabelPrintDefaultsRepository`, Migration `AddBlankLabels`

## Notes
- Route `/blank-labels` und alle Endpoints nur für Admin; Kassenpersonal sieht den Menüeintrag nicht.
- Eigene Bilder liegen als Base64-Data-URL in `LabelPrintDefaults`; nginx lässt dafür 3000k je Request zu. Das Backend prüft nur Medientyp und Größe; ein 0-Byte-Bild gilt als gültig.
- Schlägt das Laden der Formatliste fehl, bleibt die Liste leer, ohne eigene Fehlermeldung; schlägt das Laden der letzten Werte fehl, erscheint eine Warnung.
