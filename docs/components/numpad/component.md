# Component: Numpad

**Bibliothek:** PrimeNG-Komposition — 3×4 Grid aus `p-button`  
**Verwendung:** Überall dort, wo eine tipp-freundliche Zahleneingabe ohne native Tastatur benötigt wird.

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Output-Schnittstelle — Events
- 3. Key-Mapping — Tastenbelegung
- 4. Empfehlung: Integration im Parent — Einbau-Guide
- 5. PrimeNG-Basis — Technische Basis
- 6. Layout-Details — Aufbau

---

## Überblick

Der Numpad ist ein **zustandsloser Event-Relay** — er kennt keinen Wert und verwaltet keinen Buffer.
Er zeigt 12 Buttons und emittiert bei jedem Klick entweder ein `KeyboardEventInit`-Objekt
(für 0–9, Komma, Backspace) oder ein `cleared`-Event (für die C-Taste).

Das Parent dispatcht das empfangene Event auf das native `<input>`-Element des zugehörigen
`p-inputnumber` — so übernimmt PrimeNG automatisch die gesamte Buffer-Logik, Locale-Formatierung
und die Behandlung des Dezimaltrennzeichens.

---

## 1. ASCII-Darstellung

```
┌──────────┬──────────┬──────────┐
│    7     │    8     │    9     │
├──────────┼──────────┼──────────┤
│    4     │    5     │    6     │
├──────────┼──────────┼──────────┤
│    1     │    2     │    3     │
├──────────┼──────────┼──────────┤
│    C     │    0     │    ⌫    │
└──────────┴──────────┴──────────┘
```

Alle Buttons sind gleich groß — touch-optimiert (min. 48 × 48 px).  
`C` (Clear) und `⌫` (Backspace) sind visuell dezent abgesetzt (Sekundär-Stil).

---

## 2. Output-Schnittstelle

| Output | Typ | Beschreibung |
|---|---|---|
| `keyPressed` | `EventEmitter<KeyboardEventInit>` | Emittiert bei 0–9, Komma, Backspace |
| `cleared` | `EventEmitter<void>` | Emittiert bei Klick auf C |

Kein `@Input()` — der Numpad kennt keinen aktuellen Wert.

---

## 3. Key-Mapping

| Taste | `key`-Wert im emittierten Event |
|---|---|
| `0`–`9` | `'0'` – `'9'` |
| `,` | `','` |
| `⌫` | `'Backspace'` |
| `C` | — (separater `cleared`-Output) |

Das Komma wird als `','` emittiert — PrimeNG's `InputNumber` wandelt es anhand der
konfigurierten Locale automatisch in den korrekten Dezimaltrenner um (DE: `,`, EN: `.`).

---

## 4. Empfehlung: Integration im Parent

> Dieser Abschnitt beschreibt das empfohlene Muster für jede Parent-Komponente,
> die den Numpad einsetzt. Ein Agent, der eine neue Verwendungsstelle implementiert,
> sollte dieses Muster vollständig übernehmen.

### Prinzip

Der Numpad steuert kein eigenes Eingabefeld. Das Parent besitzt ein `p-inputnumber`,
das im Numpad-Modus auf `[readonly]="true"` gesetzt wird — so öffnet sich keine native
Tastatur. Der Parent dispatcht die empfangenen Key-Events auf das native `<input>`-Element
innerhalb des `p-inputnumber`.

### Schritt 1 — ViewChild auf p-inputnumber

```typescript
@ViewChild('amountInput') amountInput!: InputNumber;

private get nativeInput(): HTMLInputElement {
    return this.amountInput.input.nativeElement;
}
```

### Schritt 2 — Numpad-Events verarbeiten

```typescript
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

### Schritt 3 — Template

```html
<p-inputnumber
    #amountInput
    [(ngModel)]="receivedAmount"
    [minFractionDigits]="2"
    [maxFractionDigits]="2"
    [readonly]="numpadActive"
/>

<app-numpad
    *ngIf="numpadActive"
    (keyPressed)="onNumpadKey($event)"
    (cleared)="onNumpadClear()"
/>
```

### Schritt 4 — Toggle-Mechanismus

```typescript
numpadActive = window.matchMedia('(pointer: coarse)').matches;
```

Startet automatisch im Numpad-Modus auf Touch-Geräten (Tablet/Mobile) und im
Tastatur-Modus auf Desktop (Maus). Der Nutzer kann jederzeit über einen Toggle-Button
wechseln.

Toggle-Button im Template (Icon wechselt je nach Modus):

```html
<p-button
    [icon]="numpadActive ? 'pi pi-keyboard' : 'pi pi-th-large'"
    severity="secondary"
    [rounded]="true"
    [text]="true"
    (onClick)="numpadActive = !numpadActive"
/>
```

Im Tastatur-Modus (`numpadActive = false`): `p-inputnumber` erhält beim Einblenden
automatisch den Fokus, damit die native Tastatur sofort erscheint.

---

## 5. PrimeNG-Basis

```
3×4 Grid:
  p-button  label="7"   (digit)
  p-button  label="8"   (digit)
  p-button  label="9"   (digit)
  p-button  label="4"   (digit)
  p-button  label="5"   (digit)
  p-button  label="6"   (digit)
  p-button  label="1"   (digit)
  p-button  label="2"   (digit)
  p-button  label="3"   (digit)
  p-button  label="C"   severity="secondary"
  p-button  label="0"   (digit)
  p-button  icon="pi pi-delete-left"  severity="secondary"
```

---

## 6. Layout-Details

| Element | Stil |
|---|---|
| Grid | `display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px` |
| Buttons (Ziffern) | `width: 100%; min-height: 48px; font-size: 20px; font-weight: 600` |
| Buttons (C, ⌫) | wie Ziffern, zusätzlich `severity="secondary"` |
