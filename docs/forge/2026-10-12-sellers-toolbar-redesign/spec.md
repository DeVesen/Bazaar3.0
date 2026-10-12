# Filterleiste der Verkäuferseite als gerahmte Leiste

Status: bestätigt am 2026-10-12
Art: verankert
Basis: a758a32

## Was, wie, wo, warum
Die Filterleiste der Seite „Verkäufer" in der Haupt-App besteht heute aus zwei losen Zeilen: Suche, Sortierung und „+ Neu" oben, der Statusfilter allein darunter. Sie wird zu einer einzigen, gerahmten Leiste mit drei Bereichen: links ein reiner „+"-Button zum Anlegen, dazwischen die Freitextsuche, die den gesamten Platz zwischen Button und Auswahlfeldern füllt, rechts die zwei Auswahlfelder für Sortierung und Status. Diese Spec dient zugleich als Referenz für die Filterleisten weiterer Listenseiten der Haupt-App. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Anwender sieht oberhalb der Verkäuferkarten eine gerahmte Leiste. Links steht ein „+"-Symbol, das den Dialog zum Anlegen eines Verkäufers öffnet. Dazwischen füllt das Suchfeld den gesamten Platz zwischen dem „+"-Symbol und den Auswahlfeldern. Rechts stehen nebeneinander Sortierung und Status. Alle Felder funktionieren wie bisher. Darunter erscheinen bei aktiven Filtern weiterhin die entfernbaren Filter-Chips. · Aussage

## Soll-Vorgaben
- Umgesetzt wird nur die Seite „Verkäufer" der Haupt-App. Die Voranmelde-App und andere Listenseiten bleiben unverändert. · Aussage
- Das Layout ist das verbindliche Muster für künftige Filterleisten der Haupt-App: „+" links, Freitextsuche füllt den Platz zwischen Button und Auswahlfeldern, Auswahlfelder rechts, keine Labels, Auswahlfelder mit Mindestbreite 150 px. · Aussage
- Zur Leiste gehören nur Suchfeld, zwei Auswahlfelder und der Anlegen-Button. Weitere Schaltflächen (z. B. Drucken, Hochladen, Abbrechen, Speichern) gehören nicht dazu. · Aussage
- Die Eingabefelder erhalten keine sichtbaren Labels. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben die Seite „Verkäufer" der Haupt-App wird geöffnet, wenn sie angezeigt wird, dann stehen Anlegen-Button, Suchfeld, Sortierung und Status in einer einzigen gerahmten Leiste oberhalb der Verkäuferkarten und der Statusfilter steht nicht mehr in einer eigenen Zeile darunter. · Aussage
- **AC-02** Gegeben die Leiste ist sichtbar, wenn der Anwender sie betrachtet, dann ist am linken Rand genau ein Button mit „+"-Symbol und ohne Text. · Aussage
- **AC-03** Gegeben die Leiste ist sichtbar, wenn der Anwender den „+"-Button mit der Maus berührt oder ein Screenreader ihn vorliest, dann lautet der Hinweis „Neuer Verkäufer". · Aussage
- **AC-04** Gegeben die Leiste ist sichtbar, wenn der Anwender auf den „+"-Button klickt, dann öffnet sich der Dialog zum Anlegen eines Verkäufers wie bisher bei „+ Neu". · Aussage
- **AC-05** Gegeben die Leiste ist sichtbar, wenn der Anwender sie betrachtet, dann füllt das Suchfeld den gesamten Platz zwischen dem „+"-Button und den Auswahlfeldern und zeigt den Platzhalter „Suche nach Name, Ort …". · Aussage
- **AC-06** Gegeben die Leiste ist sichtbar, wenn der Anwender sie betrachtet, dann stehen am rechten Rand zwei Auswahlfelder, von links nach rechts Sortierung, dann Status. · Aussage
- **AC-07** Gegeben die Leiste ist sichtbar, wenn der Anwender die Auswahlfelder betrachtet, dann ist jedes mindestens 150 px breit und wird bei längerem gewähltem Text breiter, sodass der Text nicht gekürzt wird. · Aussage
- **AC-08** Gegeben die Leiste ist sichtbar, wenn der Anwender die drei Eingabefelder betrachtet, dann hat keines ein sichtbares Label, und die Auswahlfelder tragen für Screenreader die Namen „Sortierung" und „Status". · Aussage
- **AC-09** Gegeben die Leiste ist sichtbar, wenn der Anwender Suchbegriff, Sortierung oder Statusfilter ändert, dann wirken sie wie vor dieser Änderung (Suche verzögert nach kurzer Tipppause, Sortierung und Status sofort). · Aussage
- **AC-10** Gegeben ein Filter ist aktiv, wenn die Seite angezeigt wird, dann erscheinen die aktiven Filter wie bisher als entfernbare Chips unter der Leiste, und ohne aktiven Filter erscheinen keine Chips. · Aussage
- **AC-11** Gegeben das Fenster ist so schmal, dass die Elemente nicht nebeneinander passen, wenn die Seite angezeigt wird, dann bricht die Leiste auf weitere Zeilen um, es entsteht keine waagerechte Bildlaufleiste und alle Elemente bleiben erreichbar. · Aussage

## Entscheidungen
- **W · Reichweite** · Aussage — Das Layout gilt als Standardmuster für die Haupt-App; umgesetzt wird jetzt nur die Verkäuferseite, andere Listen folgen in eigenen Aufträgen und verweisen auf diese Spec.
- **W · Elemente** · Aussage — Suchfeld, Sortierung, Status und Anlegen-Button; Drucken, Hochladen, Abbrechen und Speichern aus dem Vorbild gehören nicht dazu, übernommen werden nur Aussehen und Anordnung.
- **W · Labels** · Aussage — Keine sichtbaren Labels; die ursprüngliche Vorgabe „alle Inputs ein Label" ist damit ersetzt.
- **W · Breite der Auswahlfelder** · Aussage — Mindestbreite 150 px statt fester Breite; die ursprüngliche Vorgabe „width: 150px" ist damit ersetzt.
- **W · Anlegen-Button** · Aussage — Nur „+"-Symbol links, Hinweistext „Neuer Verkäufer".
- **W · Reihenfolge rechts** · Aussage — Sortierung, dann Status.
- **W · Chips und schmale Fenster** · Aussage — Chips bleiben unter der Leiste; die Leiste bricht bei schmalem Fenster um.
- **W · Verhältnis zur Lade-Spec** · Aussage — Die Lade-Platzhalter der Verkäuferseite sind eine getrennte, abgeschlossene Spec.
- **F · AC-05** — geändert — Vorschlag 1: Das Suchfeld füllt jetzt den gesamten Platz zwischen „+"-Button und Auswahlfeldern statt „mittig" zu stehen; die Formulierung ist im einleitenden Abschnitt, im Verhaltensabschnitt und in der Muster-Vorgabe entsprechend angepasst.
- **F · Entscheidungen** — nicht geändert — Vorschlag 1: Der Vorschlag zielt auf den Wortlaut von „W · Elemente“; W-Eintrag ist bindend. Aussehen und Anordnung sind unabhängig davon in Soll-Vorgaben und Akzeptanzkriterien vollständig beschrieben.
- **F · Soll-Vorgaben** — geändert — Vorschlag 1: Die Vorgabe zur Framework-Komponente ist gestrichen, der Titel lautet jetzt „Filterleiste der Verkäuferseite als einzeilige Leiste“, und der einleitende Abschnitt spricht von einer gerahmten Leiste; die Komponentenwahl bleibt dem Plan überlassen.
