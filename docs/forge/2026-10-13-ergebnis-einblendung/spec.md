# Ergebnis-Einblendung bei Verkauf, Freigeben und Zurückgeben

Status: bestätigt am 2026-10-13
Art: verankert
Basis: 74e5302d

## Was, wie, wo, warum
Das Kassenpersonal der Haupt-App soll nach jeder Artikelnummer-Eingabe sofort und ohne Blick auf einen Text erkennen, wie die Eingabe ausgegangen ist. Dafür gibt es die Ergebnis-Einblendung: ein großes Icon, das über der Arbeitsfläche einblendet, kurz steht und wieder ausblendet, begleitet von einem Ton und einer Vibration. · Aussage

Sie wird an drei Stellen eingesetzt: auf der Verkauf-Seite (Fläche: die gesamte Verkauf-Seite) sowie in den Dialogen „Artikel freigeben" und „Artikel zurückgeben" (Fläche: der Dialog-Inhalt mit Eingabefeld, Liste bzw. Kamerabild). · Aussage

Heute gibt es eine Rückmeldung nur im Kamera-Modus der beiden Dialoge (Ring-Countdown mit Ton und Vibration). In Tastatur- und Numpad-Modus erscheint nur der Text „Artikel nicht bekannt", auf der Verkauf-Seite nur die Infofläche mit Text. · Git

Die Ergebnis-Einblendung ist ein eigenständiger, wiederverwendbarer Baustein, der selbst keine fachliche Entscheidung trifft: Verkauf-Seite und Dialoge bestimmen, welches Ergebnis gemeldet wird. · Aussage

## Theoretisches Verhalten nach Umsetzung
Es gibt vier Ergebnisse: roter X (fehlgeschlagen), grüner Haken (erfolgreich), gelber Haken (Zustand ist bereits erreicht, z. B. bereits freigegeben, bereits zurückgegeben, bereits im Warenkorb) und grüner Einkaufswagen (Artikel in den Warenkorb übernommen). · Aussage

Verkauf-Seite: Ein verkaufbarer Artikel ergibt nach dem ersten Enter den grünen Haken, das Übernehmen in den Warenkorb (zweites Enter) den grünen Einkaufswagen. Rot ergeben unbekannte Nummer, noch nicht freigegebener Artikel, bereits verkaufter Artikel, an den Verkäufer zurückgegebener Artikel und ein Such-Fehler (Netz/Server). Gelb ergibt ein Artikel, der schon im Warenkorb liegt. Die Farbe folgt damit der Infofläche. · Aussage

Dialoge „Artikel freigeben" und „Artikel zurückgeben": Grün (Haken) ergibt ein Artikel des gewählten Verkäufers, der erfasst bzw. zurückgegeben wird; beim Freigeben schon beim Erfassen in der Sitzung, nicht erst beim Buchen. Gelb (Haken) ergibt beim Freigeben ein bereits freigegebener Artikel (auch wenn er inzwischen verkauft oder zurückgegeben ist) oder ein in dieser Sitzung schon erfasster Artikel, beim Zurückgeben ein bereits zurückgegebener Artikel. Rot (X) ergeben unbekannte Nummer, Artikel eines anderen Verkäufers, beim Zurückgeben ein noch nicht freigegebener oder bereits verkaufter Artikel, und ein Such-Fehler. · Aussage

In den Dialogen löst jeder Eingabeweg die Einblendung aus: Tastatur-Enter, Numpad-Bestätigung, Kamera-Scan und Klick auf einen Listeneintrag. · Aussage

Ablauf: 500 ms einblenden, 500 ms voll sichtbar, 500 ms ausblenden, insgesamt fest 1,5 s, unabhängig von der Scanner-Pause der App-Einstellungen. · Aussage

Ton und Vibration laufen mit jeder Einblendung, überall und in jedem Eingabeweg. Grüner Haken und grüner Einkaufswagen: Ping von 880 auf 1320 Hz und Vibration 1 × 100 ms. Roter X: Zonk von 180 auf 120 Hz und Vibration 80/60/80 ms. Gelber Haken: zwei kurze Töne à 80 ms mit 1000 Hz bei 60 ms Pause und Vibration 2 × 60 ms. · Aussage

Löst eine neue Eingabe eine Einblendung aus, während eine läuft, bricht die laufende samt Ton und Vibration sofort ab, und die neue startet von vorn. · Aussage

Die Einblendung blockiert keine Eingabe: Tippen, Scannen und Klicken funktionieren währenddessen wie sonst. · Aussage

Die Infofläche der Verkauf-Seite und der Text „Artikel nicht bekannt" im Dialog bleiben unverändert bestehen. · Aussage

Im Kamera-Modus der Dialoge entfällt der Ring-Countdown. Ton und Vibration kommen jetzt aus der Einblendung. Die Scan-Pause der App-Einstellungen, die dasselbe Bild nicht mehrfach auswertet, bleibt unverändert. · Aussage

Für Screenreader meldet die Einblendung eine Textmeldung. Bei der Systemeinstellung „Bewegung reduzieren" ändert sich nichts. · Aussage

## Soll-Vorgaben
- Die Einblendung zeigt nur das Icon, zentriert, ohne Hochskalieren und ohne getönten Schleier; der Inhalt dahinter bleibt sichtbar. · Aussage
- Zeiten sind fest: 500 ms, 500 ms, 500 ms. · Aussage
- Ton und Vibration sind nicht abschaltbar; es gibt dafür keine Einstellung. · Aussage
- Vibration läuft nur auf Geräten, die sie unterstützen. · Historie
- Die Dialoge müssen künftig „bereits freigegeben bzw. zurückgegeben" von „unbekannt" unterscheiden können. · Aussage
- Die Einblendung gilt nur für die genannten drei Stellen der Haupt-App. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben die Verkauf-Seite, wenn der Anwender Enter auf der Nummer eines verkaufbaren Artikels drückt, dann erscheint ein grüner Haken. · Aussage
- **AC-02** Gegeben ein gefundener, verkaufbarer Artikel, wenn der Anwender mit Enter übernimmt, dann erscheint ein grüner Einkaufswagen und der Artikel liegt im Warenkorb. · Aussage
- **AC-03** Gegeben die Verkauf-Seite, wenn der Anwender Enter auf einer unbekannten Nummer drückt, dann erscheint ein roter X. · Aussage
- **AC-04** Gegeben die Verkauf-Seite, wenn der Anwender Enter auf der Nummer eines noch nicht freigegebenen, eines bereits verkauften oder eines an den Verkäufer zurückgegebenen Artikels drückt, dann erscheint jeweils ein roter X. · Aussage
- **AC-05** Gegeben die Verkauf-Seite und ein nicht erreichbarer Server, wenn der Anwender Enter auf einer Nummer drückt, dann erscheint ein roter X. · Aussage
- **AC-06** Gegeben ein Artikel liegt bereits im Warenkorb, wenn der Anwender Enter auf dessen Nummer drückt, dann erscheint ein gelber Haken und der Artikel wird nicht ein zweites Mal übernommen. · Aussage
- **AC-07** Gegeben der Dialog „Artikel freigeben" für Verkäufer A, wenn der Anwender die Nummer eines noch nicht freigegebenen Artikels von A erfasst, dann erscheint ein grüner Haken, noch bevor gebucht wird. · Aussage
- **AC-08** Gegeben der Dialog „Artikel freigeben" für Verkäufer A, wenn der Anwender die Nummer eines bereits freigegebenen Artikels von A erfasst (auch wenn er inzwischen verkauft oder zurückgegeben ist), dann erscheint ein gelber Haken. · Aussage
- **AC-09** Gegeben der Dialog „Artikel freigeben" mit einem in dieser Sitzung schon erfassten Artikel, wenn der Anwender dieselbe Nummer erneut erfasst, dann erscheint ein gelber Haken. · Aussage
- **AC-10** Gegeben der Dialog „Artikel freigeben" für Verkäufer A, wenn der Anwender eine unbekannte Nummer oder die Nummer eines Artikels eines anderen Verkäufers erfasst, dann erscheint ein roter X. · Aussage
- **AC-11** Gegeben der Dialog „Artikel zurückgeben" für Verkäufer A, wenn der Anwender die Nummer eines freigegebenen, noch nicht verkauften Artikels von A erfasst, dann erscheint ein grüner Haken und der Artikel ist zurückgegeben. · Aussage
- **AC-12** Gegeben der Dialog „Artikel zurückgeben" für Verkäufer A, wenn der Anwender die Nummer eines bereits zurückgegebenen Artikels von A erfasst, dann erscheint ein gelber Haken. · Aussage
- **AC-13** Gegeben der Dialog „Artikel zurückgeben" für Verkäufer A, wenn der Anwender eine unbekannte Nummer, die Nummer eines Artikels eines anderen Verkäufers, eines noch nicht freigegebenen oder eines bereits verkauften Artikels erfasst, dann erscheint jeweils ein roter X. · Aussage
- **AC-14** Gegeben einer der beiden Dialoge und ein nicht erreichbarer Server, wenn der Anwender eine Nummer erfasst, dann erscheint ein roter X. · Aussage
- **AC-15** Gegeben einer der Dialoge „Artikel freigeben" bzw. „Artikel zurückgeben" und ein Artikel des Verkäufers, der erfasst bzw. zurückgegeben werden kann (beim Freigeben: noch nicht freigegeben; beim Zurückgeben: freigegeben und nicht verkauft), wenn der Anwender die Nummer per Tastatur-Enter, per Numpad-Bestätigung, per Klick auf den Listeneintrag oder per Kamera-Scan bestätigt, dann erscheint in beiden Dialogen auf jedem dieser Wege ein grüner Haken. · Aussage
- **AC-16** Gegeben eine Einblendung ist sichtbar, wenn der Anwender die Verkauf-Seite bzw. den Dialog betrachtet, dann steht das Icon horizontal und vertikal zentriert über der Fläche (Verkauf: ganze Seite mit Eingabespalte und Warenkorb; Dialog: Dialog-Inhalt), ohne Schleier, und der Inhalt dahinter bleibt lesbar. · Aussage
- **AC-17** Gegeben eine Einblendung startet bei 0 ms, wenn 1,5 s vergehen, dann ist das Icon von 0 bis 500 ms von unsichtbar auf voll sichtbar eingeblendet, von 500 bis 1000 ms voll sichtbar und von 1000 bis 1500 ms wieder ausgeblendet; danach ist nichts mehr sichtbar. · Aussage
- **AC-18** Gegeben eine Einblendung läuft seit 700 ms, wenn eine neue Eingabe ein Ergebnis liefert, dann ist die laufende Einblendung samt Ton und Vibration sofort beendet und die neue beginnt bei 0 ms. · Aussage
- **AC-19** Gegeben eine Einblendung ist sichtbar, wenn der Anwender in das Eingabefeld tippt oder auf eine Zeile im Warenkorb klickt, dann wird die Eingabe wie ohne Einblendung angenommen. · Aussage
- **AC-20** Gegeben die Verkauf-Seite und eine unbekannte Nummer, wenn der Anwender Enter drückt, dann zeigt die Infofläche weiterhin den Text zur unbekannten Nummer und zusätzlich erscheint der rote X. · Aussage
- **AC-21** Gegeben einer der Dialoge im Tastatur-Modus, wenn der Anwender eine unbekannte Nummer eingibt, dann bleibt der Text „Artikel nicht bekannt" sichtbar und zusätzlich erscheint der rote X. · Aussage
- **AC-22** Gegeben einer der Dialoge im Kamera-Modus, wenn ein Barcode erkannt wird, dann erscheint die Einblendung und es gibt keinen Ring-Countdown mehr. · Aussage
- **AC-23** Gegeben der Kamera-Modus eines Dialogs mit einer Scan-Pause von 3 s, wenn derselbe Barcode weiter im Bild bleibt, dann wird er innerhalb dieser Pause nicht erneut ausgewertet. · Aussage
- **AC-24** Gegeben ein Gerät mit Ton, wenn ein grüner Haken oder ein grüner Einkaufswagen erscheint, dann ertönt ein Ping von 880 auf 1320 Hz und das Gerät vibriert einmal 100 ms, sofern es Vibration unterstützt. · Aussage
- **AC-25** Gegeben ein Gerät mit Ton, wenn ein roter X erscheint, dann ertönt ein Zonk von 180 auf 120 Hz und das Gerät vibriert 80 ms, 60 ms Pause, 80 ms, sofern es Vibration unterstützt. · Aussage
- **AC-26** Gegeben ein Gerät mit Ton, wenn ein gelber Haken erscheint, dann ertönen zwei Töne à 80 ms mit 1000 Hz bei 60 ms Pause und das Gerät vibriert 2 × 60 ms, sofern es Vibration unterstützt. · Aussage
- **AC-27** Gegeben ein Gerät ohne Vibration oder ohne Ton, wenn eine Einblendung erscheint, dann erscheint sie sichtbar und ohne Fehlermeldung, nur ohne die fehlende Rückmeldung. · Aussage
- **AC-28** Gegeben ein Screenreader, wenn eine Einblendung erscheint, dann meldet er „Fehlgeschlagen" beim roten X, „Erfolgreich" beim grünen Haken, „Bereits erledigt" beim gelben Haken und „Im Warenkorb" beim grünen Einkaufswagen, ohne den Eingabefokus zu verlieren. · Aussage
- **AC-29** Gegeben die Systemeinstellung „Bewegung reduzieren" ist aktiv, wenn eine Einblendung erscheint, dann läuft sie mit demselben Ablauf wie in AC-17. · Aussage

## Entscheidungen
- **W · Anlass** · Aussage — Bei falscher Artikelnummer ein großes rotes X über die Verkaufsfläche, 500 ms stehend, insgesamt 1,5 s; bei gültiger Nummer ein grüner Haken, beim Übernehmen in den Warenkorb ein grüner Einkaufswagen; als eigene wiederverwendbare Komponente ohne eigene Logik.
- **W · Reichweite** · Aussage — Zusätzlich beim Freigeben und beim Zurückgeben: roter X bei Fehler, grüner Haken bei Erfolg, gelber Haken bei bereits zurückgegeben bzw. bereits freigegeben.
- **W · Verkauf-Farben** · Aussage — Die Farbe folgt der Infofläche: Fehler rot, „bereits im Warenkorb" gelb, Treffer grün.
- **W · Infofläche bleibt** · Aussage — Infofläche und Dialog-Text bleiben bestehen, die Einblendung kommt zusätzlich.
- **W · Haken und Wagen** · Aussage — Grüner Haken beim ersten Enter (Treffer), grüner Einkaufswagen beim Übernehmen (zweites Enter).
- **W · Folge-Einblendung** · Aussage — Eine neue Einblendung bricht die laufende ab und startet von vorn.
- **W · Nicht blockierend** · Aussage — Die Einblendung blockiert keine Eingaben.
- **W · Optik** · Aussage — Nur das Icon, zentriert, ohne Schleier und ohne Hochskalieren.
- **W · Zeitablauf** · Aussage — Fest 500/500/500 ms, mit Screenreader-Text; Bewegung reduzieren ändert nichts.
- **W · Begriff** · Aussage — „Ergebnis-Einblendung", abgegrenzt vom Scan-Feedback.
- **W · Fläche im Dialog** · Aussage — Die Einblendung liegt über dem Dialog-Inhalt.
- **W · Eingabewege** · Aussage — Jeder Eingabeweg löst die Einblendung aus.
- **W · Kamera-Feedback** · Aussage — Ring-Countdown entfällt, Ton und Vibration bleiben, Einblendung fest 1,5 s, Scan-Pause der App-Einstellung bleibt.
- **W · Gelb/Rot in Dialogen** · Aussage — Aufteilung wie unter „Theoretisches Verhalten".
- **W · Grün beim Freigeben** · Aussage — Der grüne Haken erscheint schon beim Erfassen in der Sitzung.
- **W · Ton und Vibration überall** · Aussage — Optisches, akustisches und haptisches Feedback gemeinsam, auf Verkauf-Seite und in beiden Dialogen.
- **W · Muster je Ergebnis** · Aussage — Grün und Wagen wie heutiger Erfolgs-Ping, Rot wie heutiger Zonk, Gelb eigenes neutrales Muster.
- **W · Nicht abschaltbar** · Aussage — Ton und Vibration laufen immer, ohne Einstellung.
- **W · Abbruch von Ton** · Aussage — Ton und Vibration brechen bei einer neuen Einblendung mit ab.
- **W · Bewegung reduzieren** · Aussage — Es ändert sich nichts, der Fade bleibt.
- **R1 · AC-15** — geändert — Klarstellung: Die Spec legt unter „Theoretisches Verhalten" und in der Entscheidung zu den Eingabewegen bereits fest, dass in beiden Dialogen jeder Eingabeweg die Einblendung auslöst; das Kriterium prüft das jetzt auch für den Dialog „Artikel zurückgeben" (bevorzugter Vorschlag 1).
