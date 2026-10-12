# Filterleiste der Artikelseite als gerahmte Leiste

Status: bestätigt am 2026-10-12
Art: verankert
Basis: e75281c

## Was, wie, wo, warum
Die Filterleiste der Seite „Artikel" in der Haupt-App besteht heute aus zwei losen Zeilen: oben die Freitextsuche über die volle Breite, darunter drei gleich breite Auswahlfelder für Marke, Kategorie und Status. Sie wird zu einer einzigen, gerahmten Leiste: links beginnt die Freitextsuche und füllt den gesamten Platz bis zu den Auswahlfeldern, rechts stehen die drei Auswahlfelder nebeneinander. Links gibt es keinen weiteren Bereich, weil die Seite keine Anlegen-Funktion hat. Grundlage ist das Muster der Filterleiste der Verkäuferseite; abweichend gilt hier für die Auswahlfelder eine Mindestbreite von 200 px. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Anwender sieht oberhalb der Artikel-Tabelle eine gerahmte Leiste. Das Suchfeld beginnt am linken Rand und füllt den gesamten Platz bis zu den Auswahlfeldern. Rechts stehen nebeneinander Marke, Kategorie und Status. Alle Felder funktionieren wie bisher. Es erscheinen keine Filter-Chips. · Aussage

## Soll-Vorgaben
- Umgesetzt wird nur die Seite „Artikel" der Haupt-App. Die Voranmelde-App und andere Listenseiten bleiben unverändert. · Aussage
- Die Mindestbreite von 200 px gilt nur für die Auswahlfelder dieser Filterleiste; das Muster der Verkäufer-Spec (150 px) bleibt unberührt. · Aussage
- Zur Leiste gehören nur das Suchfeld und die drei Auswahlfelder. Ein Anlegen-Button und weitere Schaltflächen gehören nicht dazu. · Aussage
- Die Eingabefelder erhalten keine sichtbaren Labels. · Aussage
- Aussehen und Verhalten der einzelnen Felder (Platzhalter, Löschen-Kreuz, Wirkung auf die Tabelle) bleiben unverändert. · Aussage
- Rahmen und Abstände der Leiste folgen dem Muster der Verkäuferseite; das Umbruchverhalten ist in den Akzeptanzkriterien beschrieben. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben die Seite „Artikel" der Haupt-App wird geöffnet, wenn sie angezeigt wird, dann stehen Suchfeld und die drei Auswahlfelder in einer einzigen gerahmten Leiste oberhalb der Artikel-Tabelle, und die Auswahlfelder stehen nicht mehr in einer eigenen Zeile unter dem Suchfeld. · Aussage
- **AC-02** Gegeben die Leiste ist sichtbar, wenn der Anwender sie betrachtet, dann steht links kein Button und kein anderes Element vor dem Suchfeld. · Aussage
- **AC-03** Gegeben die Leiste ist sichtbar, wenn der Anwender sie betrachtet, dann füllt das Suchfeld den gesamten Platz zwischen dem linken Rand der Leiste und den Auswahlfeldern und zeigt den Platzhalter „Suche nach Nr., Bezeichnung …". · Aussage
- **AC-04** Gegeben die Leiste ist sichtbar, wenn der Anwender sie betrachtet, dann stehen am rechten Rand drei Auswahlfelder, von links nach rechts Marke, Kategorie, Status. · Aussage
- **AC-05** Gegeben die Leiste ist sichtbar, wenn der Anwender die Auswahlfelder betrachtet, dann ist jedes mindestens 200 px breit und wird bei längerem gewähltem Text breiter, sodass der Text nicht gekürzt wird. · Aussage
- **AC-06** Gegeben die Leiste ist sichtbar, wenn der Anwender die vier Eingabefelder betrachtet, dann hat keines ein sichtbares Label, und die Auswahlfelder tragen für Screenreader die Namen „Marke", „Kategorie" und „Status". · Aussage
- **AC-07** Gegeben in einem Auswahlfeld ist kein Wert gewählt, wenn der Anwender die Leiste betrachtet, dann zeigt dieses Feld den Platzhalter „Alle". · Aussage
- **AC-08** Gegeben in einem Auswahlfeld ist ein Wert gewählt, wenn der Anwender das Löschen-Kreuz dieses Feldes betätigt, dann ist der Wert entfernt, das Feld zeigt „Alle", und die Tabelle zeigt wieder die Artikel ohne diese Einschränkung. · Aussage
- **AC-09** Gegeben die Leiste ist sichtbar, wenn der Anwender Suchbegriff, Marke, Kategorie oder Status ändert, dann wirken sie wie vor dieser Änderung (Suche verzögert nach kurzer Tipppause, Marke, Kategorie und Status sofort). · Aussage
- **AC-10** Gegeben ein Filter ist aktiv, wenn die Seite angezeigt wird, dann erscheinen keine Filter-Chips. · Aussage
- **AC-11** Gegeben das Fenster ist so schmal, dass die Elemente nicht nebeneinander passen, wenn die Seite angezeigt wird, dann bricht die Leiste auf weitere Zeilen um, es entsteht keine waagerechte Bildlaufleiste und alle Elemente bleiben erreichbar. · Aussage

## Entscheidungen
- **W · Reichweite** · Aussage — Grundlage ist die Verkäufer-Spec; umgesetzt wird nur die Artikelseite, weitere Filterleisten folgen einzeln in eigenen Aufträgen.
- **W · Linker Bereich** · Aussage — Links steht nichts, die Artikelseite hat keine Anlegen-Funktion.
- **W · Suche** · Aussage — Die Freitextsuche füllt den gesamten Restplatz wie auf der Verkäuferseite.
- **W · Reihenfolge rechts** · Aussage — Marke, Kategorie, Status, wie bisher.
- **W · Breite der Auswahlfelder** · Aussage — Mindestbreite 200 px; gilt nur für die Artikelseite, das Muster der Verkäufer-Spec (150 px) bleibt unberührt.
- **W · Chips** · Aussage — Keine Filter-Chips auf der Artikelseite; sie sind eine neue Funktion und nicht Teil dieses Auftrags.
- **W · Verhalten der Auswahlfelder** · Aussage — Löschen-Kreuz und Platzhalter „Alle" bleiben unverändert.
- **W · Begriff** · Aussage — „Filterleiste" ist der kanonische Begriff, „Toolbar" wird nicht verwendet.
- **W · Schmale Fenster** · Aussage — Die Leiste bricht um wie in der Verkäufer-Spec.
- **F · Entscheidungen** — geändert — Vorschlag 2: Die Verweise auf die Verkäuferseite in „Was, wie, wo, warum“ und in den W-Einträgen bleiben unverändert; in den Soll-Vorgaben steht jetzt offen, dass Rahmen und Abstände der Leiste dem Muster der Verkäuferseite folgen und das Umbruchverhalten in den Akzeptanzkriterien beschrieben ist.
