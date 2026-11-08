# Fachbereich Voranmeldung (Portal für Verkäufer und Händler)

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [artikel-lebenszyklus](../querschnitt/artikel-lebenszyklus.md) · [nummern](../querschnitt/nummern.md) · [identitaet-rollen](../querschnitt/identitaet-rollen.md) · [datenfluesse](../querschnitt/datenfluesse.md)
Entscheidungen: E5, E5b, E6, E11
Schlagworte: Voranmeldung, Portal, Registrierung, Profil, Meine Artikel, Händler, Privatverkäufer, Artikel erfassen, Import CSV, Countdown, Status-Sicht, Ergebnis, Wiederverwenden, Datenfluss

## Zweck und Abgrenzung

Alles, was Verkäufer und Händler **selbst online** tun: registrieren, Profil pflegen, Artikel erfassen,
Etiketten vorbereiten und Status sowie Ergebnis sehen. Die Verwaltung durch den Admin steht in [verwaltung](verwaltung.md).

## Heute

Die Voranmelde-App mit den Epics unter [`advance-registration/epics/`](../../../requirements/advance-registration/epics/):
Login, Profil, Meine_Artikel, Nummernbloecke, Home_Verkaeufer, Countdown_Widget.

- Registrierung per Selbstregistrierung oder Einladung, automatische Nummernblöcke.
- Artikel per Dialog, „Speichern + kopieren“ oder CSV/XLSX-Import (alles oder nichts).
- Druck einer Liste. Der Verkäufer schreibt die Nummer auf Blanko-Etiketten.
- **Kein Rückkanal:** Der Verkäufer sieht nach dem Export nichts mehr.
- Termine werden nur als Countdown angezeigt, nicht durchgesetzt (V7).

## Ziel

### Was der Verkäufer tut

| Schritt | Beschreibung | Regel |
|---|---|---|
| Registrieren | Selbstregistrierung oder Einladung, Verkäufer-Typ Privat bzw. Händler | [identitaet-rollen](../querschnitt/identitaet-rollen.md) |
| Am Basar teilnehmen | Teilnahme am aktuellen Basar, Nummernblöcke werden vergeben | [nummern](../querschnitt/nummern.md) |
| Artikel erfassen | Dialog, Serienerfassung, Datei-Import (vor allem Händler) | Feld-Katalog in [auswahlfelder](../querschnitt/auswahlfelder-stammdaten.md) |
| Etiketten vorbereiten | Nummer auf Blanko-Etikett schreiben oder selbst drucken (offen) | [druck-etiketten](druck-etiketten.md) |
| Ändern bis zur Annahme | nach Voranmeldeschluss kein Neuanlegen mehr. Bei Preisänderung Hinweis „Etikett anpassen“ (E5). | [lebenszyklus](../querschnitt/artikel-lebenszyklus.md) |
| Status verfolgen | Basar-Tag-Nummer, Zustand, Anzahl verkauft, vorläufiger Verkaufswert (E6) | – |
| Ergebnis sehen | Auszahlung, Beleg | [rueckgabe-abrechnung](rueckgabe-abrechnung.md) |
| Wiederverwenden | Zurückgegebene und nicht abgegebene Artikel in den nächsten Basar übernehmen (E5b) | – |

### Händler

- Händler sind Verkäufer mit Händler-Typ: eigene Konditionen, mehr Nummern, Massen-Import.
- Zu klären ist, ob sie mehr brauchen: Unterkonten, vorab gedruckte Etiketten, eigene Annahme-Zeitfenster.

### Startseite des Verkäufers

- Countdown bis zum nächsten Termin.
- Kennzahlen: Artikel, angenommen, verkauft, vorläufiger Wert.
- Nach dem Basar: Ergebnis und Beleg.

## Datenflüsse: rein / raus

Nummern laut [datenfluesse](../querschnitt/datenfluesse.md). Änderungen an Flüssen werden dort eingetragen, nicht hier.

| Richtung | Flüsse |
|---|---|
| **rein** (nutzt) | D1 Basar/Termine, D2 Stammdaten, D3 Konto, D4 Konditionen-Vorlage (Anzeige); Sichten D10 Annahme, D13 Verkauf, D15 Rückgabe, D17 Ergebnis, D18 eigene Kennzahlen |
| **raus** (liefert) | D3 Selbstregistrierung, D5 Verkäufer, Teilnahme und Nummernblöcke, D6 Artikel im Entwurf |

## Berührungspunkte

- [annahme](annahme.md): ab hier Änderungssperre
- [rueckgabe-abrechnung](rueckgabe-abrechnung.md): ab hier wieder Verkäufer und Ergebnis
- [druck-etiketten](druck-etiketten.md): was der Verkäufer drucken darf
- [datenschutz](../querschnitt/datenschutz.md): Hinweis „Bezeichnung wird öffentlich angezeigt“

## Offene Fragen

1. Dürfen Verkäufer Etiketten mit QR selbst drucken (weniger Handschrift, weniger Fehler bei der Annahme)?
2. Händler: Welche Zusatzfunktionen braucht es?
3. Benachrichtigungen per E-Mail (z. B. „Ihre Artikel sind angenommen“ oder „Abrechnung bereit“)?
4. Teilnahme am Basar: Ist sie automatisch oder muss sich der Verkäufer je Basar anmelden?

## Nächste Planungsschritte

- Verkäufer-Journey als Ablauf skizzieren (von der Registrierung bis zur Wiederverwendung).
- Liste der heutigen Epics mit dem Vermerk „bleibt / ändert sich / entfällt“ (Export entfällt).
