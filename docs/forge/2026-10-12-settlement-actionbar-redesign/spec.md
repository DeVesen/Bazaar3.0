# Aktionsleiste der Abrechnungsseite

Status: bestätigt am 2026-10-12
Art: verankert
Basis: 09a5c44

## Was, wie, wo, warum
Auf der Seite „Abrechnung" der Haupt-App stehen im Zustand „Verkäufer abrechnen" Name, Adresse und Abrechnungs-Tag links, die Aktionen „← Zurück", „Drucken", „Zurückgeben" und „Abrechnen" gemeinsam rechts, ohne Rahmen. Sie werden zu einer einzigen Aktionsleiste mit drei Bereichen: links ein reiner „<"-Button zurück zur Verkäuferwahl, in der Mitte der Name des Verkäufers mit Adresse und Abrechnungs-Tag darunter, rechts „Drucken", „Zurückgeben" und „Abrechnen". Die Spec nutzt die Verkäufer-Filterleiste als Vorbild für Aussehen und Anordnung und dient als Vorbild für weitere Seiten mit einem Gegenstand und Aktionen. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Anwender wählt auf der Seite „Abrechnung" einen Verkäufer. Unter dem Seitentitel sieht er eine gerahmte Aktionsleiste. Links steht ein „<"-Symbol, das zurück zur Verkäuferwahl führt. In der Mitte stehen der Name des Verkäufers, darunter die Adresse und bei abgerechneten Verkäufern darunter der Tag „Abgerechnet am … · Betrag". Rechts stehen nebeneinander „Drucken", „Zurückgeben" und „Abrechnen". Alle Aktionen funktionieren wie bisher; KPI-Kacheln und Artikeltabelle stehen unverändert darunter. · Aussage

## Soll-Vorgaben
- Umgesetzt wird nur der Zustand „Verkäufer abrechnen" der Seite „Abrechnung" der Haupt-App. Der Auswahlschritt mit der Verkäufersuche, der Wizard der Artikelannahme und die Voranmelde-App bleiben unverändert. · Aussage
- Das Layout ist das Vorbild für künftige Aktionsleisten der Haupt-App: Zurück links als reines Icon, Name des Gegenstands mittig, Aktionen rechts. · Aussage
- Der Zurück-Button zeigt nur das „<"-Symbol und keinen Text. · Aussage
- Die Beschriftungen, Symbole und Aktiv-/Inaktiv-Regeln von „Drucken", „Zurückgeben" und „Abrechnen" bleiben unverändert. · Aussage
- Der Seitentitel „Abrechnung", die KPI-Kacheln und die Artikeltabelle bleiben unverändert. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben ein Verkäufer ist auf der Seite „Abrechnung" gewählt, wenn die Seite angezeigt wird, dann stehen Zurück-Button, Verkäufer-Name und die drei Aktionen in einer einzigen gerahmten Aktionsleiste unterhalb des Seitentitels „Abrechnung" und oberhalb der KPI-Kacheln. · Aussage
- **AC-02** Gegeben die Aktionsleiste ist sichtbar, wenn der Anwender sie betrachtet, dann steht am linken Rand genau ein Button mit „<"-Symbol und ohne Text, und die Aktionen stehen nicht mehr links vom Namen. · Aussage
- **AC-03** Gegeben die Aktionsleiste ist sichtbar, wenn der Anwender den „<"-Button mit der Maus berührt oder ein Screenreader ihn vorliest, dann lautet der Hinweis „Zurück zur Verkäuferwahl". · Aussage
- **AC-04** Gegeben die Aktionsleiste ist sichtbar, wenn der Anwender auf den „<"-Button klickt, dann erscheint der Auswahlschritt mit der Verkäufersuche wie bisher bei „← Zurück". · Aussage
- **AC-05** Gegeben die Aktionsleiste ist so breit, dass alle drei Bereiche nebeneinander passen, wenn der Anwender sie betrachtet, dann steht der Name des Verkäufers (Vorname und Nachname) horizontal mittig in der Leiste, unabhängig von der Breite der Bereiche links und rechts. · Aussage
- **AC-06** Gegeben ein nicht abgerechneter Verkäufer ist gewählt, wenn der Anwender die Mitte der Leiste betrachtet, dann steht unter dem Namen die Adresse des Verkäufers, ebenfalls mittig, und es erscheint kein Tag „Abgerechnet am". · Aussage
- **AC-07** Gegeben ein abgerechneter Verkäufer ist gewählt, wenn der Anwender die Mitte der Leiste betrachtet, dann stehen untereinander mittig Name, Adresse und der Tag „Abgerechnet am <Datum Uhrzeit> · <Betrag>". · Aussage
- **AC-08** Gegeben Name oder Adresse sind länger als der verfügbare Platz in der Mitte, wenn der Anwender die Leiste betrachtet, dann ist der Text einzeilig und am Ende mit „…" gekürzt, und der Tag „Abgerechnet am …" ist vollständig sichtbar. · Aussage
- **AC-09** Gegeben die Aktionsleiste ist sichtbar, wenn der Anwender die Aktionen am rechten Rand betrachtet, dann stehen von links nach rechts „Drucken", „Zurückgeben", „Abrechnen" mit unveränderter Beschriftung und unveränderten Symbolen. · Aussage
- **AC-10** Gegeben ein nicht abgerechneter Verkäufer mit mindestens einem offenen Artikel, wenn der Anwender die Leiste betrachtet, dann ist „Zurückgeben" aktiv; bei einem Verkäufer ohne offene Artikel oder einem abgerechneten Verkäufer ist „Zurückgeben" deaktiviert. · Aussage
- **AC-11** Gegeben ein abgerechneter Verkäufer, oder ein Verkäufer, für den der Server die Abrechnung nicht freigibt, wenn der Anwender die Leiste betrachtet, dann ist „Abrechnen" deaktiviert; bei einem nicht abgerechneten Verkäufer, für den der Server die Abrechnung freigibt, ist es aktiv. · Aussage
- **AC-12** Gegeben „Zurückgeben" ist aktiv, wenn der Anwender darauf klickt, dann öffnet sich der Dialog zum Zurückgeben von Artikeln per Scan wie bisher. · Aussage
- **AC-13** Gegeben „Abrechnen" ist aktiv, wenn der Anwender darauf klickt, dann öffnet sich der Bestätigungsdialog der Abrechnung wie bisher. · Aussage
- **AC-14** Gegeben ein Verkäufer ist gewählt, wenn der Anwender auf „Drucken" klickt, dann wird für einen nicht abgerechneten Verkäufer die Zwischenabrechnung und für einen abgerechneten Verkäufer die Endabrechnung gedruckt wie bisher. · Aussage
- **AC-15** Gegeben ein Verkäufer ist gewählt, wenn die Seite angezeigt wird, dann stehen der Seitentitel „Abrechnung" oberhalb der Aktionsleiste und KPI-Kacheln und Artikeltabelle unverändert unterhalb. · Aussage
- **AC-16** Gegeben das Fenster ist so schmal, dass die drei Bereiche nicht nebeneinander passen, wenn die Seite angezeigt wird, dann bricht die Leiste um, die Mitte steht in einer eigenen Zeile mittig, es entsteht keine waagerechte Bildlaufleiste und alle Elemente bleiben erreichbar. · Aussage
- **AC-17** Gegeben die Seite „Abrechnung" zeigt den Auswahlschritt mit der Verkäufersuche, wenn die Seite angezeigt wird, dann erscheint keine Aktionsleiste und der Schritt ist unverändert. · Aussage

## Entscheidungen
- **W · Neue Anordnung** · Aussage — Links Zurück, in der Mitte der Verkäufer-Name, rechts Drucken, Zurückgeben, Abrechnen.
- **W · Zurück-Button** · Aussage — Nur „<"-Icon ohne Text, laut Anhang; Hinweis „Zurück zur Verkäuferwahl" wie im Wizard der Artikelannahme.
- **W · Rahmen** · Aussage — Gerahmte Aktionsleiste wie die Filterleiste der Verkäufer-Referenz.
- **W · Inhalt der Mitte** · Aussage — Adresse und Abrechnungs-Tag stehen unter dem Namen, ebenfalls in der Mitte.
- **W · Lage und Kürzen** · Aussage — Name exakt mittig, zu lange Texte werden mit „…" gekürzt; die Adresse folgt derselben Regel, der Tag bleibt vollständig.
- **W · Schmale Fenster** · Aussage — Die Leiste bricht um, die Mitte rutscht in eine eigene Zeile und steht dort mittig; sonst Verhalten wie in der Referenz.
- **W · Aktionen rechts** · Aussage — Beschriftung, Symbole und Aktiv-/Inaktiv-Regeln unverändert, nur Reihenfolge Drucken, Zurückgeben, Abrechnen.
- **W · Seitentitel und Inhalt** · Aussage — Seitentitel „Abrechnung", KPI-Kacheln und Artikeltabelle bleiben unverändert.
- **W · Reichweite** · Aussage — Nur der Abrechnungs-Zustand; Auswahlschritt und Wizard der Artikelannahme bleiben unverändert; das Layout ist Vorbild für spätere Aufträge.
- **W · Begriff** · Aussage — „Aktionsleiste" ist der kanonische Begriff und steht im Glossar; „Filterleiste" bleibt den Listenseiten vorbehalten.
