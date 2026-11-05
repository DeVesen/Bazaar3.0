# Implementierungs- und Testplan: Etiketten-Vordruck – Elementgrößen im Etiketten-Inhalt (Rev. 4)

## Freigabe
- Status: freigegeben
- Freigegeben von: Sven Reichert, 2026-11-05, Rev. 4, Chat

## Änderungen gegenüber Rev. 3
- A2 neu: Logo hat kein eigenes Größenfeld mehr, sondern füllt die freie Fläche zwischen QR-Code, Falzlinie, oberem Etikettrand und Artikel-Nummer (je 1,5 mm Abstand), eingepasst und zentriert (E8, E9).
- A1 ergänzt: QR-Code beginnt 1,5 mm vom linken und oberen Etikettrand (heute oben 1 k).
- A6/A7: vier statt fünf Größenfelder; `LabelElementSizes` ohne `logo` (E1); Backend und Migration mit vier Spalten.
- Delta, Tests und Risiken für Logo und QR-Code angepasst; Abstände 1,5 mm absolut (E9).

## Kontext
- Work Item: keins (Projekt ohne Workitem). Ziel: Im Bereich „Etiketten-Inhalt“ der Haupt-App lassen sich die Größen von QR-Code, Verkäufer-Symbol, Artikel-Nummer und Währungssymbol einzeln einstellen; das Logo füllt den verbleibenden Platz; die Werte werden wie Logo, Verkäufer-Symbol und Währungssymbol mit dem letzten Druck gemerkt.
- Anforderungen (Quelle: Auftrag im Chat, 2026-11-05):
  - A1 QR-Code: ein Wert = Breite = Höhe; linke und obere Kante 1,5 mm vom Etikettrand, wächst nach unten rechts.
  - A2 Logo: kein eigenes Feld; Fläche links = rechte Kante QR-Code + 1,5 mm, rechts = Falzlinie − 1,5 mm, oben = Etikettrand + 1,5 mm, unten = Oberkante Artikel-Nummer − 1,5 mm; Logo darin so groß wie möglich, aber nie verzerrt (Seitenverhältnis bleibt, kein Strecken), und zentriert; die Fläche wird also nur in einer Richtung ganz ausgefüllt, wenn ihr Seitenverhältnis von dem des Logos abweicht.
  - A3 Verkäufer-Symbol: ein Wert = Breite = Höhe für beide Symbole; unten links verankert und wächst nach oben rechts, oben rechts verankert und wächst nach unten links.
  - A4 Artikel-Nummer: Feldhöhe einstellbar, bleibt horizontal zentriert, Schriftgröße folgt der Höhe.
  - A5 Währungssymbol: Feldhöhe einstellbar, rechtsbündig, Schriftgröße folgt der Höhe; die Schreiblinie links davon schrumpft auf den verbleibenden Platz.
  - A6 Die vier Felder stehen im Formular „Etiketten-Inhalt“ nach „Startnummer“, „Anzahl Etiketten“, „Währungssymbol“ und vor „Verkäufer-Symbol“.
  - A7 Gespeichert mit den Werten des letzten Drucks (`/api/label-print-defaults`), nicht mit dem Bogenformat.
  - A8 Keine Kollisionsprüfung; Elemente dürfen sich überlappen.
- Zusatzanforderung: Vorgabewerte = heutige Konstanten aus `label-layout.ts` (QR 21,5 · Symbol 5 · Artikel-Nummer 10,5 · Währung 12), damit Drucke auf 105 × 35 nahezu unverändert aussehen – Quelle: Abstimmung im Chat (Vorschlag Claude, von Nutzer mit Option 1 angenommen).

## Delta
- A1–A5 – `labelLayout(width, height)` in `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-layout.ts` rechnet alle Größen aus festen Konstanten (QR 21,5 · Logo 20 · Symbol 5 · Klartext 10,5 · Währung 12, je × Maßstab k) – Funktion bekommt einen Parameter `sizes`; Größen gehen unverändert in mm ein (E7); übrige Ankerpunkte und Ränder skalieren weiter mit k, außer den in A1/A2 genannten 1,5 mm (E9).
- A1 – QR heute `x 1,5 k, y 1 k` – `x = 1,5`, `y = 1,5`, `size = sizes.qrCode`.
- A2 – Logo heute quadratisch `x 26 k, y 2 k, size 20 k` – neue Box `LabelRect { x, y, width, height }`: `x = 1,5 + qrCode + 1,5`, `y = 1,5`, `width = foldX − 1,5 − x`, `height = (Oberkante Artikel-Nummer − 1,5) − y`; negative Maße → 0, dann wird das Logo nicht gezeigt. Einpassen und Zentrieren leisten `object-fit: contain` (Bild) und `preserveAspectRatio` der SVG-Icons bereits (`label-graphic-view.scss`).
- A3 – Symbol oben rechts hängt heute mit der linken Kante bei `width − 6,5 k` – `x = width − 1,5 k − size` (rechte Kante bleibt). Symbol unten links ist schon unten verankert – nur `size` tauschen.
- A4 – Klartext: `fontSize = sizes.numberHeight`, `y = bottom − numberHeight`; Mitte `x` und `bottom` wie heute. Oberkante liefert zugleich die Unterkante der Logo-Fläche.
- A5 – Währungssymbol ist heute links verankert (`x = width − 13 k`), Schreiblinie hat feste Enden (`width − 48 k` bis `width − 14,5 k`) – Linie und Symbol werden ein gemeinsames Element „Preiszeile“: linke Kante `width − 48 k`, rechte Kante `width − 1,5 k`, Unterkante wie heute; Flex-Zeile mit Linie (`flex: 1`) und Symbol (rechtsbündig, Schrift = Feldhöhe). Die Linie schrumpft damit ohne Textmessung.
- A6 – `LabelContentForm.fields` enthält drei Textfelder – vier weitere Einträge nach `currencySymbol`; Template bleibt (Felder stehen schon vor den Graphic-Pickern).
- A6 – `LabelContentField`, `INITIAL_CONTENT_TEXTS`, `validateLabelContent` in `features/blank-labels/model/label-content-rules.ts` kennen die Felder nicht – vier Felder, Pflicht, Dezimalzahl 0,1 bis 100 mit höchstens 1 Nachkommastelle (wie Bogenformat-Maße); `LabelRun` bekommt `sizes`.
- A7 – Backend `LabelPrintDefaults` (Domain), `UpdateLabelPrintDefaultsCommand`, Validator, `LabelPrintDefaultsDto`, `LabelPrintDefaultsConfiguration` speichern nur Logo, Symbol, Währung – vier `decimal`-Eigenschaften, gleiche Regel wie im Frontend; Migration `AddLabelPrintDefaultsSizes` mit Spalten `numeric(5,1)`, `defaultValue` = Vorgabewerte.
- A7 – Frontend `LabelPrintDefaults` (`data/blank-labels-api.ts`), `LabelContent` (`shared/components/label-sheet/label-graphic.ts`), `applyDefaults`/`rememberDefaults` in `blank-labels-page.ts` – um `sizes` erweitern.
- Durchreichen – `LabelCard` (Input `sizes`), `label-sheet.html` (`content().sizes`), Vorschau in `blank-labels-page.html` – Input ergänzen.

## Entscheidungen
- E1 Größen als ein Objekt `LabelElementSizes { qrCode, sellerSymbol, numberHeight, currencyHeight }` in `LabelContent` – hält Signaturen klein und passt zu „was auf jedem Etikett gleich ist“.
- E2 Bei Text gilt Schriftgröße = Feldhöhe – `line-height: 1` ist schon gesetzt, die Box ist damit genau so hoch wie die Schrift.
- E3 Preiszeile als Flex-Zeile statt absolut berechneter Linie – Breite des Währungssymbols (1–3 Zeichen, Schrift-Metrik) ist in mm nicht vorab berechenbar.
- E4 Rechter Rand des Währungssymbols = `width − 1,5 k` (gleicher Rand wie Symbol oben rechts) – heute endet „€“ etwa bei `width − 6,4 k`; sichtbare Verschiebung nach rechts um ca. 5 mm bei 105 × 35; Entscheidung des Nutzers im Chat, 2026-11-05 (F2).
- E5 Wertebereich 0,1 bis 100 mm, 1 Nachkommastelle, Pflicht – wie Bogenformat-Maße; ohne Kollisionsprüfung (A8) gibt es keine engere fachliche Obergrenze.
- E6 Persistenzschema ändert sich (4 Spalten) und API-Vertrag (`label-print-defaults` um das Objekt `sizes` erweitert, siehe E10) – folgenreich nach AI-SE-4303; festgehalten in diesem Plan und in `docs/requirements/bazaar-app/api/blank-labels.md` sowie `entities/etiketten-vordruck.md`, kein eigenes ADR (gleiches Muster wie Offset X/Y).
- E7 Größen absolut in mm, nicht × k – Feld zeigt, was gedruckt wird; Entscheidung des Nutzers im Chat, 2026-11-05.
- E8 Logo in der freien Fläche so groß wie möglich, nie gestreckt, zentriert – Fläche ist selten quadratisch, ein verzerrtes Logo ist nicht gewollt; Entscheidung des Nutzers im Chat, 2026-11-05.
- E9 Die 1,5 mm aus A1/A2 sind absolut, übrige Abstände skalieren wie bisher mit k – passt zu absoluten Größen (E7); Entscheidung des Nutzers im Chat, 2026-11-05.
- E10 Größen im Backend als Wertobjekt `LabelElementSizes` (Owned Type, gleiche Spalten) und im JSON-Vertrag als Objekt `sizes` – Review-Finding AI-SE-3103/AI-SE-3305, 2026-11-05. Umgesetzt als EF Complex Type (`ComplexProperty`) statt `OwnsOne`, wie `LabelSheetGeometry` im Bestand; Spalten, Typen und Defaults unverändert, Migration `AddLabelPrintDefaultsSizes` bleibt.

## Implementierungsschritte
1. Backend Domain: `LabelPrintDefaults` um vier Größen mit Konstanten-Vorgaben, `IsValidSize`, erweitertes `Update(...)`.
2. Backend Application/API: Command, Validator, `LabelPrintDefaultsDto` erweitern.
3. Backend Infrastructure: Konfiguration (`HasPrecision(5,1)`), Migration `AddLabelPrintDefaultsSizes` per `dotnet ef migrations add` (Skill `dv-dotnet:dotnet-ef-migrations`).
4. Frontend Layout: `LabelElementSizes`, `DEFAULT_LABEL_ELEMENT_SIZES`, `LabelRect`, `labelLayout(width, height, sizes)` mit Ankern A1–A5, Logo-Fläche A2, Preiszeile als ein Element.
5. Frontend `LabelCard`: Input `sizes`, Logo als Rechteck (bei Fläche 0 nicht rendern), Preiszeile im Template und SCSS als Flex-Zeile; `label-sheet` reicht `content().sizes` durch.
6. Frontend Inhalt: `label-content-rules.ts` (Felder, Vorgaben, Prüfung), `LabelContentForm.fields`, `LabelContent`/`EMPTY_LABEL_CONTENT`, API-Typ `LabelPrintDefaults`.
7. Frontend Seite: `blank-labels-page.ts` – Defaults laden in Texte, Vorschau und Druck mit `sizes`, `rememberDefaults` sendet `sizes`.
8. Doku: API-Doku, Entität `etiketten-vordruck.md`, `docs/components/label-sheet/component.md`, Feature-Profil `bazaar-app-blank-labels`, Glossar (Begriff „Artikel-Nummer“ vs. „Klartext“ prüfen).

## Task-Schnitt
- T1 Backend (Schritte 1–3) – Domain bis Migration – abhängig von: keine
- T2 Frontend Layout + Card (Schritte 4–5) – reine Darstellung – abhängig von: keine
- T3 Frontend Formular + Seite (Schritte 6–7) – abhängig von: T1 (API-Vertrag), T2 (`LabelElementSizes`)
- T4 Doku (Schritt 8) – abhängig von: T1–T3

## Tests
- A1 QR – Unit (`label-layout.spec.ts`) – `x = 1,5`, `y = 1,5`, `size` = Wert; größerer Wert ändert nur `size` (geprüft mit 105 × 35 und 70 × 37).
- A2 Logo-Fläche – Unit (`label-layout.spec.ts`) – Vorgaben auf 105 × 35: `x 24,5`, `y 1,5`, `width 26,5`, `height 20`; größerer QR verschiebt `x` und verkleinert `width`; größere Artikel-Nummer verkleinert `height`; zu großer QR → `width 0`.
- A2 Logo-Darstellung – Component (`label-card.spec.ts`, `label-graphic-view.spec.ts`) – Logo-Box hat Breite/Höhe der Fläche; Fläche 0 → kein Logo im DOM; Bild mit `object-fit: contain`, SVG-Icon ohne `preserveAspectRatio="none"` (nie verzerrt).
- A3 Symbole – Unit (`label-layout.spec.ts`) – oben rechts: `x + size`, `y` konstant; unten links: `x`, `y + size` konstant; beide `size` gleich.
- A4 Artikel-Nummer – Unit (`label-layout.spec.ts`) – `fontSize` = Höhe (unabhängig von k), Mitte `x` und Unterkante unverändert.
- A5 Währungssymbol + Linie – Unit (`label-layout.spec.ts`: Preiszeile-Box, Schrift = Höhe) + Component (`label-card.spec.ts`: Preiszeile enthält Linie und Symbol, Symbol rechtsbündig, Schriftgröße in `cqw`).
- Vorgabewerte – Unit (`label-layout.spec.ts`) – bei 105 × 35 mit `DEFAULT_LABEL_ELEMENT_SIZES`: QR-Größe, Klartext-Schrift und Symbol unten links wie bisherige Erwartungen.
- A6 Felder im Formular – Component (`label-content-form.spec.ts`) – vier Felder in Reihenfolge nach Währungssymbol, Fehlertext je Feld.
- A6 Prüfung – Unit (`label-content-rules.spec.ts`) – leer → Pflichtfeld; 0, 100,1, „1,25“, „abc“ → Bereichsfehler; „0,1“, „100“, „8,5“ gültig; gültiger Lauf enthält `sizes`.
- A7 Speichern/Laden Frontend – Component (`blank-labels-page.spec.ts`) – Defaults füllen die vier Felder; Druck sendet `sizes` an `saveDefaults` (Fake-Store/HttpTestingController wie Bestand).
- A7 Domain – Unit (`LabelPrintDefaultsTests`) – Initial = Vorgaben; `Update` übernimmt Werte; 0 / > 100 / 2 Nachkommastellen → `ArgumentOutOfRangeException`.
- A7 Validator – Unit (`UpdateLabelPrintDefaultsCommandValidatorTests`) – je Feld gültig/ungültig, Fehlermeldung.
- A7 Handler – Unit (`UpdateLabelPrintDefaultsHandlerTests`, `GetLabelPrintDefaultsHandlerTests`) – Werte landen im Repository-Fake; ohne Zeile Vorgaben.
- A7 Persistenz + Vertrag – Integration (`LabelPrintDefaultsRepositoryTests`, `BlankLabelEndpointsTests`) – Round-Trip der vier Werte; GET ohne Zeile liefert Vorgaben; PUT mit ungültiger Größe → 400.
- A8 – kein Test (keine Logik).
- E2E: keins; Druckausgabe wird manuell mit einem Probedruck geprüft (Vorschau und Druck nutzen dasselbe `LabelCard`).

## Betrieb
- Migration – läuft beim Start wie bisherige Migrationen; bestehende Zeile `LabelPrintDefaults` bekommt Vorgabewerte über `defaultValue`.
- Sichtbarkeit, Aufräumen – entfällt (keine neue Infrastruktur, eine Zeile).

## Abhängigkeiten und Übergaben
- keine

## Offene Fragen
- F1 – Gelten die mm-Werte absolut auf dem gedruckten Etikett oder bezogen auf das Grundmaß 105 × 35 mm? – Antwort: absolut in mm (Nutzer, Chat, 2026-11-05) – Status: geklärt
- F2 – Rechter Rand des Währungssymbols? – Antwort: gleicher Abstand wie Symbol oben rechts (Nutzer, Chat, 2026-11-05) – Status: geklärt
- F3 – Logo: eigenes Feld oder freie Fläche; Lage darin; 1,5 mm absolut? – Antwort: freie Fläche, eingepasst und zentriert, 1,5 mm absolut (Nutzer, Chat, 2026-11-05) – Status: geklärt

## Risiken und Annahmen
- Annahme (abgeleitet aus Code): Feldhöhe = Schriftgröße reicht für „Schrift passt sich an“; Ober-/Unterlängen der Schrift „Barlow Condensed“ können minimal aus der Box ragen.
- Risiko: Preiszeile als Flex-Zeile ändert die Lage der Linie leicht (Unterkante der Linie = Grundlinie der Box statt `bottom − 0,3 k`); Probedruck nötig.
- Folge aus E7: Bei Etiketten ≠ 105 × 35 sehen Elemente mit Vorgabewerten anders aus als heute (z. B. 70 × 37: QR 21,5 mm statt 14,3 mm); Nutzer passt die Werte im Formular an.
- Folge aus A1/A2: Auf 105 × 35 rückt der QR-Code 0,5 mm nach unten, das Logo (Vorgaben: 20 × 20 zentriert in 26,5 × 20) etwa 1,75 mm nach rechts gegenüber heute.
- Risiko: Bei sehr großem Währungssymbol wird die Linie 0 breit, bei großem QR-Code oder großer Artikel-Nummer verschwindet das Logo – gewollt (A8).
