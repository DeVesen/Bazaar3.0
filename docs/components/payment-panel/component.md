---
id: C-007
status: draft
updated: 2026-08-18
---

# Component: Payment-Panel

## Index

- Überblick — Konzept & Varianten
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter & Events
- 3. Verhalten — Berechnung & Eingabe
- 4. Layout-Details — Aufbau
- 5. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**Bibliothek:** PrimeNG-Komposition — `app-input` + `app-numpad`  
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

### Tastatur-Modus

```
┌─────────────────────────────────────────────┐
│                                             │
│  Gesamtgebühr                   12,50 €    │  ← totalLabel + totalAmount
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Betrag erhalten                            │
│  ┌──────────────────────────┬───┬────┐     │
│  │  20,00                   │ € │ ⊞  │     │  ← Modus-Button (→ Numpad)
│  └──────────────────────────┴───┴────┘     │
│                                             │
│  ╔═════════════════════════════════════╗   │
│  ║                                     ║   │
│  ║           7,50 €                    ║   │  ← Rückgeld (grüne Box, live)
│  ║           Rückgeld                  ║   │
│  ║                                     ║   │
│  ╚═════════════════════════════════════╝   │
│                                             │
│               [Abbrechen]  [Buchen]        │
└─────────────────────────────────────────────┘
```

### Numpad-Modus

```
┌─────────────────────────────────────────────┐
│                                             │
│  Gesamtgebühr                   12,50 €    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Betrag erhalten                            │
│  ┌──────────────────────────┬───┬────┐     │
│  │  20,00          [readonly]│ € │ ⌨  │     │  ← Modus-Button (→ Tastatur)
│  └──────────────────────────┴───┴────┘     │
│                                             │
│  ┌──────┬──────┬──────┬──────┐             │
│  │  7   │  8   │  9   │      │             │
│  ├──────┼──────┼──────┤  ⌫   │             │
│  │  4   │  5   │  6   │      │             │
│  ├──────┼──────┼──────┼──────┤             │
│  │  1   │  2   │  3   │      │             │
│  ├──────┼──────┼──────┤  ⏎   │             │
│  │  C   │  ,   │  0   │      │             │
│  └──────┴──────┴──────┴──────┘             │
│                                             │
│  ╔═════════════════════════════════════╗   │
│  ║           7,50 €  Rückgeld          ║   │
│  ╚═════════════════════════════════════╝   │
│                                             │
│               [Abbrechen]  [Buchen]        │
└─────────────────────────────────────────────┘

Rückgeld-Zustände (gelten in beiden Modi):
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

### Tastatur- vs. Numpad-Modus

Das Panel bietet zwei Modi an — `modes = ['keyboard', 'numpad']`. Eine Kamera gibt es hier
nicht; entsprechend erscheint genau **ein** Modus-Button im Eingabefeld-Addon.

Mechanik, Reihenfolge und Startmodus stehen in
[InputGroup](../input-group/component.md) Abschnitt 3 und werden hier nicht wiederholt.
Für das Panel heißt das: Es öffnet **immer** im Tastatur-Modus, auch auf einem Tablet.

Im Numpad-Modus ist `p-inputnumber` auf `readonly` gesetzt, sodass keine native Tastatur
erscheint.

### Numpad-Integration

Das Payment-Panel implementiert das Standard-Integrationsmuster aus
[`docs/components/numpad/component.md`](../numpad/component.md) — Abschnitt 4.

```typescript
onNumpadKey(init: KeyboardEventInit): void {
    const key = init.key;
    if (key === undefined) return;
    if (key === 'Backspace') {
        this.receivedText.update((text) => text.slice(0, -1));
        return;
    }
    // ... comma/digit handling, see payment-panel.ts
}

onNumpadClear(): void {
    this.receivedText.set('');
}
```

Der Numpad zeigt hier wie überall alle Tasten (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md).
`enterDisabled` ist an dieselbe Bedingung gekoppelt wie der Bestätigen-Button:
`receivedAmount < totalAmount`. Ein Tastendruck wird direkt in `receivedText` übernommen — kein
`KeyboardEvent`-Dispatch.

### Bestätigen

Klick auf `[confirmLabel]`-Button emittiert `confirmed` und übergibt alle drei Beträge.
Das Panel selbst führt **keine weiteren Aktionen** aus — das Parent entscheidet, was gebucht wird.

### Abbrechen

Klick auf `[Abbrechen]` emittiert `cancelled`. Das Panel setzt `receivedAmount` auf `null` und den Eingabemodus auf `keyboard` zurück.

---

## 4. Layout-Details

| Element | Stil |
|---|---|
| Gesamtbetrag-Zeile | `display: flex; justify-content: space-between; font-weight: 700; font-size: 17px` |
| Trennlinie | `border-top: 2px solid var(--p-content-border-color); margin: 10px 0; padding-top: 10px` |
| InputGroup | `p-inputgroup` mit `€`-Addon und Modus-Button rechts, margin-top 16 px |
| Rückgeld-Box | `font-size: 32px; font-weight: 800; text-align: center; padding: 14px; background: #e8f8f0; border-radius: 8px; color: #1a5c38; margin: 12px 0` |
| Numpad | volle Breite; Außenabstand kommt aus der Komponente selbst (`margin: 16px 0`, siehe [Numpad](../numpad/component.md) §6) |
| Footer-Buttons | `display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px` |

---

## 5. PrimeNG-Basis

```
app-input
  [value]="receivedText()"
  [debounceMs]="0"
  [addonRight]="amountAddonRight()"
  [readOnly]="mode === 'numpad'"

app-numpad
  *ngIf="mode === 'numpad'"
  [enterDisabled]="receivedAmount < totalAmount"
  (keyPressed)="onNumpadKey($event)"
  (cleared)="onNumpadClear()"
  (submitted)="onNumpadSubmit()"

p-button  label="Abbrechen"  severity="secondary"
p-button  [label]="confirmLabel"  severity="primary"
          [disabled]="receivedAmount < totalAmount"
```

---

## Akzeptanzkriterien

1. **AC-1** — WHEN ein Betrag im Feld „Betrag erhalten" eingegeben wird, THEN SHALL das System das Rückgeld als `receivedAmount − totalAmount` live berechnen und in der grünen Box anzeigen.
2. **AC-2** — WHILE der eingegebene Betrag kleiner als `totalAmount` ist, SHALL das System die Rückgeld-Box ausblenden und den Bestätigen-Button deaktiviert halten.
3. **AC-3** — WHEN der Bestätigen-Button geklickt wird, THEN SHALL das System das `confirmed`-Event mit `{ totalAmount, receivedAmount, change }` emittieren.
4. **AC-4** — WHEN das Panel geöffnet wird, THEN SHALL das System den Tastatur-Modus aktivieren, unabhängig vom Eingabegerät.
5. **AC-5** — WHEN der Modus-Button geklickt wird, THEN SHALL das System zwischen Tastatur- und Numpad-Modus wechseln, das Icon auf den jeweils inaktiven Modus setzen und im Numpad-Modus das Eingabefeld auf `readonly` schalten.
6. **AC-6** — WHEN „Abbrechen" geklickt wird, THEN SHALL das System das `cancelled`-Event emittieren und `receivedAmount` auf `null` zurücksetzen.
7. **AC-7** — WHEN `⏎` auf dem Numpad geklickt wird, THEN SHALL das System denselben Vorgang auslösen wie der Bestätigen-Button.
8. **AC-8** — WHILE `receivedAmount < totalAmount` gilt, SHALL das System sowohl den Bestätigen-Button als auch `⏎` deaktiviert halten.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #payment-panel #kassier #rückgeld #numpad #bezahlung #primeng
