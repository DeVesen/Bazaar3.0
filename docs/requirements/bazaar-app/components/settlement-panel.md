---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: settlement-panel

**Bibliothek:** [`modal`](../../../components/modal/component.md) + [`button`](../../../components/button/component.md) + [`confirmdialog`](../../../components/confirmdialog/component.md)
**Verwendung:** Nur Haupt-App — Abrechnen-Popup ([Epic_Abrechnung](../epics/Epic_Abrechnung/epic.md) Abschnitt 4)

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Posten — Zeilen und Stil
- 3. Rundung — Reihenfolge
- 4. Keine Gebühr im Abzug — Begründung
- 5. Nicht abgegebene Artikel — Hinweis vor dem Buchen
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Abschluss-Popup der Abrechnung: drei Posten, ein Betrag, eine Buchung.

---

## Überblick

Das Panel ist der Moment, in dem Bargeld den Besitzer wechselt. Alles darin dient einem Zweck: Der Verkäufer soll die Rechnung nachvollziehen können, bevor er das Geld nimmt.

Genau **drei Zeilen** — mehr wäre Erklärungsbedarf, weniger würde die Provision verstecken.

---

## 1. ASCII-Darstellung

```
┌──────────────────────────────────────────────────┐
│  Abrechnung — Anna Meier                    [✕]  │
├──────────────────────────────────────────────────┤
│  Umsatz (31 verkaufte Artikel)          380,50 € │
│  Provision (12,5 %)                    − 47,56 € │
│  ────────────────────────────────────────────────│
│  Auszahlung an Verkäufer                332,94 € │
│                                                   │
│  ℹ Annahmegebühr 20,00 € wurde bereits           │
│    am Annahmetisch bezahlt.                       │
│                                                   │
│  ⚠ 10 nicht abgegebene Artikel werden entfernt.  │
├──────────────────────────────────────────────────┤
│                        [Abbrechen]  [Buchen]      │
└──────────────────────────────────────────────────┘
```

Modal `sm`.

---

## 2. Posten

| Element | Stil |
|---|---|
| Postenzeile | flex `space-between`, padding 7 px 0, 15 px, `border-bottom: 1 px #f2f4f6` |
| Provisions-Betrag | in danger-Farbe, mit `−`-Vorzeichen |
| Total-Zeile | `border-top: 2 px`, kein `border-bottom`, mt 8 px, pt 10 px; Betrag in success-Farbe, 18 px, 700 |
| Hinweiszeilen | 13 px, muted; die Warnung zu entfernten Artikeln in warn-Farbe |

**Maßgeblich ist `salesCommission` des Verkäufers**, nicht der aktuelle Wert seines Typs — der Typ hat das Feld nur belegt und kann sich seither geändert haben. Der Prozentsatz steht in der Zeile, damit die Zahl nachrechenbar ist.

Die Anzahl verkaufter Artikel gehört in die Umsatzzeile: „380,50 €" allein lässt sich nicht prüfen, „31 verkaufte Artikel, 380,50 €" schon.

---

## 3. Rundung

Verbindliche Reihenfolge, **genau eine** Rundung:

1. Umsatz aufsummieren — bereits centgenau
2. Provision berechnen und **kaufmännisch auf 2 Dezimalstellen** runden
3. Auszahlung = Umsatz − gerundete Provision

Bei 380,50 € und 12,5 % ergibt die Provision 47,5625 € → **47,56 €**, Auszahlung **332,94 €**. Weil die Auszahlung die Differenz zweier centgenauer Beträge ist, geht sie immer glatt auf.

Am Ende zu runden statt bei der Provision würde Anzeige und Ausdruck um einen Cent auseinanderlaufen lassen — und dann steht der Verkäufer davor und rechnet nach.

Kein Runden auf 5 Cent: Ein-Cent-Münzen existieren, und ein aufgerundeter Cent zu Lasten des Verkäufers ist unnötig erklärungsbedürftig.

---

## 4. Keine Gebühr im Abzug

Die Annahmegebühr erscheint als **Hinweiszeile**, nicht als Postenzeile. Sie wurde am Annahmetisch in bar bezahlt und steht als `intakeFeePaid` am Verkäufer.

Sie hier abzuziehen würde bedeuten, dass der Verkäufer sie zweimal zahlt — einmal bei der Abgabe und einmal als Abzug von der Auszahlung. Der Hinweis steht trotzdem drin, weil sonst am Tisch genau diese Frage kommt: „Und die Gebühr?"

---

## 5. Nicht abgegebene Artikel

Hat der Verkäufer vorangemeldete Artikel, die er nie gebracht hat (`releasedAt` leer), nennt das Panel **vorher** deren Anzahl. Beim Buchen werden sie entfernt.

Sie haben den Basar nie erreicht, es wurde keine Gebühr für sie kassiert und keine Auszahlung berührt sie — sie zu behalten würde Badge und Statistik dauerhaft mit Karteileichen belasten. Der Datensatz existiert weiterhin in der Voranmelde-App.

**„Buchen"** setzt `settledAt` und `payoutAmount`, entfernt diese Artikel und sperrt den Verkäufer — alles in einer Transaktion. Danach ist der Weg zurück ausschließlich das Stornieren über die Verkäufer-Karte (Admin-only).

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL genau drei Posten anzeigen: Umsatz, Provision, Auszahlung.
2. **AC-2** — THE SYSTEM SHALL in der Umsatzzeile die Anzahl verkaufter Artikel und in der Provisionszeile den Prozentsatz nennen.
3. **AC-3** — THE SYSTEM SHALL die Provision kaufmännisch auf 2 Dezimalstellen runden und die Auszahlung als Differenz berechnen; eine weitere Rundung SHALL nicht erfolgen.
4. **AC-4** — THE SYSTEM SHALL die bereits bezahlte Annahmegebühr als Hinweis anzeigen und **nicht** als Abzugsposten verrechnen.
5. **AC-5** — IF der Verkäufer Artikel mit leerem `releasedAt` hat, THEN SHALL das Panel deren Anzahl vor dem Buchen nennen.
6. **AC-6** — WHEN „Buchen" geklickt wird, THEN SHALL das System `settledAt` und den ausgezahlten Betrag setzen und die nicht abgegebenen Artikel in derselben Transaktion entfernen.
7. **AC-7** — THE SYSTEM SHALL für die Provision `salesCommission` des Verkäufers verwenden, nicht den aktuellen Wert seines Typs.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #abrechnung #auszahlung #rundung #haupt-app
