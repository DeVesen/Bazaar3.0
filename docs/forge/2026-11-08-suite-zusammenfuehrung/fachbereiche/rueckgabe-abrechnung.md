# Fachbereich Rückgabe und Abrechnung – Übergabe zurück an den Verkäufer

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [artikel-lebenszyklus](../querschnitt/artikel-lebenszyklus.md) · [druck-etiketten](druck-etiketten.md) · [datenfluesse](../querschnitt/datenfluesse.md)
Entscheidungen: E5b, E6, E9, E18
Schlagworte: Rückgabe, Rückgabe-Scan, Abrechnung, Auszahlung, Provision, Beleg, vorläufiger Beleg, Verlust, Spende, Abholfrist, Abholung durch Dritte, Datenfluss

## Zweck und Abgrenzung

Nach Verkaufsende: Unverkaufte Artikel gehen **durch die Rückgabe** zurück an den Verkäufer, und die Abrechnung
schließt die Teilnahme ab. Die Verantwortung wechselt zurück zum Verkäufer (L2).

## Heute

Haupt-App: [`Epic_Abrechnung`](../../../requirements/bazaar-app/epics/Epic_Abrechnung/epic.md).

1. Vorläufigen Beleg drucken.
2. Artikel einsammeln und per Rückgabe-Scan zurückgeben.
3. Abrechnung, erst wenn nichts mehr im Verkauf ist. Auszahlung = Umsatz − Provision.

Nicht abgegebene Artikel werden standardmäßig **gelöscht** (V3). Danach ist alles gesperrt.

## Ziel

### Rückgabe

1. Verkäufer identifizieren (QR, Nummer, Name).
2. Der vorläufige Beleg zeigt verkaufte Artikel und die einzusammelnden unverkauften.
3. **Rückgabe-Scan** je Artikel → „Zurückgegeben“. Der Artikel gehört wieder dem Verkäufer und ist für den nächsten Basar wiederverwendbar (E5b).
4. **Ausnahmen:**
   - „Verlust“ für nicht auffindbare Artikel. Er blockiert die Abrechnung nicht mehr.
   - „Gespendet“, wenn der Verkäufer es wählt oder die Abholfrist abläuft (E18).
5. **Abholung durch Dritte:** Der Abgabe-Beleg mit QR dient als Legitimation, und „abgeholt durch“ wird vermerkt.

### Abrechnung

- Möglich, sobald kein Artikel des Verkäufers mehr „Im Verkauf“ ist.
- **Auszahlung** = Verkaufssumme − Provision, mit den bei der Annahme eingefrorenen Konditionen (E9). Die Annahmegebühr wurde schon bei der Annahme kassiert.
- Nicht abgegebene Artikel werden **markiert, nicht gelöscht**.
- Der Beleg wird gedruckt und erscheint online beim Verkäufer (E6).
- Danach ist die Teilnahme abgeschlossen und unveränderlich. Stornieren darf nur der Admin.

## Datenflüsse: rein / raus

Nummern laut [datenfluesse](../querschnitt/datenfluesse.md). Änderungen an Flüssen werden dort eingetragen, nicht hier.

| Richtung | Flüsse |
|---|---|
| **rein** (nutzt) | D9 Annahme (Konditionen, Gebühr), D12 Kassenvorgänge, D7 Laufkunden |
| **raus** (liefert) | **D14 Rückgabe**, D15 Sicht für den Verkäufer, D11 öffentliche Liste (zurückgegeben → weg), **D16 Abrechnung**, D17 Ergebnis für den Verkäufer |

## Berührungspunkte

- [lebenszyklus](../querschnitt/artikel-lebenszyklus.md): Übergänge Zurückgegeben, Verlust, Gespendet, Nicht abgegeben
- [voranmeldung](voranmeldung.md): Ergebnis und Wiederverwendung
- [druck-etiketten](druck-etiketten.md): Belege
- [statistik-auswertung](statistik-auswertung.md): Auszahlungen, Provisionen

## Offene Fragen

1. Abholfrist und Spende: Was sehen die Basarbedingungen vor (E18)?
2. Auszahlung bar oder per Überweisung (Bankdaten wären neue Personendaten)?
3. Verlust: Wird er ersetzt? Wie geht er in die Abrechnung ein?
4. Rückgabe über mehrere Tage oder Zeitfenster?

## Nächste Planungsschritte

- Ablauf der Rückgabe mit der Orga durchspielen.
- Beleg-Inhalte für den Online-Abruf festlegen.
