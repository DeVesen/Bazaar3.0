---
id: C-024
status: reviewed
reviewed-date: 2026-08-17
---

# Component: InputNumber

**Bibliothek:** `p-inputnumber`
**Verwendung:** Beide Apps — überall, wo Geldbeträge, Prozentsätze oder Stückzahlen eingegeben werden

## Index
- Überblick — Konzept
- 1. Varianten — Geld, Prozent, Anzahl
- 2. Konventionen — Locale, Dezimalstellen
- 3. Fehlerdarstellung — Wertebereiche
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Zahleneingabe mit deutscher Formatierung und festen Dezimalstellen-Regeln je Verwendungszweck.

---

## Überblick

Eigene Beschreibung, weil an dieser Komponente eine **Projektkonvention** hängt, die sonst an fünf Stellen wiederholt würde: deutsche Locale, feste Dezimalstellen, und wer die Wertebereiche prüft.

Ein `pInputText type="number"` ist **kein** Ersatz: Es liefert Punkt statt Komma als Dezimaltrennzeichen und akzeptiert `e`-Notation.

---

## 1. Varianten

| Variante | Konfiguration | Beispiele |
|---|---|---|
| **Geld** | `mode="decimal"` `locale="de-DE"` `[minFractionDigits]="2"` `[maxFractionDigits]="2"` | Preis, Gebühr je Stück, Auszahlungsbetrag, „Betrag erhalten" |
| **Prozent** | `mode="decimal"` `locale="de-DE"` `[minFractionDigits]="0"` `[maxFractionDigits]="2"` `suffix=" %"` | Provision |
| **Anzahl** | `mode="decimal"` `[useGrouping]="false"` `[minFractionDigits]="0"` `[maxFractionDigits]="0"` | Artikelnummer, Blockgröße, Anzeigedauer in ms |

Bei **Geld** immer zwei Dezimalstellen anzeigen, auch bei glatten Beträgen (`12,00 €` statt `12 €`) — sonst wirken Beträge in einer Spalte unterschiedlich lang und lassen sich schlechter vergleichen.

Ein `€`- oder `%`-Zeichen erscheint als **Add-on** über [`input-group`](../input-group/component.md), nicht als `prefix`/`suffix` im Feld selbst — Ausnahme ist die Prozent-Variante, wo das Zeichen direkt am Wert klebt.

---

## 2. Konventionen

- **Locale immer `de-DE`** — Komma als Dezimaltrennzeichen, Punkt als Tausendertrennzeichen
- **Kein `[showButtons]`** (Spinner-Pfeile): Am Touch-Gerät sind sie zu klein, und für schnelle Eingabe am Annahmetisch ist Tippen schneller als Klicken
- **Keine Tausendertrennung bei Nummern** (`[useGrouping]="false"`) — eine Artikelnummer ist kein Betrag; `1.043` wäre irreführend
- Für touch-freundliche Zahleneingabe ohne native Tastatur gibt es den [`numpad`](../numpad/component.md); er ersetzt dieses Feld nicht, sondern füttert es

---

## 3. Fehlerdarstellung

Wertebereiche werden **serverseitig** geprüft und als Feldfehler zurückgegeben (`400` mit `errors`-Dictionary). Das Feld darf `[min]`/`[max]` zusätzlich setzen, aber die Prüfung im Formular ist Bequemlichkeit, nicht Regel — ein Formular lässt sich umgehen, der Handler nicht.

Darstellung des Fehlers wie bei [`input`](../input/component.md): Meldung unter dem Feld, Feld selbst mit Fehler-Rahmen.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL alle Geldfelder mit `locale="de-DE"` und genau zwei Dezimalstellen anzeigen, auch bei glatten Beträgen.
2. **AC-2** — THE SYSTEM SHALL bei Nummern-Feldern keine Tausendertrennung anwenden.
3. **AC-3** — THE SYSTEM SHALL Spinner-Buttons nicht anzeigen.
4. **AC-4** — WHEN das Backend einen Wertebereichsfehler liefert, THEN SHALL das System die Meldung unter dem Feld anzeigen.

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #component #inputnumber #geld #prozent #primeng
