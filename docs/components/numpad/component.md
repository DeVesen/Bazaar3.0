---
id: C-008
status: draft
updated: 2026-08-18
---

# Component: Numpad

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input- / Output-Schnittstelle — Events
- 3. Key-Mapping — Tastenbelegung
- 4. Empfehlung: Integration im Parent — Einbau-Guide
- 5. PrimeNG-Basis — Technische Basis
- 6. Layout-Details — Aufbau
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**Bibliothek:** PrimeNG-Komposition — 4×4 Grid aus `p-button`  
**Verwendung:** Überall dort, wo eine tipp-freundliche Zahleneingabe ohne native Tastatur benötigt wird.

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
┌──────┬──────┬──────┬──────┐
│  7   │  8   │  9   │      │
├──────┼──────┼──────┤  ⌫   │
│  4   │  5   │  6   │      │
├──────┼──────┼──────┼──────┤
│  1   │  2   │  3   │      │
├──────┼──────┼──────┤  ⏎   │
│  C   │  ,   │  0   │      │
└──────┴──────┴──────┴──────┘
```

Spalten 1–3 tragen die Ziffern, Spalte 4 die Aktionstasten: `⌫` über Zeile 1–2,
`⏎` über Zeile 3–4.

Alle Tasten sind gleich groß — touch-optimiert (min. 48 × 48 px).
`C` (Clear), `⌫` (Backspace) und `⏎` (Enter) sind visuell dezent abgesetzt (Sekundär-Stil).

**Optionale Tasten.** Komma und `⏎` sind je Verwendungsstelle abschaltbar (Abschnitt 2).
Ist `⏎` ausgeblendet, spannt `⌫` alle vier Zeilen. Ist das Komma ausgeblendet, bleibt sein
Slot leer — die `0` behält ihre Position, das Grid springt bei keinem Moduswechsel.

---

## 2. Input- / Output-Schnittstelle

| Input | Typ | Default | Wirkung |
|---|---|---|---|
| `showDecimal` | `boolean` | `false` | Blendet die Komma-Taste in der unteren Zeile ein |
| `showEnter` | `boolean` | `false` | Blendet `⏎` in der Aktionsspalte ein |
| `enterDisabled` | `boolean` | `false` | Setzt `⏎` auf deaktiviert |

| Output | Typ | Beschreibung |
|---|---|---|
| `keyPressed` | `EventEmitter<KeyboardEventInit>` | Emittiert bei 0–9, Komma, Backspace |
| `cleared` | `EventEmitter<void>` | Emittiert bei Klick auf C |
| `submitted` | `EventEmitter<void>` | Emittiert bei Klick auf `⏎` |

Der Numpad kennt weiterhin **keinen Wert**. Die drei Inputs steuern ausschließlich, welche
Tasten sichtbar bzw. bedienbar sind.

`⏎` emittiert bewusst **kein** `keyPressed` mit `key: 'Enter'`, sondern ein eigenes Event —
analog zu `cleared`. Was „Enter" bedeutet, entscheidet das Parent: an einem Artikelnummer-Feld
den Artikel-Lookup, im Payment-Panel die Bestätigung. Ein durchgereichtes Enter-Keydown
würde diese Entscheidung in den Numpad verlagern.

---

## 3. Key-Mapping

| Taste | Emittiert |
|---|---|
| `0`–`9` | `keyPressed` mit `key: '0'` – `'9'` |
| `,` | `keyPressed` mit `key: ','` — nur wenn `showDecimal` |
| `⌫` | `keyPressed` mit `key: 'Backspace'` |
| `C` | `cleared` |
| `⏎` | `submitted` — nur wenn `showEnter` |

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
    [readonly]="mode === 'numpad'"
/>

<app-numpad
    *ngIf="mode === 'numpad'"
    (keyPressed)="onNumpadKey($event)"
    (cleared)="onNumpadClear()"
/>
```

### Schritt 4 — Ein- und Ausblenden

Der Numpad blendet sich nicht selbst ein. Welcher Eingabemodus aktiv ist und wie
umgeschaltet wird, beschreibt ausschließlich
[InputGroup](../input-group/component.md) Abschnitt 3 — dort steht auch, dass jede Seite
und jedes Popup im Tastatur-Modus startet.

Das Parent bindet lediglich die drei Events:

```html
<app-numpad
    *ngIf="mode === 'numpad'"
    [showDecimal]="true"
    [showEnter]="true"
    [enterDisabled]="!canSubmit"
    (keyPressed)="onNumpadKey($event)"
    (cleared)="onNumpadClear()"
    (submitted)="onSubmit()"
/>
```

---

## 5. PrimeNG-Basis

```
4×4 Grid:
  p-button  label="7"   (digit)
  p-button  label="8"   (digit)
  p-button  label="9"   (digit)
  p-button  icon="pi pi-delete-left"  severity="secondary"   ← Spalte 4, Zeile 1–2
  p-button  label="4"   (digit)
  p-button  label="5"   (digit)
  p-button  label="6"   (digit)
  p-button  label="1"   (digit)
  p-button  label="2"   (digit)
  p-button  label="3"   (digit)
  p-button  icon="pi pi-arrow-turn-down-left"  severity="secondary"
            [disabled]="enterDisabled"                       ← Spalte 4, Zeile 3–4
  p-button  label="C"   severity="secondary"
  p-button  label=","   severity="secondary"  *ngIf="showDecimal"
  p-button  label="0"   (digit)
```

---

## 6. Layout-Details

| Element | Stil |
|---|---|
| Grid | `display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 16px 0` |
| Buttons (Ziffern) | `width: 100%; min-height: 48px; font-size: 20px; font-weight: 600` |
| Buttons (C, `,`) | wie Ziffern, zusätzlich `severity="secondary"` |
| `⌫` | `grid-column: 4; grid-row: 1 / span 2`; ohne `⏎`: `grid-row: 1 / span 4` |
| `⏎` | `grid-column: 4; grid-row: 3 / span 2` |

**Abstand.** Die `margin: 16px 0` am Grid ist verbindlich und gilt an **jeder**
Verwendungsstelle: nach oben zum Eingabefeld, nach unten zum Folgeelement (z. B. der
Rückgeld-Box im [Payment-Panel](../payment-panel/component.md)). Ein Parent legt den
Abstand nicht erneut fest.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN eine Zifferntaste (0–9) geklickt wird, THEN SHALL das System ein `keyPressed`-Event mit dem entsprechenden `key`-Wert emittieren.
2. **AC-2** — WHEN die ⌫-Taste geklickt wird, THEN SHALL das System ein `keyPressed`-Event mit `key: 'Backspace'` emittieren.
3. **AC-3** — WHEN die C-Taste geklickt wird, THEN SHALL das System das `cleared`-Event emittieren und kein `keyPressed`-Event.
4. **AC-4** — WHILE `showDecimal` gesetzt ist, SHALL das System die Komma-Taste anzeigen und bei Klick ein `keyPressed`-Event mit `key: ','` emittieren, das PrimeNG's InputNumber zum korrekten Dezimaltrenner der konfigurierten Locale umwandelt.
5. **AC-5** — WHILE `showDecimal` nicht gesetzt ist, SHALL das System die Komma-Taste ausblenden und ihren Grid-Slot leer lassen, sodass die Positionen von `C` und `0` unverändert bleiben.
6. **AC-6** — WHEN `⏎` geklickt wird, THEN SHALL das System das `submitted`-Event emittieren und kein `keyPressed`-Event.
7. **AC-7** — WHILE `showEnter` nicht gesetzt ist, SHALL das System `⏎` ausblenden und `⌫` über alle vier Zeilen der Aktionsspalte spannen.
8. **AC-8** — THE SYSTEM SHALL keinen internen Wert-Buffer verwalten; jeder Klick resultiert ausschließlich in einem emittierten Event.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #numpad #touch #eingabe #zifferntasten #event-relay #primeng
