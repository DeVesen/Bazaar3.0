# Filterleiste der Kategorienseite als gerahmte Leiste

Status: bestätigt am 2026-10-12
Art: verankert
Basis: 310b692

## Was, wie, wo, warum
Die Seite „Kategorien" in der Haupt-App hat heute keine Filterleiste: Über der Tabelle steht nichts, und der Button „+ Neu" sitzt in der Titelzeile der Seite und wird nur Admins angezeigt. Sie bekommt eine einzige, gerahmte Filterleiste mit drei Bereichen: links ein reiner „+"-Button zum Anlegen einer Kategorie (nur für Admins), dazwischen eine neue Freitextsuche über den Kategorienamen, die den gesamten Platz bis zum Auswahlfeld füllt, rechts ein neues Auswahlfeld „Original", das die Tabelle nach der Spalte „Original" filtert. Der Button „+ Neu" in der Titelzeile entfällt, sein Platz ist jetzt die Filterleiste. Grundlage ist das Muster der Filterleiste der Verkäuferseite; die Seite „Marken" erhält dieselbe Leiste in einer eigenen Spec. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Anwender sieht oberhalb der Kategorien-Tabelle eine gerahmte Filterleiste. Ein Admin sieht links ein „+"-Symbol, das den Dialog zum Anlegen einer Kategorie öffnet; für alle anderen Anwender fehlt es, und das Suchfeld beginnt am linken Rand. Das Suchfeld füllt den Platz bis zum Auswahlfeld und blendet beim Tippen sofort alle Kategorien aus, deren Name den Suchbegriff nicht enthält. Rechts steht das Auswahlfeld „Original" mit den Werten „✓ Original" und „Neu". Suche und Auswahlfeld wirken zusammen, die per Spaltenkopf gewählte Sortierung bleibt erhalten. Es erscheinen keine Filter-Chips. · Aussage

## Soll-Vorgaben
- Umgesetzt wird nur die Seite „Kategorien" der Haupt-App. Die Voranmelde-App und andere Listenseiten, auch die Seite „Marken", bleiben unverändert. · Aussage
- Das Layout besteht aus Anlegen-Button links, Freitextsuche, die den Platz zwischen Button und Auswahlfeld füllt, und Auswahlfeld rechts; keine sichtbaren Labels, Auswahlfeld mit Mindestbreite 150 px. · Aussage
- Zur Leiste gehören nur Suchfeld, Auswahlfeld „Original" und der Anlegen-Button. Weitere Schaltflächen gehören nicht dazu. · Aussage
- Wer Kategorien anlegen darf, ändert sich nicht: Der Anlegen-Button steht nur für Admins in der Leiste. · Aussage
- Suche und Auswahlfeld wirken auf die vorhandene Liste, es gibt keine neue Abfrage an den Server. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben die Seite „Kategorien" der Haupt-App wird geöffnet, wenn sie angezeigt wird, dann steht oberhalb der Kategorien-Tabelle eine einzige gerahmte Leiste mit Suchfeld und Auswahlfeld „Original", und in der Titelzeile der Seite steht kein Button „+ Neu" mehr. · Aussage
- **AC-02** Gegeben ein Admin ist angemeldet, wenn er die Leiste betrachtet, dann ist am linken Rand genau ein Button mit „+"-Symbol und ohne Text. · Aussage
- **AC-03** Gegeben ein Admin ist angemeldet, wenn er den „+"-Button mit der Maus berührt oder ein Screenreader ihn vorliest, dann lautet der Hinweis „Neue Kategorie". · Aussage
- **AC-04** Gegeben ein Admin ist angemeldet, wenn er auf den „+"-Button klickt, dann öffnet sich der Dialog zum Anlegen einer Kategorie wie bisher bei „+ Neu". · Aussage
- **AC-05** Gegeben ein Anwender ohne Admin-Rolle ist angemeldet, wenn er die Seite „Kategorien" betrachtet, dann gibt es weder in der Leiste noch in der Titelzeile einen Button zum Anlegen, und das Suchfeld beginnt am linken Rand der Leiste. · Aussage
- **AC-06** Gegeben die Leiste ist sichtbar, wenn der Anwender sie betrachtet, dann füllt das Suchfeld den gesamten Platz zwischen dem „+"-Button (bzw. dem linken Rand) und dem Auswahlfeld und zeigt den Platzhalter „Suche nach Name …". · Aussage
- **AC-07** Gegeben die Leiste ist sichtbar, wenn der Anwender sie betrachtet, dann steht am rechten Rand genau ein Auswahlfeld, das mindestens 150 px breit ist und bei längerem gewähltem Text breiter wird, sodass der Text nicht gekürzt wird. · Aussage
- **AC-08** Gegeben die Leiste ist sichtbar, wenn der Anwender die Eingabefelder betrachtet, dann hat keines ein sichtbares Label, und das Auswahlfeld trägt für Screenreader den Namen „Original". · Aussage
- **AC-09** Gegeben im Auswahlfeld ist kein Wert gewählt, wenn der Anwender die Leiste betrachtet, dann zeigt es den Platzhalter „Alle", und beim Öffnen bietet es die Werte „✓ Original" und „Neu" an. · Aussage
- **AC-10** Gegeben die Tabelle enthält Kategorien mit „✓ Original" und mit „Neu", wenn der Anwender im Auswahlfeld „Neu" wählt, dann zeigt die Tabelle sofort nur Kategorien mit „Neu"; wählt er „✓ Original", dann zeigt sie nur Kategorien mit „✓ Original". · Aussage
- **AC-11** Gegeben im Auswahlfeld ist ein Wert gewählt, wenn der Anwender das Löschen-Kreuz des Feldes betätigt, dann ist der Wert entfernt, das Feld zeigt „Alle", und die Tabelle zeigt wieder Kategorien beider Arten. · Aussage
- **AC-12** Gegeben die Tabelle enthält die Kategorien „Hosen" und „Jacken", wenn der Anwender „HO" in das Suchfeld tippt, dann zeigt die Tabelle sofort nur „Hosen", ohne Verzögerung und ohne Beachtung von Groß- und Kleinschreibung; ein Teil des Namens genügt. · Aussage
- **AC-13** Gegeben ein Suchbegriff und ein Wert im Auswahlfeld sind gesetzt, wenn die Tabelle angezeigt wird, dann zeigt sie nur Kategorien, die beide Bedingungen erfüllen. · Aussage
- **AC-14** Gegeben ein Suchbegriff oder ein Wert im Auswahlfeld ist gesetzt und der Anwender hat eine Spalte zum Sortieren gewählt, wenn er Suchbegriff oder Wert ändert, dann bleibt die gewählte Sortierung erhalten. · Aussage
- **AC-15** Gegeben es existieren Kategorien, wenn Suchbegriff und Auswahlfeld keine Kategorie treffen, dann zeigt die Tabelle den Hinweis „Keine Kategorien gefunden." statt des Hinweises für eine leere Liste. · Aussage
- **AC-16** Gegeben es existiert keine Kategorie und kein Filter ist gesetzt, wenn die Seite angezeigt wird, dann zeigt die Tabelle den bisherigen Hinweis „Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit übernommen." · Aussage
- **AC-17** Gegeben ein Filter ist aktiv, wenn die Seite angezeigt wird, dann erscheinen keine Filter-Chips. · Aussage
- **AC-18** Gegeben das Fenster ist so schmal, dass die Elemente nicht nebeneinander passen, wenn die Seite angezeigt wird, dann bricht die Leiste auf weitere Zeilen um, es entsteht keine waagerechte Bildlaufleiste und alle Elemente bleiben erreichbar. · Aussage

## Entscheidungen
- **W · Reichweite** · Aussage — Grundlage ist die Verkäufer-Spec; umgesetzt wird nur die Kategorienseite, weitere Filterleisten folgen einzeln in eigenen Aufträgen.
- **W · Linker Bereich** · Aussage — „+"-Button links, der „+ Neu" aus der Titelzeile ersetzt; Hinweistext „Neue Kategorie"; nur für Admins, wie bisher.
- **W · Suche** · Aussage — Neue Freitextsuche in der Mitte, füllt den Restplatz; durchsucht nur den Namen, Teiltreffer ohne Beachtung von Groß- und Kleinschreibung, wirkt sofort; Platzhalter „Suche nach Name …".
- **W · Auswahlfeld** · Aussage — Neues Auswahlfeld „Original" rechts mit „✓ Original" und „Neu", Mindestbreite 150 px; Platzhalter „Alle", Löschen-Kreuz und Screenreader-Name „Original" wie auf der Artikelseite.
- **W · Zusammenspiel** · Aussage — Suche und Auswahlfeld müssen beide zutreffen; die Sortierung über die Spaltenköpfe bleibt erhalten.
- **W · Leeres Ergebnis** · Aussage — „Keine Kategorien gefunden." bei Filter ohne Treffer; der bisherige Hinweis bleibt für eine wirklich leere Liste.
- **W · Chips** · Aussage — Keine Filter-Chips, wie auf der Artikelseite.
- **W · Schmale Fenster** · Aussage — Die Leiste bricht um wie in der Verkäufer-Spec.
- **W · Übernahme von „Marken"** · Aussage — Alle Entscheidungen der Markenseite gelten sinngemäß, weil du den Auftrag wortgleich gegeben hast; dort hattest du alle Empfehlungen bestätigt.
- **F · Entscheidungen** — nicht geändert — Vorschlag 1: Der Vorschlag verlangt, die Entscheidungen „Schmale Fenster“ (und mittelbar „Übernahme von Marken“) umzuformulieren; beide sind W-Einträge und damit bindend. Das Umbruchverhalten steht bereits vollständig in AC-18. W-Eintrag ist bindend.
- **F · Soll-Vorgaben** — geändert — Vorschlag 1: Die Layout-Vorgabe nennt das Layout jetzt selbst, ohne Verweis auf die Verkäufer-Spec; die Herkunft bleibt in der Beschreibung genannt.
