# Etiketten-Vordruck (Bazaar-App)

**Intent:** Admin druckt Blanko-Etiketten (fortlaufende Nummer als QR-Code und Klartext, Logo, Verkäufer-Symbol, Preisfeld) auf frei einstellbare Etikettenbögen, ohne Bezug zu Artikeln.
**Coverage:** inventoried
**Last reviewed:** 2026-11-05

## Capabilities

### Bereich A — Bogenformat (`sheet-format-form`)
- Admin sieht beim ersten Öffnen Avery 16er (A4, 105 × 35, Ränder oben/unten 8,5, 2 × 8) und „16 Etiketten pro Seite" — `features/blank-labels/model/sheet-format-rules.ts`, `shared/components/label-sheet/label-geometry.ts` (`AVERY_16_GEOMETRY`)
- Admin ändert Maße, Spalten und Zeilen; Fehler stehen am Feld (jedes Maß höchstens 10000 mm, Spalten und Zeilen höchstens 1000, ein Raster, das den Bogen um mehr als 0,5 mm überragt, meldet den Fehler am zuletzt geänderten Feld der Achse, sonst Spalten bzw. Zeilen) — `validateSheetFormat()`
- Admin speichert, lädt, überschreibt („Überschreiben?") und löscht benannte Bogenformate — `pages/blank-labels-page/blank-labels-page.ts`, `blank-labels-store.ts`, Backend `Features/BlankLabels/BlankLabelEndpoints.cs`

### Bereich B — Etiketten-Inhalt (`label-content-form`, `graphic-picker`)
- Admin gibt Startnummer, Anzahl und Währungssymbol ein und wählt Logo und Verkäufer-Symbol aus der Icon-Liste, aus der Bibliothek oder lädt ein eigenes Bild (PNG/JPEG/SVG bis 1 MB) — `model/label-content-rules.ts`, `model/image-file.ts`
- Admin lädt ein eigenes Bild hoch: es landet in der Bilder-Bibliothek (Name = Dateiname ohne Endung, höchstens 50 Zeichen) und ist für das Feld gewählt; ein inhaltsgleiches Bild legt keinen zweiten Eintrag an, das vorhandene wird gewählt — `pages/blank-labels-page/blank-labels-page.ts`, `data/blank-labels-api.ts` (`uploadImage`)
- Admin sieht im Picker den Abschnitt „Bibliothek“ (nur wenn mindestens ein Bild vorhanden ist) mit Vorschaubild und Namen je Bild, der Anzeige „{n} von 50 Bildern“ und wählt ein Bild per Klick, auf jedem Gerät; ein noch nicht geladenes Bild erscheint als deaktivierter Button mit Namen — `components/graphic-picker/`, `blank-labels-store.ts` (Inhalte je Bild einzeln geladen und zwischengespeichert)
- Admin löscht ein Bild über den Lösch-Button („Bild „{Name}“ löschen“) nach Bestätigung („Bild löschen“ / „Bild „{Name}“ aus der Bibliothek löschen?“, „Löschen“/„Abbrechen“); ein damit schon gewähltes Logo oder Symbol bleibt im Etikett erhalten, da die Bibliothek nur Kopierquelle ist
- Meldungen: voll → „Bibliothek voll“ / „Bitte zuerst ein Bild löschen.“ (409); Upload-Fehler → „Bild nicht übernommen“; Löschfehler → „Bild konnte nicht gelöscht werden“; Laden der Bibliothek scheitert → „Bibliothek konnte nicht geladen werden“
- Vorschau eines Etiketts mit Falzlinie — `shared/components/label-sheet/label-card.ts`

### Bereich C — Angebrochener Bogen (`start-position-form`)
- Admin gibt die Startposition ein; Plätze davor erscheinen in der Vorschau grau — `shared/components/label-sheet/label-slots.ts` (`startPositionPreview`)

### Drucken
- „Drucken" öffnet den Browser-Druckdialog mit allen Bögen in Bogengröße, mit Falzlinie; Hinweis „Skalierung 100 %, keine Seitenränder" — `core/print/print.service.ts` (`printLabelSheets`), `shared/components/label-sheet/label-sheets-document.ts`
- Logo, Verkäufer-Symbol und Währungssymbol werden bei jedem Druck im Backend gemerkt und beim nächsten Öffnen auf jedem Gerät vorbelegt — `PUT /api/label-print-defaults`

## Spans
- **Frontend:** `features/blank-labels/` (Seite, Store, Api, Prüfregeln, Eingabe-Komponenten), `shared/components/label-sheet/` (Geometrie, Layout, Platzierung, Etikett, Bogen, Druckdokument), `core/print/print.service.ts`, Menüeintrag in `core/shell/sidebar/`
- **Backend:** `Bazaar.Api/Features/BlankLabels/`, `Bazaar.Application/BlankLabels/`, `Bazaar.Domain/BlankLabels/`, Repositories `LabelSheetFormatRepository`, `LabelPrintDefaultsRepository`, `LabelImageRepository`, Migrationen `AddBlankLabels`, `AddLabelImages`; Endpoints `/api/label-images` (`LabelImageEndpoints.cs`)

## Notes
- Route `/blank-labels` und alle Endpoints nur für Admin; Kassenpersonal sieht den Menüeintrag nicht.
- Eigene Bilder liegen als Base64-Data-URL in der Bibliothek (`LabelImages`, höchstens 50, inhaltsgleiche nur einmal per SHA-256) und als Kopie in `LabelPrintDefaults` (kein Verweis); beim Start übernimmt das Backend vorhandene Logo-/Symbol-Bilder einmalig in die Bibliothek („Logo“, „Verkäufer-Symbol“), ein Fehler dabei wird nur protokolliert und stoppt den Start nicht; nginx lässt dafür 3000k je Request zu. Das Backend prüft nur Medientyp und Größe; ein 0-Byte-Bild gilt als gültig.
- Schlägt das Laden der Formatliste fehl, bleibt die Liste leer, ohne eigene Fehlermeldung; schlägt das Laden der letzten Werte fehl, erscheint eine Warnung.
- Die Liste `GET /api/label-images` liefert nur Metadaten; die Bildinhalte lädt die Seite einzeln (ein Request je Bild) und zeigt sie nur per `<img [src]>`, nie als eigenes Dokument (SVG kann Skripte enthalten).
