# Fachbereich Verwaltung (Admin)

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [identitaet-rollen](../querschnitt/identitaet-rollen.md) · [auswahlfelder-stammdaten](../querschnitt/auswahlfelder-stammdaten.md) · [datenmodell](../querschnitt/datenmodell.md) · [datenfluesse](../querschnitt/datenfluesse.md)
Entscheidungen: E4, E7, E9, E11, E22, E24
Schlagworte: Verwaltung, Admin, Basar anlegen, Termine, Einstellungen, Benutzer, Team-Konten, Stammdaten-Pflege, Alle Artikel, Dashboard, Datenfluss

## Zweck und Abgrenzung

Alles, was die Organisatoren **einrichten und pflegen**: Basare, Verkäufer, Benutzer des Teams,
Stammdaten und Einstellungen. Operative Abläufe am Basar-Tag stehen in den übrigen Fachbereichen.

## Heute

Die Verwaltung ist auf zwei Apps verteilt.

**Voranmeldung** (Epics Verkaeufer, Verkaeufer_Typen, Marken, Kategorien, Nummernbloecke, Einstellungen, Home_Admin, Alle_Artikel, Export):
- Verkäufer einladen, Blöcke verwalten, Termine und Nummernparameter einstellen.

**Haupt-App** (Epics Verkaeufer, Verkaeufer_Typen, Marken, Kategorien, Einstellungen):
- Benutzer, Drucktexte, Scanner, Import, Standard-Typ.

Stammdaten werden doppelt gepflegt.

## Ziel

| Bereich | Inhalt |
|---|---|
| **Basar** (neu) | Basar anlegen, Termine (Voranmeldeschluss, Abgabe, Verkauf, Rückgabe, mehrtägig), Nummernbereiche (E4), Gebühren-Vorgaben, Status „aktiver Basar“ |
| **Verkäufer** | Liste über alle Basare. Einladen, Typ zuordnen, Konditionen je Teilnahme überschreiben (E9), Nummernblöcke, Laufkunden zum Konto einladen (E8) |
| **Team und Benutzer** | Konten für das Basar-Team anlegen, Rollen vergeben ([identitaet-rollen](../querschnitt/identitaet-rollen.md)) |
| **Stammdaten** | Marken, Kategorien prüfen und zusammenführen, Verkäufer-Typen ([auswahlfelder](../querschnitt/auswahlfelder-stammdaten.md)) |
| **Einstellungen** | suite-weit (Branding, Texte) bzw. je Basar (Drucktexte, Scanner, Standard-Typ) |
| **Alle Artikel** | Übersicht über alle Artikel eines Basars mit Zustand, Korrekturen, Ausblenden im Katalog |
| **Dashboard** | Kennzahlen vor und während des Basars ([statistik-auswertung](statistik-auswertung.md)) |
| **Betrieb** | Statusanzeige am Basar-Tag ([betrieb](../architektur/betrieb.md)) |

**Entfällt:** JSON-Export und JSON-Import (E0).

## Datenflüsse: rein / raus

Nummern laut [datenfluesse](../querschnitt/datenfluesse.md). Änderungen an Flüssen werden dort eingetragen, nicht hier.

| Richtung | Flüsse |
|---|---|
| **rein** (nutzt) | D5 Verkäufer, D6 Artikel (Übersicht), D7 Laufkunden, D18 Kennzahlen (Dashboard) |
| **raus** (liefert) | **D1 Basar und Termine**, **D2 Stammdaten**, D3 Konten, D4 Konditionen-Vorlage |

## Berührungspunkte

- [identitaet-rollen](../querschnitt/identitaet-rollen.md): Rechte-Matrix
- [nummern](../querschnitt/nummern.md): Bereiche je Basar
- [auswahlfelder-stammdaten](../querschnitt/auswahlfelder-stammdaten.md): Pflegeregeln
- [datenschutz](../querschnitt/datenschutz.md): Löschfunktionen, Ankündigung

## Offene Fragen

1. Welche Einstellungen sind suite-weit, welche je Basar?
2. Kann es zwei aktive Basare gleichzeitig geben (Frühjahr in Vorbereitung, Herbst läuft noch in der Abrechnung)?
3. Läuft die Verwaltung im Basar-Frontend, im Voranmelde-Frontend oder in beiden? Heute ist sie verteilt (E19, E22).

## Nächste Planungsschritte

- Liste aller heutigen Einstellungen beider Apps mit Zielort (suite-weit / je Basar / entfällt).
