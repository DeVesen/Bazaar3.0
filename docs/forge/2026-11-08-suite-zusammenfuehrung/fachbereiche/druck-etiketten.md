# Fachbereich Druck und Etiketten

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [nummern](../querschnitt/nummern.md) · [annahme](annahme.md)
Entscheidungen: E3, E4

## Zweck und Abgrenzung

Alle gedruckten Dinge: Etiketten (Blanko-Vordruck, gegebenenfalls Selbstdruck), Abgabe-Beleg, vorläufiger Beleg und
Abrechnungsbeleg, Artikel-Aushang.

## Heute

- **Haupt-App:** [`Epic_Druckfunktionen`](../../../requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md), Etiketten-Vordruck ([`forge/2026-11-02-etiketten-vordruck`](../../2026-11-02-etiketten-vordruck/spec.md), QR nur mit der Zahl), Artikel-Aushang ohne Nummer ([`forge/2026-10-31-artikel-aushang-druck`](../../2026-10-31-artikel-aushang-druck/spec.md)), Bogenformate und Bilder-Bibliothek.
- **Voranmeldung:** Druck der eigenen Artikelliste.
- Gedruckt wird immer über den Browser, ohne Druck-Server.

## Ziel

| Druckstück | Wer | Wann | Inhalt (Grundsatz) |
|---|---|---|---|
| Blanko-Etiketten | Admin | vor dem Basar | Nummern aus dem **Ausnahme-Bereich** (E3/E4), geprüft gegen vergebene Nummern |
| Selbstdruck-Etiketten (offen) | Verkäufer | vor dem Basar | Voranmelde-Nummer, QR, Preis. Reduziert Handschrift. |
| Artikelliste | Verkäufer | vor dem Basar | eigene Artikel mit Nummern |
| Abgabe-Beleg | Team | Annahme | angenommene Artikel, Gebühr, QR zur Legitimation bei der Rückgabe |
| Vorläufiger Beleg | Team | Rückgabe | Verkauft / einzusammeln |
| Abrechnungsbeleg | Team | Abrechnung | Auszahlung. Auch online beim Verkäufer. |
| Artikel-Aushang | Admin | Verkauf | wie der öffentliche Katalog, für Besucher ohne Internet |

- Etiketten-Layouts und Bogenformate sind Admin-Einstellungen, ab jetzt in einem Bestand für alle Basare.
- **QR-Inhalt:** Heute ist es nur die Zahl. Zu klären ist, ob er künftig eine Basar-Kennung enthält, als Schutz gegen Vorjahres-Etiketten ([nummern](../querschnitt/nummern.md)).

## Berührungspunkte

- [nummern](../querschnitt/nummern.md): Bereiche, Verwechslungsschutz
- [annahme](annahme.md), [rueckgabe-abrechnung](rueckgabe-abrechnung.md): Belege
- [oeffentlicher-katalog](oeffentlicher-katalog.md): Aushang = Offline-Gegenstück

## Offene Fragen

1. Selbstdruck der Etiketten durch Verkäufer: ja oder nein? Wenn ja, mit welchem Bogenformat?
2. Braucht der Annahmetisch einen Einzel-Etikettendrucker für Ausnahmen?

## Nächste Planungsschritte

- Liste aller Druckstücke beider Apps mit dem Vermerk „bleibt / ändert sich / neu“.
