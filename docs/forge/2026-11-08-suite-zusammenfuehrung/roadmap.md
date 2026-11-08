# Roadmap – Etappen

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](README.md)
Lesen zusammen mit: [migration](architektur/migration.md) · [risiken](risiken.md) · [leitplanken](leitplanken.md) (L10)
Entscheidungen: E0, E15
Schlagworte: Etappe, Meilenstein, Reihenfolge, Abhängigkeit, Go/No-Go, Größe, Basar-Kalender, Einfrierfenster

**Leitplanke:** Der nächste Basar wird nicht gefährdet. Jede Etappe bringt einen eigenen Nutzen, wird vor dem
Echtbetrieb in einer Generalprobe erprobt und hat eine Rückfallebene. Bis Etappe 4 abgenommen ist, bleiben die
heutigen Apps einsatzbereit.

Größen (ein Entwickler im Nebenamt): **S** = wenige Tage · **M** = einige Wochen · **L** = mehrere Wochen bis Monate.

| Etappe | Inhalt | Nutzen | Größe | Abnahme (Go/No-Go) |
|---|---|---|---|---|
| **0 – Klären** | Entscheidungen E2, E3/E4, E5, E11, E13, E14, E20, E21. **Leitungstest am Veranstaltungsort.** Modulschnitt und Präfix. Datenschutz anstoßen. | freigegebenes Zielbild | S | E2, E5, E20 entschieden. Leitung tauglich bzw. Notbetrieb geplant. |
| **1 – Härten (heutige Apps)** | Doppelverkauf verhindern (V5), Import-Fehler beheben (V2), Umnummerieren ohne Löschen (V1), Datensicherung und feste Versionen (B1), Login-Schutz (V9) | sicherer nächster Basar, unabhängig vom Umbau | S–M | Test mit zwei Kassen auf denselben Artikel. Wiederherstellung geübt. |
| **2 – Suite-Fundament** | Gemeinsame Codebasis mit Modulen, eine Datenbank, gemeinsame Identität, **Basar-Konzept**, API- und UI-Querschnitt, Stack für Cloud **und** Docker, Testumgebung | Grundlage für alles Weitere | L | Suite läuft in Cloud und Docker. Architekturtests grün. |
| **3 – Voranmeldung zieht um** | Die Portal-API bedient das heutige Voranmelde-Frontend (nur Adresse ändern). Verkäuferkonten werden übernommen, Nummern gelten je Basar, Termine werden durchgesetzt. **Übergangsweise** erzeugt die Portal-API noch den Export für die alte Haupt-App. | Verkäufer arbeiten bereits auf der Suite | M–L | Eine Voranmeldephase läuft stabil auf der Suite. |
| **4 – Basar-Betrieb zieht um** | Die Basar-API bedient das heutige Haupt-App-Frontend. **Annahme als Übergabe** (kein Import), zwei Nummernfelder, Artikel-Lebenszyklus, Kassenvorgänge, Rückgabe als Übergabe zurück. Notbetrieb geübt. | **Ziel E0 erreicht:** eine Infrastruktur, kein Import/Export | L | Generalprobe mit Orga-Team und echten Geräten. Danach wird der Datei-Weg abgeschaltet. |
| **5 – Verkäufer-Sicht** | Basar-Tag-Nummer, Zustand, vorläufiger Wert, Ergebnis und Beleg, Änderungssperre sichtbar, Wiederverwenden für den nächsten Basar (Voranmelde-Frontend wird erweitert) | Ziele Z5, Z6 für Verkäufer sichtbar | M | Rückmeldungen von Test-Verkäufern |
| **6 – Öffentlicher Katalog** | eigenes Frontend und eigener Container, Projektion ohne Personenbezug, Cache | Ziel Z3: Interessenten sehen das Angebot live | S–M | Last-Test, Datenschutz-Freigabe, E17 |
| **7 – Optional** | Inselmodus (E1b Stufe 3), gemeinsamer Komponenten-Bestand oder einheitliches Frontend (E19), Händler-Extras, E-Mail-Benachrichtigungen, Bilder im Katalog | Komfort, Ausfallsicherheit | M–L | nach Bedarf |

## Abhängigkeiten

```
0 ──► 1 (sofort, parallel zu allem)
0 ──► 2 ──► 3 ──► 4 ──► 5
                    └──► 6
                          7 (nach Bedarf)
```

Die Etappen 5 und 6 brauchen nur Etappe 4 und können parallel laufen. Teile von 5 (Sperre im Backend)
entstehen bereits in Etappe 4.

## Bezug zum Basar-Kalender (E15)

- Etappe 1 vor dem nächsten Basar.
- Etappe 3 beginnt mit einer Voranmeldephase.
- Etappe 4 geht erst nach einer Generalprobe live, nie mitten in einer Saison.
- Einfrierfenster: X Wochen vor jedem Basar keine Änderungen ([betrieb](architektur/betrieb.md)).

## Offene Fragen

1. Termine der nächsten Basare (Frühjahr, Herbst)?
2. Wie viel Entwicklungszeit steht realistisch zur Verfügung?
