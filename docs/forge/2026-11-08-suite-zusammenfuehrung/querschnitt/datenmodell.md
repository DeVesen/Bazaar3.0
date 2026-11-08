# Datenmodell (Kern) und Datenhoheit

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [leitplanken](../leitplanken.md) (L1, L3, L9) · [artikel-lebenszyklus](artikel-lebenszyklus.md) · [nummern](nummern.md)
Entscheidungen: E0, E7, E9

## Zweck und Abgrenzung

Hier stehen die **fachlichen Kern-Entitäten** der Suite, ihre Beziehungen und welches Modul sie verantwortet.
Spalten und Typen gehören in die spätere Umsetzung, nicht hierher.

## Heute

- **Zwei Datenbanken.** Überlappende Entitäten (Verkäufer, Artikel, Marken, Kategorien, Typen) existieren doppelt und mit abweichenden Regeln:
  - E-Mail Pflicht und eindeutig (BAR) bzw. optional (Haupt-App)
  - `original` mit zwei Bedeutungen
  - Konditionen live bzw. als Kopie
- Kein Basar-Konzept, Einstellungen sind global (V4). Quellen: `docs/requirements/entities.md`, `docs/requirements/*/entities/`.

## Ziel

### Kern-Entitäten

| Entität | Bedeutung | Verantwortliches Modul |
|---|---|---|
| **Basar** | Veranstaltung: Termine (Voranmeldeschluss, Abgabe, Verkauf, Rückgabe), Nummernbereiche, Einstellungen | Basar |
| **Konto** | Anmeldedaten und Rollen einer Person | Identität |
| **Verkäufer** | Person oder Firma, die verkauft; Kontakt, Verkäufer-Typ; optional mit Konto (Laufkunde ohne) | Verkäufer |
| **Verkäufer-Teilnahme** | Verkäufer *in einem Basar*: Nummernblöcke, eingefrorene Konditionen (E9), gezahlte Gebühr, Abrechnung | Basar / Abrechnung |
| **Artikel** | **ein** Datensatz: Angaben, Preis, Voranmelde- und Basar-Tag-Nummer, Zustand je Basar | Artikel |
| **Nummernblock** | Bereich von Voranmelde-Nummern je Teilnahme | Voranmeldung |
| **Kassenvorgang** | ein Bezahlvorgang mit Positionen, Kassierer, Zeitpunkt (gibt es heute nicht, wird für Storno und Nachvollziehbarkeit gebraucht) | Kasse |
| **Abrechnung** | Abschluss einer Teilnahme: Summe, Provision, Auszahlung, Beleg | Abrechnung |
| **Marke, Kategorie, Verkäufer-Typ** | Stammdaten, suite-weit | Stammdaten |
| **Etikettenformat, Drucktexte, Bilder** | Druckeinstellungen | Druck |
| **Katalog-Projektion** | bereinigte Sicht ohne Personenbezug | Katalog |

### Datenhoheit (wer schreibt)

Die Verantwortung für den **Artikel** wechselt nach dem [Lebenszyklus](artikel-lebenszyklus.md). Alle anderen
Entitäten haben genau **ein** schreibendes Modul. Andere Module lesen nur über dessen Schnittstelle.

### Grundregeln

- Fremdbezüge über Kennungen, in der Datenbank abgesichert (heute fehlen Fremdschlüssel).
- Eindeutigkeiten in der Datenbank, nicht nur im Code: Nummern je Basar, Namen von Stammdaten ohne Rücksicht auf Groß- und Kleinschreibung, E-Mail nur für Konten.
- Absicherung gegen gleichzeitige Änderungen bei Artikel und Kassenvorgang (V5).
- Einheitliche Geldbeträge (zwei Nachkommastellen) und Zeitstempel (mit Zeitzone).
- Kennungen: ein Format für die ganze Suite (heute 8 Zeichen alphanumerisch, siehe [api-konventionen](api-konventionen.md)).
- Löschen nur nach [Löschkonzept](datenschutz.md). Fachliche Zustände ersetzen das heutige Löschen (V1–V3).

## Berührungspunkte

- [artikel-lebenszyklus](artikel-lebenszyklus.md), [nummern](nummern.md): Abbildung von Zustand und Nummern
- [identitaet-rollen](identitaet-rollen.md): Konto ↔ Verkäufer
- [auswahlfelder-stammdaten](auswahlfelder-stammdaten.md): Stammdaten-Regeln
- [migration](../architektur/migration.md): Bereinigung und Übernahme

## Offene Fragen

1. Gelten Verkäufer-Typen und Stammdaten suite-weit oder je Basar?
2. Gelten Drucktexte und Einstellungen je Basar oder global?
3. Wiederverwendung von Artikeln über Basare: siehe [lebenszyklus](artikel-lebenszyklus.md), Frage 1.

## Nächste Planungsschritte

- Entitäten-Übersicht mit Beziehungen (Diagramm) erstellen.
- Zuordnung zu Modulen mit dem Modulschnitt abgleichen ([zielbild](../architektur/zielbild.md)).
