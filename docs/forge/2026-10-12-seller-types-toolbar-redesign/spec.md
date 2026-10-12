# Filterleiste der Verkäufer-Typen-Seite als gerahmte Leiste

Status: bestätigt am 2026-10-12
Art: verankert
Basis: 750355d

## Was, wie, wo, warum
Die Seite „Verkäufer-Typen" in der Haupt-App hat heute keine Filterleiste: Über der Tabelle steht nichts, und der Button „+ Neu" sitzt im Seitentitel und wird nur Admins angezeigt. Sie bekommt eine einzige, gerahmte Filterleiste mit zwei Bereichen: links ein reiner „+"-Button zum Anlegen eines Verkäufer-Typs (nur für Admins), danach eine neue Freitextsuche über den Namen, die den gesamten übrigen Platz bis zum rechten Rand der Leiste füllt. Rechts gibt es keinen Bereich, die Leiste enthält kein Auswahlfeld. Der Button „+ Neu" im Seitentitel entfällt, sein Platz ist jetzt die Filterleiste. Grundlage ist das Muster der Filterleiste der Verkäuferseite. Das maßgebliche Verhalten steht in den Kriterien dieser Spec. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Anwender sieht oberhalb der Verkäufer-Typen-Tabelle eine gerahmte Filterleiste. Ein Admin sieht links ein „+"-Symbol, das den Dialog zum Anlegen eines Verkäufer-Typs öffnet; für alle anderen Anwender fehlt es, und das Suchfeld beginnt am linken Rand. Das Suchfeld füllt den gesamten übrigen Platz und blendet beim Tippen sofort alle Verkäufer-Typen aus, deren Name den Suchbegriff nicht enthält. Die per Spaltenkopf gewählte Sortierung bleibt dabei erhalten. Es erscheinen keine Filter-Chips. · Aussage

## Soll-Vorgaben
- Umgesetzt wird nur die Seite „Verkäufer-Typen" der Haupt-App. Die Voranmelde-App und andere Listenseiten bleiben unverändert. · Aussage
- Das Layout folgt dem Muster der Verkäufer-Spec: Anlegen-Button links, Freitextsuche füllt den übrigen Platz, keine sichtbaren Labels. Der rechte Bereich mit Auswahlfeldern entfällt, weil die Seite keines braucht. · Aussage
- Zur Leiste gehören nur das Suchfeld und der Anlegen-Button. Weitere Schaltflächen und Auswahlfelder gehören nicht dazu. · Aussage
- Wer Verkäufer-Typen anlegen darf, ändert sich nicht: Der Anlegen-Button steht nur für Admins in der Leiste. · Aussage
- Die Suche wirkt auf die vorhandene Liste, es gibt keine neue Abfrage an den Server. · Aussage
- Alle Entscheidungen, die für diese Seite gelten, auch die sinngemäß übernommenen, sind in den Einträgen unter „Entscheidungen" und in den Kriterien dieser Spec ausformuliert; diese sind maßgeblich. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben die Seite „Verkäufer-Typen" der Haupt-App wird geöffnet, wenn sie angezeigt wird, dann steht oberhalb der Verkäufer-Typen-Tabelle eine einzige gerahmte Leiste mit dem Suchfeld, und im Seitentitel steht kein Button „+ Neu" mehr. · Aussage
- **AC-02** Gegeben ein Admin ist angemeldet, wenn er die Leiste betrachtet, dann ist am linken Rand genau ein Button mit „+"-Symbol und ohne Text. · Aussage
- **AC-03** Gegeben ein Admin ist angemeldet, wenn er den „+"-Button mit der Maus berührt oder ein Screenreader ihn vorliest, dann lautet der Hinweis „Neuer Verkäufer-Typ". · Aussage
- **AC-04** Gegeben ein Admin ist angemeldet, wenn er auf den „+"-Button klickt, dann öffnet sich der Dialog zum Anlegen eines Verkäufer-Typs wie bisher bei „+ Neu". · Aussage
- **AC-05** Gegeben ein Anwender ohne Admin-Rolle ist angemeldet, wenn er die Seite „Verkäufer-Typen" betrachtet, dann gibt es weder in der Leiste noch im Seitentitel einen Button zum Anlegen, und das Suchfeld beginnt am linken Rand der Leiste. · Aussage
- **AC-06** Gegeben die Leiste ist sichtbar, wenn der Anwender sie betrachtet, dann füllt das Suchfeld den gesamten Platz zwischen dem „+"-Button (bzw. dem linken Rand) und dem rechten Rand der Leiste und zeigt den Platzhalter „Suche nach Name …", und die Leiste enthält kein Auswahlfeld. · Aussage
- **AC-07** Gegeben die Leiste ist sichtbar, wenn der Anwender das Suchfeld betrachtet, dann hat es kein sichtbares Label. · Aussage
- **AC-08** Gegeben die Tabelle enthält die Verkäufer-Typen „Privat" und „Händler", wenn der Anwender „HÄ" in das Suchfeld tippt, dann zeigt die Tabelle sofort nur „Händler", ohne Verzögerung und ohne Beachtung von Groß- und Kleinschreibung; ein Teil des Namens genügt. · Aussage
- **AC-09** Gegeben ein Suchbegriff ist gesetzt, wenn der Anwender das Suchfeld leert, dann zeigt die Tabelle wieder alle Verkäufer-Typen. · Aussage
- **AC-10** Gegeben ein Suchbegriff ist gesetzt und der Anwender hat eine Spalte zum Sortieren gewählt, wenn er den Suchbegriff ändert, dann bleibt die gewählte Sortierung erhalten. · Aussage
- **AC-11** Gegeben es existieren Verkäufer-Typen, wenn der Suchbegriff keinen Verkäufer-Typ trifft, dann zeigt die Tabelle den Hinweis „Keine Verkäufer-Typen gefunden." statt des Hinweises für eine leere Liste. · Aussage
- **AC-12** Gegeben es existiert kein Verkäufer-Typ und kein Suchbegriff ist gesetzt, wenn die Seite angezeigt wird, dann zeigt die Tabelle den Hinweis „Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit „+" beginnen." Der Hinweis erscheint für alle Anwender, auch für solche ohne „+"-Button. · Aussage
- **AC-13** Gegeben ein Suchbegriff ist gesetzt, wenn die Seite angezeigt wird, dann erscheinen keine Filter-Chips. · Aussage
- **AC-14** Gegeben das Fenster ist so schmal, dass die Elemente nicht nebeneinander passen, wenn die Seite angezeigt wird, dann bricht die Leiste auf weitere Zeilen um, es entsteht keine waagerechte Bildlaufleiste und alle Elemente bleiben erreichbar. · Aussage

## Entscheidungen
- **W · Reichweite** · Aussage — Grundlage ist die Verkäufer-Spec; umgesetzt wird nur die Verkäufer-Typen-Seite, weitere Filterleisten folgen einzeln in eigenen Aufträgen.
- **W · Linker Bereich** · Aussage — „+"-Button links, der „+ Neu" aus der Titelzeile ersetzt; Hinweistext „Neuer Verkäufer-Typ"; nur für Admins, wie bisher.
- **W · Rechter Bereich** · Aussage — Rechts steht nichts, die Leiste hat kein Auswahlfeld.
- **W · Suche** · Aussage — Neue Freitextsuche, füllt den gesamten übrigen Platz bis zum rechten Rand; durchsucht nur den Namen, nicht die Zahlenspalten; Teiltreffer ohne Beachtung von Groß- und Kleinschreibung, wirkt sofort; Platzhalter „Suche nach Name …".
- **W · Zusammenspiel** · Aussage — Die Sortierung über die Spaltenköpfe bleibt bei Änderung des Suchbegriffs erhalten.
- **W · Leeres Ergebnis** · Aussage — „Keine Verkäufer-Typen gefunden." bei Suche ohne Treffer.
- **W · Leertext** · Aussage — Der Hinweis bei leerer Liste verweist statt auf „+ Neu" auf „+"; er erscheint weiter für alle Anwender.
- **W · Chips** · Aussage — Keine Filter-Chips, wie auf der Artikelseite.
- **W · Schmale Fenster** · Aussage — Die Leiste bricht um wie in der Verkäufer-Spec.
- **W · Übernahme von „Marken"** · Aussage — Die nicht vom Auswahlfeld abhängigen Entscheidungen der Markenseite gelten sinngemäß, weil du den Auftrag in derselben Form gegeben hast; dort hattest du alle Empfehlungen bestätigt.
- **F · Entscheidungen** — geändert — Vorschlag 2: Der Satz, dass alle gemeinten Entscheidungen in den übrigen Einträgen und Kriterien dieser Spec ausformuliert und maßgeblich sind, steht als eigene Soll-Vorgabe; der W-Eintrag zur Übernahme von „Marken" bleibt wörtlich unverändert, weil W-Einträge bindend sind und nicht ergänzt werden.
- **F · Was, wie, wo, warum** — geändert — Vorschlag 1: „Titelzeile (der Seite)" ist in Einleitung, AC-01 und AC-05 durch den Glossarbegriff „Seitentitel" ersetzt; der Herkunftshinweis auf die Verkäuferseite bleibt und ist um „Das maßgebliche Verhalten steht in den Kriterien dieser Spec." ergänzt. Der W-Eintrag zum linken Bereich bleibt wörtlich unverändert, weil W-Einträge bindend sind.
