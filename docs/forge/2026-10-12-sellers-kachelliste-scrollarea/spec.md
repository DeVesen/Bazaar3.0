# Verkäufer-Kachelliste mit PrimeNG ScrollArea

Status: bestätigt am 2026-10-12
Art: verankert
Basis: ae7a010

## Was, wie, wo, warum
- Die Kachelliste der Verkäufer-Seite in der Haupt-App scrollt ab 769px in einem eigenen Bereich, der heute ein DIV mit nativem vertikalem Überlauf ist. · Git
- Dieser Scrollbereich wird auf die PrimeNG-Komponente ScrollArea umgestellt. Damit nutzt die Kachelliste die themefähige Scrollbar von PrimeNG statt der nativen Browser-Scrollbar. · Aussage
- Die Kachelliste ist der Listenbereich mit den Verkäufer-Kacheln und dem Nachlade-Auslöser am Listenende. · Git
- Der Umfang beschränkt sich auf die Verkäufer-Seite. Leaderboard (Statistik) und Warenkorb (Kasse) bleiben unverändert. · Aussage

## Theoretisches Verhalten nach Umsetzung
- Ab 769px füllt die Verkäufer-Seite die Resthöhe. Die Filterzeilen bleiben stehen, nur die Kachelliste scrollt, in der PrimeNG-ScrollArea. · Aussage
- Die Scrollbar erscheint in der Variante „auto“, also nur wenn die Kacheln mehr Platz brauchen als vorhanden. · Aussage
- Bis 768px scrollt die ganze Seite wie bisher, die Kachelliste hat keinen eigenen Scrollbereich. · Aussage
- Am Listenende kommen automatisch die nächsten 60 Verkäufer dazu, auch im neuen Scrollbereich. · Aussage
- Ändern sich Suche, Status oder Sortierung und die neue Liste trifft ein, beginnt die Kachelliste oben. · Aussage
- Das Lade-Skeleton der Verkäuferliste liegt innerhalb des Scrollbereichs an der Stelle der Kacheln. Die Filterzeilen bleiben sichtbar. · Aussage
- Die Scrollkanten haben keinen Fade-Verlauf. · Aussage

## Soll-Vorgaben
- Es kommt ausschließlich PrimeNG ScrollArea zum Einsatz, kein selbstgebauter Scrollbereich. · Aussage
- Der Wechsel zwischen den Darstellungen liegt unverändert bei 768px/769px. · Aussage
- Die Höhe des Scrollbereichs bleibt Fensterhöhe abzüglich Shell-Abstand, Page-Header und Filter. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben die Verkäufer-Seite bei 1440px mit mehr Kacheln als Platz, wenn der Anwender in der Kachelliste scrollt, dann bewegen sich nur die Kacheln, die Filterzeilen bleiben sichtbar und die Seite selbst scrollt nicht. · Aussage
- **AC-03** Gegeben die Verkäufer-Seite bei 1440px mit mehr Kacheln als Platz, dann ist die PrimeNG-Scrollbar der Kachelliste vorhanden und wird bei Interaktion (Hover, Scrollen) eingeblendet; gegeben weniger Kacheln als Platz, dann ist keine Scrollbar vorhanden. *(Randfall)* · Aussage
- **AC-04** Gegeben die Verkäufer-Seite bei 768px mit mehr Kacheln als Platz, wenn der Anwender scrollt, dann scrollt die ganze Seite und die Kachelliste hat keinen eigenen Scrollbereich. · Aussage
- **AC-05** Gegeben mehr als 60 Verkäufer bei 1440px, wenn der Anwender das Ende der Kachelliste im Scrollbereich erreicht, dann erscheinen die nächsten 60 Kacheln und die bisherigen Kacheln bleiben an ihrer Position. · Aussage
- **AC-06** Gegeben die Kachelliste ist weit nach unten gescrollt, wenn der Anwender Suche, Status oder Sortierung ändert und die neue Liste eintrifft, dann steht die Kachelliste ganz oben. · Aussage
- **AC-07** Gegeben das Lade-Skeleton wird angezeigt, dann liegt es im Scrollbereich an der Stelle der Kacheln und die Filterzeilen bleiben sichtbar. · Aussage
- **AC-08** Gegeben die Kachelliste mit Überlauf, dann zeigen die obere und die untere Kante des Scrollbereichs keinen Fade-Verlauf. · Aussage
- **AC-09** Gegeben eine Kachel im Scrollbereich, wenn der Anwender sie anklickt, dann öffnet sich das Detailfenster des Verkäufers wie bisher. *(Regression)* · Aussage
- **AC-10** Gegeben keine Verkäufer oder keine Treffer für den Filter, dann erscheint der jeweilige Hinweistext wie bisher. *(Regression)* · Aussage

## Entscheidungen
- **W · Begriff Kachel** · Aussage — „Verkäufer-Kachel“ und „Kachelliste“ sind kanonisch; „Verkäufer-Karte“ gilt nicht.
- **W · Umfang** · Aussage — Nur die Verkäufer-Seite; Leaderboard und Warenkorb bleiben.
- **W · Bis 768px** · Aussage — Seite scrollt normal, kein eigener Scrollbereich.
- **W · Scrollbar-Variante** · Aussage — „auto“.
- **W · Nachladen** · Aussage — Unverändert, 60 am Listenende.
- **W · Filter-/Sortierwechsel** · Aussage — Neue Liste beginnt oben.
- **W · Lade-Skeleton** · Aussage — Innerhalb des Scrollbereichs an der Stelle der Kacheln.
- **W · Rand-Fade** · Aussage — Kein Fade.
- **F · AC-02** — geändert — Vorschlag 1: AC-02 gestrichen, weil es die Bauweise statt beobachtbares Verhalten prüfte. Die Komponentenvorgabe bleibt in den Soll-Vorgaben („ausschließlich PrimeNG ScrollArea“); das beobachtbare Verhalten (themefähige Scrollbar sichtbar bzw. nicht sichtbar) prüft AC-03.
- **F · Soll-Vorgaben** — geändert — Vorschlag 1: Zeile zum Code-Namen der Verkäufer-Kachel aus den Soll-Vorgaben gestrichen, weil ein Code-Bezeichner kein Verhalten beschreibt; die Namensstabilität gehört in den Plan.
- **F · AC-03** — geändert — Vorschlag 2: „auto“ beibehalten; „sichtbar“ präzisiert zu „vorhanden und bei Interaktion eingeblendet“, weil die Variante „auto“ als Overlay-Scrollbar erst bei Hover/Scrollen erscheint. Änderung an der Spec, nicht am Code.
