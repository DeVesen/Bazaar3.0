# Sofort-Freigabe im Freigeben-Popup bei Verkäufern ohne Gebühr

Status: bestätigt am 2026-10-19
Art: verankert
Basis: daf2f1d6

## Was, wie, wo, warum
In den Basis-Einstellungen der Haupt-App gibt es einen neuen Schalter „Artikel erst beim Schließen des Freigabe-Dialogs freigeben". Er steuert, wann das Freigeben-Popup einen erfassten Artikel freigibt. Heute sammelt das Popup erfasste Artikel und gibt sie erst beim Schließen in einem Vorgang frei; bei einer Gebühr je Stück größer 0 kommt vorher der Bezahlen-Dialog. · Historie
Die Annahmegebühr ist die Gebühr je Stück des Verkäufers; „ohne Gebühr" heißt Gebühr je Stück gleich 0. · Aussage
Der Schalter wirkt nur bei Verkäufern, deren Gebühr je Stück 0 beträgt. Dort entfällt der Bezahlen-Dialog schon heute. Ist der Schalter ausgeschaltet, wird ein erfolgreich erfasster Artikel sofort freigegeben. · Aussage
Der Schalter gilt für alle Geräte und wird zentral gespeichert. · Aussage

## Theoretisches Verhalten nach Umsetzung
Schalter an (Standard): Das Freigeben-Popup verhält sich wie heute. · Aussage
Schalter aus, Verkäufer mit Gebühr je Stück 0: Jeder erfolgreich erfasste Artikel ist sofort freigegeben und erscheint nicht mehr in der Auswahlliste des Popups. Beim Schließen entfällt der Bezahlen-Dialog; ein Abgabe-Beleg mit allen in der Sitzung freigegebenen Artikeln wird einmal gedruckt, sofern mindestens ein Artikel freigegeben wurde. · Aussage
Verkäufer mit Gebühr je Stück größer 0: Der Schalter hat keine Wirkung, es gilt das Verhalten von heute (sammeln, Bezahlen-Dialog, dann freigeben). · Aussage
Schlägt die Freigabe eines Artikels im Sofort-Modus fehl, zeigt das Popup die rote Ergebnis-Einblendung; der Artikel gilt nicht als freigegeben. · Aussage

## Soll-Vorgaben
- Der Schalter betrifft nur das Freigeben-Popup, nicht die Artikelannahme. · Aussage
- Nur Admins können den Schalter ändern, wie alle Einstellungen. · Historie
- Standardstellung ist „an" (Verhalten wie heute). · Aussage
- Der Schalter wird erst über „Speichern" im Formular der Basis-Einstellungen wirksam. · Aussage
- Eine gespeicherte Änderung gilt auf jedem Gerät ab dem nächsten Öffnen des Freigeben-Popups, ohne dass die App neu geladen werden muss. · Aussage
- Der Hilfetext am Schalter lautet „Gilt nur für Verkäufer ohne Gebühr." · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben ein Admin und eine Installation, in der der Schalter nie gespeichert wurde, wenn er die Basis-Einstellungen öffnet, dann zeigt die Seite den Schalter „Artikel erst beim Schließen des Freigabe-Dialogs freigeben" eingeschaltet mit dem Hilfetext „Gilt nur für Verkäufer ohne Gebühr.". · Aussage
- **AC-02** Gegeben der Schalter ist eingeschaltet gespeichert, wenn der Admin ihn ausschaltet und „Speichern" wählt, dann ist er nach erneutem Öffnen der Basis-Einstellungen ausgeschaltet. · Aussage
- **AC-03** Gegeben der Admin hat den Schalter umgelegt, aber nicht gespeichert, wenn er die Basis-Einstellungen neu lädt, dann zeigt der Schalter die zuletzt gespeicherte Stellung. · Aussage
- **AC-04** Gegeben der Schalter ist gespeichert ausgeschaltet und der Verkäufer hat Gebühr je Stück 0, wenn im Freigeben-Popup die Nummer eines noch nicht freigegebenen Artikels erfolgreich erfasst wird, dann ist der Artikel sofort freigegeben und erscheint nicht mehr in der Auswahlliste des Popups. · Aussage
- **AC-05** Gegeben der Schalter ist eingeschaltet und der Verkäufer hat Gebühr je Stück 0, wenn im Freigeben-Popup ein Artikel erfolgreich erfasst wird, dann ist er erst nach dem Schließen des Popups freigegeben. · Aussage
- **AC-06** Gegeben der Schalter ist ausgeschaltet und der Verkäufer hat Gebühr je Stück größer 0, wenn im Freigeben-Popup ein Artikel erfolgreich erfasst wird, dann ist er noch nicht freigegeben, und erst nach dem Bezahlen beim Schließen. · Aussage
- **AC-07** Gegeben der Schalter ist ausgeschaltet, der Verkäufer hat Gebühr je Stück 0 und drei Artikel wurden in dieser Sitzung freigegeben, wenn das Popup geschlossen wird, dann erscheint kein Bezahlen-Dialog und genau ein Abgabe-Beleg mit diesen drei Artikeln wird gedruckt. · Aussage
- **AC-08** Gegeben der Schalter ist ausgeschaltet und der Verkäufer hat Gebühr je Stück 0, wenn das Popup ohne erfassten Artikel geschlossen wird, dann wird kein Abgabe-Beleg gedruckt. · Aussage
- **AC-09** Gegeben der Schalter ist ausgeschaltet, der Verkäufer hat Gebühr je Stück 0 und der erfasste Artikel wurde inzwischen von anderer Stelle freigegeben, wenn die Nummer erfasst wird, dann erscheint die rote Ergebnis-Einblendung und der Artikel zählt nicht zum Abgabe-Beleg dieser Sitzung. · Aussage
- **AC-10** Gegeben der Admin hat den Schalter auf einem Gerät gespeichert, wenn auf einem anderen Gerät das Freigeben-Popup neu geöffnet wird, dann gilt dort die neue Stellung, ohne dass die App neu geladen wurde. · Aussage
- **AC-11** Gegeben ein angemeldeter Nutzer mit Rolle Kassenpersonal, wenn er die Einstellungen aufruft, dann hat er keinen Zugriff auf den Schalter. · Historie

## Entscheidungen
- **W · Reichweite** · Aussage — Schalter nur im Freigeben-Popup, nicht in der Artikelannahme; nur für Verkäufer ohne Gebühr, bei Gebühr über 0 bleibt das heutige Verhalten.
- **W · Polarität, Text, Standard (Q8)** · Aussage — Schalter an = Freigabe beim Schließen, aus = sofort; Standard an; Text „Artikel erst beim Schließen des Freigabe-Dialogs freigeben".
- **W · Wirkung auf Geräte (Q9)** · Aussage — gilt ab dem nächsten Öffnen des Freigeben-Popups.
- **W · Speichern (Q10)** · Aussage — erst über „Speichern" im Formular.
- **W · Hilfetext (Q11)** · Aussage — „Gilt nur für Verkäufer ohne Gebühr."
- **W · Fehler beim Sofort-Freigeben (Q12)** · Aussage — rote Ergebnis-Einblendung, Artikel gilt nicht als freigegeben.
- **W · Abgabe-Beleg (Q13)** · Aussage — einmal beim Schließen mit allen freigegebenen Artikeln, sofern mindestens einer.
- **W · Begriffe** · Aussage — Freigeben-Popup und Annahmegebühr statt Freigabedialog und Abgabegebühr; im UI-Text des Schalters bleibt „Freigabe-Dialog".
- **F · AC-04** — geändert — Vorschlag 1: Im Abschnitt „Was, wie, wo, warum" festgelegt, dass die Annahmegebühr die Gebühr je Stück des Verkäufers ist und „ohne Gebühr" Gebühr je Stück gleich 0 heißt; Beschreibung, Verhalten und alle Akzeptanzkriterien sprechen jetzt durchgehend von „Gebühr je Stück" (0 bzw. größer 0). Der Hilfetext „Gilt nur für Verkäufer ohne Gebühr." bleibt als UI-Text unverändert; die W-Einträge bleiben unberührt.
