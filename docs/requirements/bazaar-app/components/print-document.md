---
status: reviewed
reviewed-date: 2026-10-14
updated: 2026-10-31
---

# Component: print-document

**Bibliothek:** keine PrimeNG-Komponente — reines HTML/CSS-Dokument; QR-Code über [`qr-code`](../../../components/qr-code/component.md)
**Verwendung:** Nur Haupt-App — Abgabe-Beleg und Verkäufer-Übersicht ([Epic_Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md)); Spec: [`docs/forge/2026-10-14-beleg-druck-vorlagen/spec.md`](../../../forge/2026-10-14-beleg-druck-vorlagen/spec.md). Der Artikel-Aushang nutzt Stile, Seitenaufteilung und Markdown dieser Komponente, ist aber eine eigene Komponente (siehe unten); Spec: [`docs/forge/2026-10-31-artikel-aushang-druck/spec.md`](../../../forge/2026-10-31-artikel-aushang-druck/spec.md)

## Überblick
Ein gemeinsames A4-Dokument (`app-print-document`) für zwei Vorlagen. Es rendert ein fertiges Modell (`PrintDocumentModel`) und kennt weder HTTP noch Fachregeln. Der `PrintService` lädt die Daten, baut das Modell (`buildAbgabeBelegModel` bzw. `buildVerkaeuferUebersichtModel`), hängt das Dokument als einziges sichtbares Element in die Seite und öffnet den Druckdialog des Geräts.

## Auslöser und Artikelmenge
| Auslöser | Vorlage | Artikel im Dokument |
|---|---|---|
| „Speichern" in der Artikelannahme | Abgabe-Beleg | die gerade gebuchten Artikel (alle „Registriert") |
| Freigabe | Abgabe-Beleg | die freigegebenen Artikel („Im Verkauf") |
| Druckbutton der Verkäufer-Kachel | Abgabe-Beleg | alle Artikel des Verkäufers außer „Registriert" |
| Drucken in der Abrechnung | Verkäufer-Übersicht | alle Artikel außer „Registriert" |
| „Drucken" auf der Artikel-Seite | Artikel-Aushang (`app-article-aushang`) | alle Artikel des Filterergebnisses |

Der Druckbutton ist für alle Rollen sichtbar, die die Verkäufer-Kachel sehen, und bleibt auch ohne Artikel aktiv. Lässt sich der Beleg nicht laden, erscheint ein Toast „Beleg konnte nicht geladen werden" und keine Vorschau.

## Layout
Seite 1 von oben nach unten: Kopfzeile (Freitext 1 links, Freitext 2 zentriert, Datum/Uhrzeit des Drucks rechts) · Verkäufer-Block (Name, Straße, PLZ Ort; rechts QR-Code der Verkäufer-ID mit ID als Text) · Kennzahl-Kacheln Zeile A · Zeile B (13,3 mm, Zeile A 13,4 mm) · Freitext 3 (entfällt ohne Text) · Artikelliste bis zur Fußzeile · Fußzeile (Freitext 4 links, Freitext 5 zentriert, „Seite x von y" rechts). Ab Seite 2: Kopfzeile, eine Zeile mit Verkäufer-ID und Anschrift, Fortsetzung der Artikelliste mit wiederholtem Tabellenkopf, Fußzeile.

| Vorlage | Zeile A | Zeile B |
|---|---|---|
| Abgabe-Beleg | Verkäufer-ID · Anzahl Artikel | Gebühr Y € / Artikel (= Anzahl × Y, berechnet) · Provision (Satz X %) |
| Verkäufer-Übersicht | Verkäufer-ID · Anzahl abgegebener · offener · verkaufter Artikel · Einnahmen | Gebühr · Provision X % (= Umsatz × X / 100) · Verdienst (= Umsatz − Provision) |

Artikelliste: Tabelle mit # (Artikelnummer), Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis; gruppiert nach „Registriert" (nur bei „Speichern"), „Im Verkauf", „Verkauft", „Zurückgegeben"; leere Gruppen entfallen; je Gruppe Artikelnummer aufsteigend.

## Artikel-Aushang
Eigene Komponente `app-article-aushang` (`shared/components/print-document/article-aushang.{ts,html}`), Modell-Builder `buildArticleAushangModel` (`article-aushang.model.ts`), geladen über `PrintService.printArticleAushang(filters)` (`GET /api/articles/print` + `GET /api/settings/print-texts`). Der Druckbutton der Artikel-Seite ist für beide Rollen sichtbar und bei leerem Filterergebnis deaktiviert; lässt sich nichts laden, erscheint der Toast „Artikel konnten nicht geladen werden" und keine Vorschau.

**Layout:** Kopfzeile · Artikelliste · Fußzeile — auf jeder Seite gleich, kein Verkäufer-Block, keine Kacheln, kein Freitext über der Liste. Kopf und Fuß sind in drei gleiche Drittel geteilt: Kopf = Freitext 1 links (linksbündig), Freitext 2 Mitte (zentriert), Datum/Uhrzeit rechts (rechtsbündig); Fuß = Freitext 3 links, Freitext 4 Mitte, „Seite x von y" rechts.

**Artikelliste:** Tabelle mit Bezeichnung, Marke, Farbe, Größe, Preis (rechtsbündig), ohne Artikelnummer. Gruppiert nach Kategorie (alphabetisch, Gruppenzeile ohne Anzahl); je Kategorie sortiert nach Marke → Größe → Farbe → Bezeichnung (deutsche Sortierung, Zahlen als Zahlen, Groß-/Kleinschreibung egal, leere Werte am Ende). Eine Gruppenüberschrift steht nie allein am Seitenende; der Tabellenkopf wiederholt sich auf jeder Seite. Läuft eine Kategorie auf die nächste Seite, setzt sie sich dort ohne erneute Überschrift fort.

## Seitenaufteilung
Feste Maße (`print-document.layout.ts`, A4 hochkant), alle Rahmen 2 px in Hellgrau #e6e6e6 (wie die Gruppenzeilen), Zeilen mit fester Höhe (zu lange Texte werden abgeschnitten), Kopf- und Fußzeile mit fester Höhe (die Texte der Fußzeile stehen am unteren Rand). Nur die Höhe von Freitext 3 wird vor dem Druck gemessen. „Seite x von y" ist Text im Dokument, nicht CSS-Seitenzähler — damit es auch unter iOS/Safari funktioniert.

## Freitexte
Je Beleg-Vorlage fünf Freitexte, für den Artikel-Aushang vier (Kopfzeile links/Mitte, Fußzeile links/Mitte) — zusammen vierzehn, gepflegt von einem Admin unter Einstellungen → „Freitexte der Belege" (`PrintTextsForm`, `GET/PUT /api/settings/print-texts`, je Text höchstens 5000 Zeichen). Markdown mit Überschriften, Fett, Kursiv, Absätzen, Listen und Tabellen; Links, Bilder und HTML werden nicht dargestellt. Änderungen gelten ab dem nächsten Druck.

## Akzeptanzkriterien
Siehe die ACs der [Spec](../../../forge/2026-10-14-beleg-druck-vorlagen/spec.md) (AC-01 bis AC-34).
