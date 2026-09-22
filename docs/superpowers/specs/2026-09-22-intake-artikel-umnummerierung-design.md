# Artikel-Umnummerierung in der Artikelannahme (Bazaar-App)

Status: entworfen, wartet auf Review
Datum: 2026-09-22
Betroffene App: Haupt-App (`src/bazaar-app/`)

## Ausgangslage

Bei der Artikelannahme kann ein vorregistrierter, noch nicht freigegebener Artikel eines
importierten Verkäufers über die Artikelnummer geladen und korrigiert werden. Aktuell gibt es
zwei Probleme, wenn der Anwender dabei auch die Artikelnummer selbst ändern will:

1. **Formular-Bug:** Ändert der Anwender die Artikelnummer, nachdem ein Artikel geladen wurde,
   werden alle Formularfelder automatisch geleert
   ([intake-article-entry.ts:376-437](../../../src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.ts)) —
   die Logik interpretiert die neue Nummer als "anderer Artikel", verwirft die geladenen Daten.
2. **Daten-Bug (tieferliegend):** Selbst ohne den Formular-Bug würde das heutige Backend beim
   Buchen unter der neuen Nummer einen komplett neuen Artikel anlegen und den alten (unter der
   ursprünglichen Nummer) unangetastet als "registriert, nicht freigegeben" in der Datenbank
   zurücklassen — eine Karteileiche, die die alte Nummer dauerhaft blockiert
   ([IntakeHandler.cs:49-65](../../../src/bazaar-app/backend/Bazaar.Application/Intake/IntakeHandler.cs)).

Ziel: ein eigener, expliziter Weg, um einen vorregistrierten Artikel gezielt unter einer neuen
Nummer zu übernehmen — ohne Karteileiche, ohne dass sich das Formular unerwartet leert.

## Lösung im Überblick

Ein neuer, dritter Button neben Tastatur/Kamera am Artikelnummer-Feld öffnet ein Popup, in dem
gezielt eine bekannte, nicht freigegebene Artikelnummer eines importierten Verkäufers gesucht
und geladen werden kann. Nach dem Laden trägt ein Badge am Button die ursprüngliche Nummer.
Ändert der Anwender danach die Artikelnummer im Hauptfeld und klickt "Übernehmen", wird beim
finalen Buchen der alte Datensatz gelöscht und ein neuer unter der neuen Nummer angelegt.

Das bisherige automatische Prefill beim direkten Eintippen einer bekannten Nummer ins
Hauptfeld entfällt ersatzlos — das Hauptfeld dient danach nur noch der reinen
Vergeben-Prüfung (siehe unten), nicht mehr dem Laden bestehender Artikel.

## Frontend

### 1. `app-input-group` — neuer optionaler dritter Mode-Button

Neuer optionaler Input, z. B.:

```ts
readonly extraModeButton = input<{ icon: string; badge: string | null } | null>(null);
readonly extraModeClicked = output<void>();
```

Nur gesetzt, wenn übergeben — alle anderen Verwender (Checkout, Verkäufer-Suche, …) bleiben
unverändert. Rendert sich als drittes Element in der bestehenden `input-group__mode-row`
(gleiche Reihe wie die Kamera-/Nummernblock-Buttons, 33/33/33 statt 50/50), mit optionalem
kleinen Zahlen-Badge oben drauf, wenn `badge` gesetzt ist.

### 2. Neues Popup `intake-renumber-lookup-popup`

`p-dialog` + `app-input-group` (variant `search`, modes `[keyboard, numpad]`, kein Kamera-Modus,
Feldlabel "Artikelnummer") + Buttons "Laden"/"Abbrechen" — gleiches Grundmuster wie
`session-item-popup.ts`.

Verhalten: reine Prüf-Funktion, keine sonstige Logik.

- "Laden" ruft `ArticlesApi.getByNumber()` auf.
- Treffer nur, wenn Artikel diesem Verkäufer gehört UND Status `registered` (noch nicht
  freigegeben) ist — exakt die heutige `handleArticleFound`-Bedingung.
- Treffer: Popup schließt, emittiert den gefundenen Artikel (inkl. seiner Nummer als
  "Ursprungsnummer") an `intake-article-entry`.
- Kein Treffer / anderer Zustand: Popup bleibt offen, Fehlertext direkt im Popup (kein
  automatisches Zurückspringen).

### 3. `intake-article-entry` — Formularlogik vereinfachen

- `checkArticleNumber()` schrumpft auf die reine Vergeben-Prüfung: Nummer gehört nicht diesem
  Verkäufer ODER ist bereits freigegeben → `numberTakenMessage` setzen, "Übernehmen" bleibt
  disabled. In jedem anderen Fall (frei, oder eigene noch nicht freigegebene Nummer) keine
  Meldung, keine sonstige Aktion.
- Der komplette bisherige Prefill/Clear-Mechanismus entfällt: `prefillActive`,
  `clearPrefilledFields()`, `numberFieldSeq`, der Prefill-Zweig in `handleArticleFound()`
  werden ersatzlos gestrichen.
- Neues Signal `originalNumber = signal<number | null>(null)`.
- Popup-Erfolg (`onRenumberArticleFound`-artiger Handler): schreibt alle Felder (Bezeichnung,
  Kategorie, Marke, Preis, Größe, Farbe, Beschreibung) UND die Artikelnummer selbst ins
  Hauptfeld, setzt `originalNumber` auf die geladene Nummer. Danach wird das Artikelnummer-Feld
  fokussiert und der komplette Inhalt selektiert (direktes Überschreiben durch Tippen/Scannen
  möglich, ohne manuell zu markieren).
- Der Vergeben-Check muss für diesen Fall nichts Besonderes tun: die geladene Nummer gehört ja
  genau diesem Verkäufer und ist nicht freigegeben — fällt beim automatisch ausgelösten Check
  ohnehin durch den "kein Fehler"-Zweig, kein Sonderfall nötig.
- Badge am neuen Button = `originalNumber()` (oder `null`, wenn nicht gesetzt).
- Klick auf X im Artikelnummer-Hauptfeld (`onClear`) resettet zusätzlich zum bereits
  bestehenden Feld-Reset (den `app-input-group` selbst über `onClear()` schon inkl.
  Fokus-Rücksprung erledigt) alle übrigen Formularfelder UND `originalNumber` (Badge
  verschwindet).
- `onSubmitEntry()`: `SessionArticle` bekommt neues optionales Feld `originalNumberToDelete`,
  befüllt aus `originalNumber()`. Nach dem Hinzufügen zur Session-Liste: `resetForm()` inkl.
  `originalNumber`.

### 4. Datenmodell `SessionArticle` / Weiterreichen

```ts
export interface SessionArticle {
  // … bestehende Felder
  originalNumberToDelete?: number;
}
```

Muss durch `intake-session-list` bis zum finalen `POST /api/intake`-Aufruf durchgereicht und
pro Zeile auf `IntakeArticleLine.deleteArticleNumber` gemappt werden.

## Backend

### `IntakeCommand.cs`

```csharp
public sealed class IntakeArticleLine
{
    // … bestehende Felder
    public int? DeleteArticleNumber { get; set; }
}
```

### `IntakeHandler.cs`

Neuer Vorverarbeitungsschritt innerhalb der bestehenden Transaktion, VOR der heutigen
Create/Update/Konflikt-Logik: für jede Zeile mit gesetztem `DeleteArticleNumber` wird der
Alt-Artikel geladen (`articleRepository.GetByNumber(line.DeleteArticleNumber)`). Gehört er
diesem Verkäufer und ist `ReleasedAt` noch `null`, wird er per `articleRepository.Remove(...)`
gelöscht. Passt der Zustand nicht mehr (zwischenzeitlich freigegeben, anderem Verkäufer
zugeordnet, oder gar nicht mehr vorhanden — Race zwischen Übernehmen und Buchen), wird das
Löschen **still übersprungen**, kein Abbruch der gesamten Buchung.

Danach läuft die bestehende Create/Update/Konflikt-Logik unverändert mit `line.Number` als
Zielnummer weiter. Da der Alt-Artikel zu diesem Zeitpunkt bereits gelöscht ist, wird die
Zielnummer stets über den `toCreate`-Zweig als neuer Artikel angelegt — auch dann, wenn
Zielnummer und Ursprungsnummer identisch sind (bewusste Entscheidung: einheitliches Verhalten,
kein Sonderfall "Nummer unverändert").

Kein Refund/Sonderbehandlung bei der Gebühr nötig: `FeeAmount`-Prüfung basiert weiterhin auf
`command.Articles.Count` (Anzahl neu zu bebuchender Zeilen), unabhängig vom Löschen des
Alt-Artikels.

## Nicht im Scope

- Keine Änderung an der bestehenden Konflikt-Behandlung beim Buchen (`article.number_taken`,
  409) — läuft unverändert weiter, greift auch für Zeilen mit `DeleteArticleNumber`, falls die
  Zielnummer zwischenzeitlich anderweitig vergeben wurde.
- Keine Möglichkeit, eine bereits im Sitzungskorb liegende Zeile nachträglich per
  `session-item-popup` umzunummerieren — Umnummerierung läuft ausschließlich über das neue
  Popup vor "Übernehmen".
