# Component: Payment-Panel

**Bibliothek:** PrimeNG-Komposition — `p-inputgroup` + `p-inputnumber`
**Verwendung:** Bazaar Haupt-App — überall dort, wo ein Geldbetrag entgegengenommen und das Rückgeld live berechnet wird.

---

## Überblick

Das Payment-Panel zeigt einen fixen Gesamtbetrag, nimmt den vom Kunden erhaltenen Betrag als Eingabe entgegen und berechnet das Rückgeld live. Es erscheint immer innerhalb eines `p-dialog`.

Beide Verwendungsstellen in der Bazaar-App sind strukturell identisch und unterscheiden sich nur durch Label und Button-Beschriftung:

| Verwendung | `totalLabel` | `confirmLabel` | Gesamtbetrag |
|---|---|---|---|
| Artikelannahme (Speichern-Popup) | „Gesamtgebühr" | „Buchen" | Anzahl Artikel × Gebühr |
| Verkauf (Bezahlpopup) | „Gesamtbetrag" | „Bezahlt" | Summe Warenkorb |

---

## 1. ASCII-Darstellung

```
┌─────────────────────────────────────────────┐
│                                             │
│  Gesamtgebühr                   12,50 €    │  ← totalLabel + totalAmount
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Betrag erhalten                            │
│  ┌──────────────────────────────┬──────┐   │
│  │  20,00                       │  €   │   │
│  └──────────────────────────────┴──────┘   │
│                                             │
│  ╔═════════════════════════════════════╗   │
│  ║                                     ║   │
│  ║           7,50 €                    ║   │  ← Rückgeld (grüne Box, live)
│  ║           Rückgeld                  ║   │
│  ║                                     ║   │
│  ╚═════════════════════════════════════╝   │
│                                             │
│               [Abbrechen]  [Buchen]        │  ← confirmLabel
└─────────────────────────────────────────────┘

Rückgeld-Zustände:
┌──────────────────────────────────────────────────────┐
│ Betrag < Gesamtbetrag  → keine Rückgeld-Box          │
│                        → [Bestätigen]-Button disabled │
│ Betrag = Gesamtbetrag  → Rückgeld: 0,00 €  (grün)   │
│ Betrag > Gesamtbetrag  → Rückgeld: X,XX €  (grün)   │
└──────────────────────────────────────────────────────┘
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `totalLabel` | `string` | `@Input` | Beschriftung der Gesamtbetrag-Zeile (z. B. „Gesamtgebühr") |
| `totalAmount` | `number` | `@Input` | Fixer Gesamtbetrag in Euro |
| `confirmLabel` | `string` | `@Input` | Beschriftung des Bestätigungs-Buttons (z. B. „Buchen", „Bezahlt") |
| `confirmed` | `PaymentConfirmedEvent` | `@Output` | Emittiert bei Bestätigung: `{ totalAmount, receivedAmount, change }` |
| `cancelled` | `void` | `@Output` | Emittiert bei Klick auf „Abbrechen" |

---

## 3. Verhalten

### Rückgeld-Berechnung

`change = receivedAmount − totalAmount` — live bei jeder Eingabe aktualisiert.

- Rückgeld-Box erscheint **nur** wenn `receivedAmount >= totalAmount`
- Ist `receivedAmount < totalAmount`: Box ausgeblendet, `[Bestätigen]`-Button deaktiviert
- Rückgeld wird auf 2 Dezimalstellen gerundet angezeigt

### Fokus beim Öffnen

Das `p-inputnumber`-Feld erhält beim Einblenden automatisch den Fokus (`pAutoFocus`).

### Bestätigen

Klick auf `[confirmLabel]`-Button emittiert `confirmed` und übergibt alle drei Beträge.
Das Panel selbst führt **keine weiteren Aktionen** aus — das Parent entscheidet, was gebucht wird.

### Abbrechen

Klick auf `[Abbrechen]` emittiert `cancelled`. Das Panel setzt die Eingabe zurück.

---

## 4. Layout-Details

| Element | Stil |
|---|---|
| Gesamtbetrag-Zeile | `display: flex; justify-content: space-between; font-weight: 700; font-size: 17px` |
| Trennlinie | `border-top: 2px solid var(--p-content-border-color); margin: 10px 0; padding-top: 10px` |
| InputGroup | `p-inputgroup` mit `€`-Addon rechts, margin-top 16 px |
| Rückgeld-Box | `font-size: 32px; font-weight: 800; text-align: center; padding: 14px; background: #e8f8f0; border-radius: 8px; color: #1a5c38; margin: 12px 0` |
| Footer-Buttons | `display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px` |

---

## 5. PrimeNG-Basis

```
p-inputgroup
  p-inputnumber
    [minFractionDigits]="2"
    [maxFractionDigits]="2"
    pAutoFocus
  p-inputgroupaddon  "€"

p-button  label="Abbrechen"  severity="secondary"
p-button  [label]="confirmLabel"  severity="primary"
          [disabled]="receivedAmount < totalAmount"
```
