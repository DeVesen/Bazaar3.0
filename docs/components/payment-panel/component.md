# Component: Payment-Panel

**Bibliothek:** PrimeNG-Komposition — `p-inputgroup` + `p-inputnumber` + `app-numpad`  
**Verwendung:** Bazaar Haupt-App — überall dort, wo ein Geldbetrag entgegengenommen und das Rückgeld live berechnet wird.

## Index

- Überblick — Konzept & Varianten
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter & Events
- 3. Verhalten — Berechnung & Eingabe
- 4. Layout-Details — Aufbau
- 5. PrimeNG-Basis — Technische Basis

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

### Desktop / Tastatur-Modus

```
┌─────────────────────────────────────────────┐
│                                             │
│  Gesamtgebühr                   12,50 €    │  ← totalLabel + totalAmount
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Betrag erhalten                            │
│  ┌──────────────────────────┬───┬────┐     │
│  │  20,00                   │ € │ ⊞  │     │  ← Toggle-Button (→ Numpad)
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

### Tablet / Mobile — Numpad-Modus

```
┌─────────────────────────────────────────────┐
│                                             │
│  Gesamtgebühr                   12,50 €    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Betrag erhalten                            │
│  ┌──────────────────────────┬───┬────┐     │
│  │  20,00          [readonly]│ € │ ⌨  │     │  ← Toggle-Button (→ Tastatur)
│  └──────────────────────────┴───┴────┘     │
│                                             │
│  ┌──────────┬──────────┬──────────┐        │
│  │    7     │    8     │    9     │        │
│  ├──────────┼──────────┼──────────┤        │
│  │    4     │    5     │    6     │        │
│  ├──────────┼──────────┼──────────┤        │
│  │    1     │    2     │    3     │        │
│  ├──────────┼──────────┼──────────┤        │
│  │    C     │    0     │    ⌫    │        │
│  └──────────┴──────────┴──────────┘        │
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

### Eingabe-Modus: Tastatur vs. Numpad

Das Panel startet automatisch im passenden Modus:

```typescript
numpadActive = window.matchMedia('(pointer: coarse)').matches;
```

- **Touch-Gerät** (Tablet, Mobile): Numpad-Modus — `p-inputnumber` ist `readonly`,
  der In-App-Numpad (`app-numpad`) erscheint darunter. Keine native Tastatur öffnet sich.
- **Desktop** (Maus): Tastatur-Modus — normales `p-inputnumber`, Numpad ausgeblendet.

Der Nutzer kann jederzeit über den Toggle-Button im Eingabefeld-Addon wechseln.

### Numpad-Integration

Das Payment-Panel implementiert das Standard-Integrationsmuster aus
[`docs/components/numpad/component.md`](../numpad/component.md) — Abschnitt 4.

```typescript
@ViewChild('amountInput') amountInput!: InputNumber;

private get nativeInput(): HTMLInputElement {
    return this.amountInput.input.nativeElement;
}

onNumpadKey(init: KeyboardEventInit): void {
    this.nativeInput.focus();
    this.nativeInput.dispatchEvent(
        new KeyboardEvent('keydown', { ...init, bubbles: true })
    );
}

onNumpadClear(): void {
    this.receivedAmount = null;
}
```

### Fokus beim Öffnen

- **Tastatur-Modus:** `p-inputnumber` erhält automatisch den Fokus (`pAutoFocus`).
- **Numpad-Modus:** `pAutoFocus` entfällt; der Nutzer tippt direkt über den Numpad.

### Bestätigen

Klick auf `[confirmLabel]`-Button emittiert `confirmed` und übergibt alle drei Beträge.
Das Panel selbst führt **keine weiteren Aktionen** aus — das Parent entscheidet, was gebucht wird.

### Abbrechen

Klick auf `[Abbrechen]` emittiert `cancelled`. Das Panel setzt `receivedAmount` auf `null`
und `numpadActive` auf den gerätespezifischen Standardwert zurück.

---

## 4. Layout-Details

| Element | Stil |
|---|---|
| Gesamtbetrag-Zeile | `display: flex; justify-content: space-between; font-weight: 700; font-size: 17px` |
| Trennlinie | `border-top: 2px solid var(--p-content-border-color); margin: 10px 0; padding-top: 10px` |
| InputGroup | `p-inputgroup` mit `€`-Addon und Toggle-Button rechts, margin-top 16 px |
| Rückgeld-Box | `font-size: 32px; font-weight: 800; text-align: center; padding: 14px; background: #e8f8f0; border-radius: 8px; color: #1a5c38; margin: 12px 0` |
| Numpad | volle Breite, margin-top 8 px |
| Footer-Buttons | `display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px` |

---

## 5. PrimeNG-Basis

```
p-inputgroup
  p-inputnumber   #amountInput
    [(ngModel)]="receivedAmount"
    [minFractionDigits]="2"
    [maxFractionDigits]="2"
    [readonly]="numpadActive"
    [pAutoFocus]="!numpadActive"
  p-inputgroupaddon  "€"
  p-button  [icon]="numpadActive ? 'pi pi-keyboard' : 'pi pi-th-large'"
            severity="secondary"  [rounded]="true"  [text]="true"
            (onClick)="numpadActive = !numpadActive"

app-numpad
  *ngIf="numpadActive"
  (keyPressed)="onNumpadKey($event)"
  (cleared)="onNumpadClear()"

p-button  label="Abbrechen"  severity="secondary"
p-button  [label]="confirmLabel"  severity="primary"
          [disabled]="receivedAmount < totalAmount"
```
