# Fachbereich Statistik und Auswertung

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [datenmodell](../querschnitt/datenmodell.md) · [leitplanken](../leitplanken.md) (L5) · [datenfluesse](../querschnitt/datenfluesse.md)
Entscheidungen: E6, E7
Schlagworte: Statistik, Auswertung, Kennzahl, KPI, Dashboard, Umsatz, Vergleich über Basare, Heatmap, Datenfluss

## Zweck und Abgrenzung

Kennzahlen und Dashboards für Admin, Team und Verkäufer, vor, während und nach dem Basar.

## Heute

- **Haupt-App:** [`Epic_Statistik`](../../../requirements/bazaar-app/epics/Epic_Statistik/epic.md). Brutto, Provision, Gebühren, „davon manuell“. Die Statistik wird bei jedem Aufruf neu berechnet.
- **Voranmeldung:** Dashboards [`Epic_Home_Admin`](../../../requirements/advance-registration/epics/Epic_Home_Admin/epic.md) und [`Epic_Home_Verkaeufer`](../../../requirements/advance-registration/epics/Epic_Home_Verkaeufer/epic.md), Aktivitäts-Heatmap.
- Keine Auswertung über mehrere Basare.

## Ziel

| Für wen | Kennzahlen |
|---|---|
| Admin, vor dem Basar | Registrierungen, Artikel je Kategorie, Händler-Anteil, Aktivität |
| Admin und Team, am Basar-Tag | Angenommen, verkauft, Umsatz, Gebühren, offene Rückgaben, Kassen-Auslastung |
| Admin, nach dem Basar | Ergebnis je Basar, **Vergleich über Basare** (neu durch das Basar-Konzept), Provisionen, Auszahlungen |
| Verkäufer | eigene Kennzahlen (E6) |
| Öffentlich | nur Aggregate (Anzahl je Kategorie und Größe) über den Katalog |

- **Kasse hat Vorrang (L5):** Teure Auswertungen dürfen die Kasse nicht bremsen. Sie werden vorberechnet oder laufen gedrosselt.
- **Grundlage sind die Kassenvorgänge** als eigene Datensätze ([verkauf-kasse](verkauf-kasse.md)).

## Datenflüsse: rein / raus

Nummern laut [datenfluesse](../querschnitt/datenfluesse.md). Änderungen an Flüssen werden dort eingetragen, nicht hier.

| Richtung | Flüsse |
|---|---|
| **rein** (nutzt) | D9, D12, D14, D16 (Ereignisse des Basar-Tags), D5/D6/D7 (Verkäufer und Artikel) |
| **raus** (liefert) | D18 Kennzahlen an Verwaltung (Dashboard), Voranmeldung (eigene Kennzahlen) und Katalog (nur Aggregate) |

## Berührungspunkte

- [verkauf-kasse](verkauf-kasse.md), [rueckgabe-abrechnung](rueckgabe-abrechnung.md): Datenquellen
- [oeffentlicher-katalog](oeffentlicher-katalog.md): öffentliche Aggregate
- [datenschutz](../querschnitt/datenschutz.md): Anonymisierung alter Basare (Kennzahlen bleiben erhalten)

## Offene Fragen

1. Welche Kennzahlen braucht der Vorstand wirklich (Jahresbericht)?
2. Bleibt die Aktivitäts-Heatmap erhalten?

## Nächste Planungsschritte

- Kennzahlen-Liste je Rolle mit dem Vorstand abstimmen.
