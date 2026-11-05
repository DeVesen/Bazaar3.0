# Implementierungs- und Testplan: Etiketten-Vordruck – Druckversatz (Offset X/Y) (Rev. 1)

## Freigabe
- Status: freigegeben
- Freigegeben von: Sven Reichert, 2026-11-05, Rev. 1, Chat (Defaults F1–F4 übernommen)

## Änderungen gegenüber Rev. –
- Erste Revision.

## Kontext
- Work Item: Im Etiketten-Vordruck der Haupt-App lässt sich der gesamte Druck über zwei neue Felder „Offset X“ und „Offset Y“ (mm) am Ende des Bereichs „Bogenformat“ verschieben, ohne das Bogenformat (Ränder, Abstände, Rasterprüfung) zu verändern.
- Anlass: Mit Standardwerten (Avery 16er) schneidet der Drucker links ab; Korrektur über „Rand links“ verändert das Format (Rasterprüfung, Etikettlage untereinander).
- Quelle: Auftrag im Chat, 2026-11-05. Kein Work Item im Tracker (Projekt: „Workitem: keine“).

## Akzeptanzkriterien
- AK1: Bereich „Bogenformat“ hat nach „Zeilen“ zwei Eingabefelder „Offset X (mm)“ und „Offset Y (mm)“, vorbelegt mit 0.
- AK2: Offset X = 2 verschiebt im Druck alle Etiketten samt Inhalt um 2 mm nach rechts; Offset X = −2 um 2 mm nach links.
- AK3: Offset Y = 2 verschiebt im Druck alle Etiketten um 2 mm nach unten; Offset Y = −2 um 2 mm nach oben.
- AK4: Offset ändert weder die Rasterprüfung („passen nicht in die Bogenbreite/-höhe“) noch „Etiketten pro Seite“ noch die Lage der Etiketten zueinander.
- AK5: Offset erlaubt negative Werte, höchstens eine Nachkommastelle, Betrag höchstens 20 mm; leer, keine Zahl oder außerhalb → Fehlertext am Feld, Drucken und Speichern gesperrt (wie bei den übrigen Feldern).
- AK6: Offset wird mit dem Bogenformat gespeichert und beim Auswählen des Formats wieder geladen.
- AK7: Bereits gespeicherte Bogenformate haben nach dem Update Offset X = Offset Y = 0 und drucken unverändert.

## Delta
- Geometrie – `LabelSheetGeometry` (Domain-Record, `label-geometry.ts`) ohne Offset – Felder `OffsetX`/`OffsetY` (`offsetX`/`offsetY`) ergänzen.
- Validierung – `HasValidMeasures`, `SaveLabelSheetFormatCommandValidator`, `sheet-format-rules.ts` kennen nur Maße ≥ 0 – neue Regel „vorzeichenbehaftet, |Wert| ≤ 20, eine Nachkommastelle“; Offset nicht in `FitsSheetWidth/Height` bzw. `WIDTH_FIELDS/HEIGHT_FIELDS`.
- Persistenz – `LabelSheetFormatConfiguration` (ComplexProperty) – zwei Spalten, Precision (6,1), Default 0; Migration `AddLabelSheetOffset`.
- API – `SaveLabelSheetFormatCommand`, `LabelSheetFormatDto` – zwei Felder `offsetX`, `offsetY` im JSON-Contract.
- Darstellung – `slotRects()` rechnet Lage ab Rand – im Druck Offset auf `left`/`top` addieren.
- Formular – `SheetFormatForm`, `SHEET_FORMAT_FIELDS`, `FIELD_LABELS` – zwei Felder am Ende; `AVERY_16_GEOMETRY` mit 0.
- Doku – `docs/requirements/bazaar-app/entities/etiketten-vordruck.md`, `api/blank-labels.md`, `spec.md` (Bogenformat), `docs/components/label-sheet/component.md`, Feature-Profil `bazaar-app-blank-labels`, Glossar `frontend-terms.md` – Offset nachführen.

## Entscheidungen
- E1: Offset ist Teil des gespeicherten Bogenformats (nicht Geräte-/Browser-Einstellung) – Wunsch „am Ende von Bogenformat“, einfachster Weg; je Drucker lässt sich ein eigenes Format speichern. Kein ADR (leicht umkehrbar).
- E2: Offset wirkt nur im Druck (`LabelSheetsDocument`), die Vorschau bleibt unverschoben – Vorschau zeigt das Format, Offset ist Druckerkorrektur; vermeidet abgeschnittene Vorschau. (siehe F2)
- E3: Umsetzung als Verschiebung der Slot-Positionen in `slotRects()` über Parameter `applyOffset`, nicht über CSS-`transform` am Bogen – bleibt in mm-Logik, testbar als reine Funktion; Etiketten, die über den Seitenrand rutschen, werden vom Drucker/Browser abgeschnitten (gewollt).
- E4: Grenze ±20 mm – Druckerränder liegen typisch bei 3–6 mm; schützt vor Tippfehlern. (siehe F3)
- E5: Migration setzt Default 0 für Bestandszeilen – AK7 ohne Datenpflege.

## Implementierungsschritte
1. Domain: `LabelSheetGeometry` um `decimal OffsetX, decimal OffsetY` erweitern (am Ende, nach `Rows`); `HasValidMeasures` prüft Offset mit `IsOffset` (|Wert| ≤ `MaxOffsetMm` = 20, eine Nachkommastelle). `FitsSheetWidth/Height` unverändert. Tests in `LabelSheetFormatTests`.
2. Application: `SaveLabelSheetFormatCommand` + `ToGeometry()` um Offset; Validator-Regel `OffsetMeasure` (−20..20, eine Nachkommastelle); `AllMeasures` unverändert (Offset nicht in Fit-Bedingung). Tests in `SaveLabelSheetFormatCommandValidatorTests`, `SaveLabelSheetFormatHandlerTests`.
3. Infrastructure: `LabelSheetFormatConfiguration` – Offset-Properties mit Precision (6,1) und `HasDefaultValue(0m)`; Migration `AddLabelSheetOffset` per `dotnet ef migrations add` (Skill `dv-dotnet:dotnet-ef-migrations`); Repository-Test Roundtrip mit negativem Offset.
4. API: `LabelSheetFormatDto` um `OffsetX`, `OffsetY`; Endpunkt-/Contract-Test, falls vorhanden; `api/blank-labels.md` aktualisieren.
5. Frontend Modell: `LabelSheetGeometry` + `AVERY_16_GEOMETRY` (0/0); `slotRects(geometry, { applyOffset })` addiert `offsetX`/`offsetY` nur bei `applyOffset: true`; `blank-labels-api.ts` Typ.
6. Frontend Regeln: `SHEET_FORMAT_FIELDS` um `offsetX`, `offsetY` (am Ende); `OFFSET_FIELDS` mit eigener Prüfung (Meldung „Zwischen −20 und 20 mm“); nicht in `WIDTH_FIELDS/HEIGHT_FIELDS`.
7. Frontend Darstellung: `LabelSheet` neues Input `applyOffset` (Default false); `LabelSheetsDocument` setzt `[applyOffset]="true"`.
8. Frontend Formular: `FIELD_LABELS` um „Offset X (mm)“, „Offset Y (mm)“; Hinweistext unter den Feldern „Plus: nach rechts/unten, Minus: nach links/oben“.
9. Doku-Nachführung (eigener Task laut CLAUDE.md): Anforderungen, Komponente, Feature-Profil, Glossar.

## Task-Schnitt
- T1 Backend (Schritte 1–4) – Domain, Application, Migration, DTO, Tests – abhängig von: keine.
- T2 Frontend (Schritte 5–8) – Modell, Regeln, Darstellung, Formular, Tests – abhängig von: Feldnamen aus T1 (`offsetX`/`offsetY`, im Plan fixiert, daher parallel möglich).
- T3 Doku (Schritt 9) – abhängig von: T1, T2.

## Tests
- AK1 – Component (Vitest) – `sheet-format-form.spec`: Felder `offsetX`/`offsetY` als letzte beiden mit Labels; `sheet-format-rules.spec`: `textsFromGeometry(AVERY_16_GEOMETRY)` liefert „0“.
- AK2/AK3 – Unit (Vitest) – `label-geometry.spec`: `slotRects` mit `offsetX: 2` → jedes `left` +2; `-2` → −2; `offsetY` analog für `top`; ohne `applyOffset` unverändert. `label-sheets-document.spec`: Druck übergibt `applyOffset`, erster Slot-Style `left` enthält Versatz; `label-sheet.spec`: Vorschau ohne Versatz.
- AK4 – Unit – `label-geometry.spec`/`sheet-format-rules.spec`: Format, das knapp passt, bleibt mit Offset ±20 gültig; Abstand zwischen Slot 1 und 2 unverändert; Domain-Test `FitsSheetWidth` unabhängig vom Offset.
- AK5 – Unit – `sheet-format-rules.spec`: „-2“ gültig, „-2,55“ → eine Nachkommastelle, „21“/„-21“ → Bereich, „“ → Pflichtfeld, „abc“ → keine Zahl; xUnit `SaveLabelSheetFormatCommandValidatorTests` (Theory: −20, 20 gültig; −20.1, 20.1, 1.25 ungültig); `LabelSheetFormatTests` Domain lehnt ungültigen Offset ab.
- AK6 – Unit/Integration – `SaveLabelSheetFormatHandlerTests` speichert Offset; `LabelSheetFormatRepositoryTests` Roundtrip mit −2,5/3; Frontend Page-/Store-Spec: Auswahl eines Formats füllt Offset-Texte.
- AK7 – Integration – Migration: Spalten `NOT NULL DEFAULT 0` (Sichtprüfung Migrationsdatei + Repository-Test lädt Format ohne gesetzten Offset als 0).
- E2E: keiner automatisiert (kein E2E-Setup für Druck); manueller Probedruck durch Mensch: Avery 16er mit Offset X = 2 auf realem Drucker, Lineal-Vergleich.

## Betrieb
- Datenhaltung – zwei neue Spalten in `LabelSheetFormats`, Default 0; keine Aufräum- oder Konsistenzjobs nötig.
- Sichtbarkeit – keine neue Infrastruktur.

## Abhängigkeiten und Übergaben
- Branch `docs/feature/etiketten-bilder-bibliothek` / Plan `2026-11-05-etiketten-bilder-bibliothek` ändert denselben Feature-Bereich – Reihenfolge der Migrationen und Merge-Konflikte in `blank-labels-page` beachten; Offset-Migration nach deren Migration erzeugen, falls jene zuerst gemergt wird.

## Offene Fragen
- F1 – Soll der Offset mit dem Bogenformat gespeichert werden (je Format), oder einmal pro Rechner/Drucker gelten, egal welches Format? – Default: mit dem Bogenformat gespeichert – Status: geklärt (Default bestätigt, Chat 2026-11-05)
- F2 – Soll die Vorschau den Versatz ebenfalls zeigen? – Default: nein, nur der Druck wird verschoben – Status: geklärt (Default bestätigt, Chat 2026-11-05)
- F3 – Erlaubter Bereich? – Default: −20 bis +20 mm, eine Nachkommastelle – Status: geklärt (Default bestätigt, Chat 2026-11-05)
- F4 – Beschriftung: „Offset X (mm)“/„Offset Y (mm)“ oder deutsch „Versatz waagerecht (mm)“/„Versatz senkrecht (mm)“ (passend zu „Abstand waagerecht“)? – Default: „Offset X (mm)“/„Offset Y (mm)“ wie gewünscht – Status: geklärt (Default bestätigt, Chat 2026-11-05)

## Risiken und Annahmen
- Annahme (abgeleitet): Abschneiden links kommt vom nicht bedruckbaren Druckerrand bei `@page { margin: 0 }` (`print.service.ts:66`); Offset kompensiert nur Verschiebung, nicht Skalierung durch Druckdialog („An Seite anpassen“).
- Risiko: Bei negativem Offset ragen Etiketten über den Seitenrand und werden abgeschnitten – gewollt, Hinweistext im Formular.
- Annahme: Etikettendruck nutzt `LabelSheet` nur im Feature `blank-labels` (Suche nach `slotRects`/`LabelSheetGeometry`, beobachtet).
