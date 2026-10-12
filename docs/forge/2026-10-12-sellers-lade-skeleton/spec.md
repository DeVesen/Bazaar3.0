# Verkäuferliste zeigt beim Laden Platzhalter statt leerer Fläche

Status: bestätigt am 2026-10-12
Art: verankert
Basis: 2ea9ae6

## Was, wie, wo, warum
Auf der Seite „Verkäufer" der Haupt-App (Route „/sellers") erscheint beim ersten Öffnen heute eine leere Fläche, solange die Verkäufer geladen werden. Stattdessen zeigt die Seite in dieser Zeit Platzhalter (Skeleton) an der Stelle der Verkäuferkarten. Sind die Daten da, ersetzen die echten Karten die Platzhalter. Die Platzhalter ahmen die Karte nach, damit der Anwender sofort sieht, dass Inhalt kommt. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Anwender öffnet die Seite und sieht 6 Platzhalter-Karten. Sobald die Verkäufer da sind, treten die Karten an ihre Stelle. Ändert er Suche, Sortierung oder Statusfilter, erscheinen erneut 6 Platzhalter, bis die neue Liste da ist. Beim Nachladen am Listenende und bei Aktualisierungen nach Speichern, Löschen oder Freigeben bleiben die Karten stehen, ohne Platzhalter. · Aussage

## Soll-Vorgaben
- Gilt nur für die Seite „Verkäufer" der Haupt-App; andere Seiten bleiben unverändert. · Aussage
- Filterleiste, Karten, Leer-Hinweise und Fehlerverhalten bleiben sonst unverändert. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben die Seite „Verkäufer" wird erstmals geöffnet und die Verkäufer sind noch nicht geladen, wenn die Seite angezeigt wird, dann sieht der Anwender 6 Platzhalter-Karten und keine leere Kartenfläche. · Aussage
- **AC-02** Gegeben Platzhalter-Karten sind sichtbar, wenn die Verkäufer geladen sind, dann verschwinden alle Platzhalter und die Verkäuferkarten stehen an ihrer Stelle. · Aussage
- **AC-03** Gegeben die Liste zeigt Verkäuferkarten, wenn der Anwender Suchbegriff, Sortierung oder Statusfilter ändert, dann ersetzen 6 Platzhalter-Karten die bisherigen Karten, bis die neue Liste geladen ist. · Aussage
- **AC-04** Gegeben die Liste zeigt Verkäuferkarten, wenn nach Speichern, Löschen oder Artikel-Freigabe die Liste im Hintergrund aktualisiert wird, dann bleiben die Karten sichtbar, es erscheinen keine Platzhalter und die Scroll-Position bleibt unverändert. · Aussage
- **AC-05** Gegeben es gibt mehr Verkäufer als angezeigt, wenn der Anwender ans Listenende scrollt und weitere Verkäufer nachgeladen werden, dann bleiben die vorhandenen Karten sichtbar und es erscheinen keine Platzhalter. · Aussage
- **AC-06** Gegeben Platzhalter-Karten sind sichtbar, wenn die Verkäufer geladen sind und das Ergebnis leer ist, dann erscheint statt der Platzhalter der passende Leer-Hinweis (keine Verkäufer vorhanden bzw. keine Treffer für die gewählten Filter). · Aussage
- **AC-07** Gegeben Platzhalter-Karten sind sichtbar, wenn der Anwender die Seite betrachtet, dann zeigt jede Platzhalter-Karte Bereiche für Namenszeile, Adresse, Status, vier Kennzahlen und eine Fußzeile mit drei Werten, in derselben Anordnung wie eine Verkäuferkarte. · Aussage
- **AC-08** Gegeben Platzhalter-Karten sind sichtbar, wenn der Anwender Suchfeld, Sortierung, Statusfilter oder „+ Neu" benutzt, dann reagieren diese Bedienelemente wie sonst, und das Suchfeld behält beim Tippen den Fokus. · Aussage
- **AC-09** Gegeben Platzhalter-Karten sind sichtbar, wenn das Laden der Verkäufer fehlschlägt, dann verschwinden die Platzhalter und die Seite verhält sich wie vor dieser Änderung, ohne neue Fehlermeldung. · Aussage
- **AC-10** Gegeben Platzhalter-Karten sind sichtbar, wenn ein Screenreader die Seite vorliest, dann meldet er „Verkäufer werden geladen", und dieser Hinweis entfällt zusammen mit den Platzhaltern. · Aussage

## Entscheidungen
- **W · Wann Platzhalter** · Aussage — Erstes Öffnen sowie komplett neu geholte Liste bei Änderung von Suche, Sortierung oder Statusfilter; nicht bei Aktualisierung nach Speichern, Löschen, Freigabe und nicht beim Nachladen am Listenende.
- **W · Anzahl** · Aussage — Feste Zahl von 6 Platzhalter-Karten.
- **W · Aussehen** · Aussage — Platzhalter bilden die Verkäuferkarte nach (Namenszeile, Adresse, Status, vier Kennzahlen, Fußzeile).
- **W · Filterleiste beim Laden** · Aussage — Bleibt unverändert bedienbar.
- **W · Fehlerfall** · Aussage — Platzhalter verschwinden, Verhalten wie heute; eine Fehleranzeige ist ein eigenes Thema.
- **W · Screenreader** · Aussage — Hinweis „Verkäufer werden geladen" solange die Platzhalter stehen.
- **F · Soll-Vorgaben** — geändert — Vorschlag 1: Die Soll-Vorgabe zu Framework und Werkzeugen der Platzhalter ist ersatzlos gestrichen; sie beschrieb das Wie statt des beobachtbaren Verhaltens, die Umsetzung wählt der Plan.
