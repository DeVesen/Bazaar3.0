# Auswahlliste nach Artikelnummer sortiert

Status: bestätigt am 2026-10-18
Art: verankert
Basis: 1ec84151

## Was, wie, wo, warum
In der Haupt-App zeigt der Scan-Dialog bei „Artikel freigeben“ (an der Verkäufer-Kachel) und bei „Zurückgeben“ (auf der Abrechnungsseite) eine Auswahlliste der noch nicht erfassten Artikel des Verkäufers. Heute ist ihre Reihenfolge zufällig, weil der Server die Artikel eines Verkäufers ohne Sortierung liefert. · Git
Künftig liefert der Server die Artikel eines Verkäufers aufsteigend nach Artikelnummer, und die Auswahlliste zeigt sie in dieser Reihenfolge. So findet der Anwender einen Artikel schneller per Antippen. · Aussage
Dieselbe Server-Liste speist auch die Artikeltabelle der Detail-Ansicht des Verkäufers. Diese wird dadurch ebenfalls nach Artikelnummer sortiert. · Aussage

## Theoretisches Verhalten nach Umsetzung
Öffnet der Anwender „Artikel freigeben“ oder „Zurückgeben“, stehen die Artikel der Auswahlliste von oben nach unten aufsteigend nach Artikelnummer. · Aussage
Tippt der Anwender eine Nummer ein, zeigt die gefilterte Auswahlliste die verbleibenden Treffer weiter aufsteigend. Ein erfasster Artikel fällt heraus, die Reihenfolge der übrigen bleibt. · Git
Die Detail-Ansicht des Verkäufers zeigt ihre Artikeltabelle aufsteigend nach Artikelnummer. · Aussage
Die Artikeltabelle der Abrechnung sowie Abgabe-Beleg und Verkäufer-Übersicht im Druck zeigen ihre Artikel unverändert wie bisher. · Aussage

## Soll-Vorgaben
- Der Server liefert die Artikel eines Verkäufers immer aufsteigend nach Artikelnummer. Jede Ansicht, die diese Liste ohne eigene Sortierung nutzt, übernimmt die Reihenfolge. · Aussage
- Die Sortierung ist numerisch (2 vor 10). Die Artikelnummer ist je Artikel eindeutig, Gleichstände gibt es nicht. · Git
- Artikeltabelle der Abrechnung und Druck (Abgabe-Beleg, Verkäufer-Übersicht) zeigen keine sichtbare Änderung. · Aussage
- Die Auswahlliste ist der kanonische Begriff für die Liste der noch nicht erfassten Artikel im Scan-Dialog. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben ein Verkäufer mit den registrierten Artikeln 12, 3 und 101, angelegt in dieser Reihenfolge, wenn der Anwender an dessen Verkäufer-Kachel „Artikel freigeben“ öffnet, dann zeigt die Auswahlliste von oben nach unten 3, 12, 101. · Aussage
- **AC-02** Gegeben ein nicht abgerechneter Verkäufer mit den Artikeln 12, 3 und 101 im Status „im Verkauf“, angelegt in dieser Reihenfolge, wenn der Anwender auf der Abrechnungsseite „Zurückgeben“ öffnet, dann zeigt die Auswahlliste von oben nach unten 3, 12, 101. · Aussage
- **AC-03** Gegeben ein Verkäufer mit den registrierten Artikeln 10, 2 und 1, wenn der Anwender „Artikel freigeben“ öffnet, dann zeigt die Auswahlliste 1, 2, 10 und nicht 1, 10, 2. · Aussage
- **AC-04** Gegeben die Auswahlliste bei „Artikel freigeben“ mit 3, 13, 31 und 45, wenn der Anwender „3“ eintippt, dann zeigt die Auswahlliste 3, 13, 31 in dieser Reihenfolge. · Aussage
- **AC-05** Gegeben die Auswahlliste bei „Zurückgeben“ mit 3, 12 und 101, wenn der Anwender Artikel 12 erfasst, dann zeigt die Auswahlliste 3, 101 in dieser Reihenfolge. · Aussage
- **AC-06** Gegeben ein Verkäufer ohne registrierte Artikel, wenn der Anwender „Artikel freigeben“ öffnet, dann erscheint keine Auswahlliste, sondern wie bisher der Text „Alle Artikel freigegeben.“. · Git
- **AC-07** Gegeben ein Verkäufer mit den Artikeln 12, 3 und 101 in beliebigem Status, angelegt in dieser Reihenfolge, wenn die Artikel dieses Verkäufers beim Server abgefragt werden, dann enthält die Antwort sie in der Reihenfolge 3, 12, 101. · Aussage
- **AC-08** Gegeben ein Verkäufer mit den Artikeln 12, 3 und 101 in beliebigem Status, wenn der Anwender durch Klick auf die Verkäufer-Kachel die Detail-Ansicht öffnet, dann zeigt deren Artikeltabelle von oben nach unten 3, 12, 101. · Aussage
- **AC-09** Gegeben ein Verkäufer mit den Artikeln 12, 3 und 101, wenn der Anwender diesen Verkäufer auf der Abrechnungsseite auswählt, dann zeigt die Artikeltabelle wie bisher 3, 12, 101. · Aussage
- **AC-10** Gegeben ein Verkäufer mit den Artikeln 12 und 3 im Status „im Verkauf“ sowie 7 und 1 im Status „verkauft“, wenn der Anwender die Verkäufer-Übersicht druckt, dann stehen die Status-Gruppen in der bisherigen Reihenfolge, innerhalb der Gruppen 3, 12 bzw. 1, 7. · Aussage

## Entscheidungen
- **W · Begriff Auswahlliste** · Aussage — Kanonisch „Auswahlliste“ für die Liste der noch nicht erfassten Artikel im Scan-Dialog. Nicht verwenden: „Artikelliste“ (im Druck belegt), „Liste offener Artikel“ („offen“ ist Status-Begriff der Abrechnung).
- **W · Sortierort** · Aussage — Der Server liefert die Artikel eines Verkäufers aufsteigend nach Artikelnummer, die Auswahlliste übernimmt die Reihenfolge ohne zweite eigene Sortierung.
- **W · Detail-Ansicht des Verkäufers** · Aussage — Die Sortierung durch den Server gilt dort gewollt mit, abgesichert durch ein eigenes AC.
- **W · Abrechnung und Druck** · Aussage — Sie sortieren schon selbst nach Artikelnummer und bleiben unverändert, nur als Soll-Vorgabe „keine sichtbare Änderung“.
