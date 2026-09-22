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
Er zeigt vierzehn Buttons — immer alle, an jeder Verwendungsstelle
(docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md) — und emittiert bei jedem Klick eines
von drei Events: ein `KeyboardEventInit`-Objekt (für 0–9, Komma, Backspace), ein `cleared`-Event
(für die C-Taste) oder ein `submitted`-Event (für `⏎`).

Wie das Parent ein empfangenes `keyPressed`-Event verarbeitet, hängt von dessen eigenem
Eingabefeld ab (Details und Beispiele in Abschnitt 4):

- Besitzt das Parent ein `p-inputnumber` (z. B. [InputGroup](../input-group/component.md)s
  Preis-/Anzahl-Varianten), dispatcht es die Taste auf das native `<input>`-Element darin — so
  übernimmt PrimeNG automatisch die gesamte Buffer-Logik, Locale-Formatierung und die
  Behandlung des Dezimaltrennzeichens.
- Besitzt das Parent stattdessen einen eigenen String-Wert (z. B. `app-input`-basierte Felder
  wie [Payment-Panel](../payment-panel/component.md) oder die Umnummerierungs-Suche), wendet es
  die Taste direkt auf diesen String an — kein synthetisches `KeyboardEvent`, kein natives
  `<input>` beteiligt.

---

## 1. ASCII-Darstellung

```
┌──────┬──────┬──────┬──────┐
│  7   │  8   │  9   │  ⌫   │
├──────┼──────┼──────┼──────┤
│  4   │  5   │  6   │  C   │
├──────┼──────┼──────┼──────┤
│  1   │  2   │  3   │      │
├──────┴──────┼──────┤  ⏎   │
│      0      │  ,   │      │
└─────────────┴──────┴──────┘
```

Alle 14 Tasten sind immer sichtbar — die früheren `showDecimal`/`showEnter`-Umschalter sind
ersatzlos entfallen (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md). `0` spannt zwei
Spalten, `⏎` spannt Zeile 3–4 in Spalte 4. Alle Tasten sind gleich groß — touch-optimiert
(min. 48 × 48 px). `C`, `⌫` und `⏎` sind visuell dezent abgesetzt (Sekundär-Stil).

---

## 2. Input- / Output-Schnittstelle

| Input | Typ | Default | Wirkung |
|---|---|---|---|
| `enterDisabled` | `boolean` | `false` | Setzt `⏎` auf deaktiviert |

| Output | Typ | Beschreibung |
|---|---|---|
| `keyPressed` | `EventEmitter<KeyboardEventInit>` | Emittiert bei 0–9, Komma, Backspace |
| `cleared` | `EventEmitter<void>` | Emittiert bei Klick auf C |
| `submitted` | `EventEmitter<void>` | Emittiert bei Klick auf `⏎` |

Der Numpad kennt weiterhin **keinen Wert**. Der einzige Input steuert ausschließlich, ob `⏎`
bedienbar ist — nie, welche Tasten sichtbar sind (die sind immer alle sichtbar, Abschnitt 1).

`⏎` emittiert bewusst **kein** `keyPressed` mit `key: 'Enter'`, sondern ein eigenes Event —
analog zu `cleared`. Was „Enter" bedeutet, entscheidet das Parent: an einem Artikelnummer-Feld
den Artikel-Lookup, im Payment-Panel die Bestätigung. Ein durchgereichtes Enter-Keydown
würde diese Entscheidung in den Numpad verlagern.

---

## 3. Key-Mapping

| Taste | Emittiert |
|---|---|
| `0`–`9` | `keyPressed` mit `key: '0'` – `'9'` |
| `,` | `keyPressed` mit `key: ','` |
| `⌫` | `keyPressed` mit `key: 'Backspace'` |
| `C` | `cleared` |
| `⏎` | `submitted` |

Das Komma wird als `','` emittiert — PrimeNG's `InputNumber` wandelt es anhand der
konfigurierten Locale automatisch in den korrekten Dezimaltrenner um (DE: `,`, EN: `.`).

---

## 4. Empfehlung: Integration im Parent

> Dieser Abschnitt beschreibt die zwei empfohlenen Muster für jede Parent-Komponente,
> die den Numpad einsetzt — welches greift, hängt vom Eingabefeld-Typ des Parents ab
> (Abschnitt "Überblick"). Ein Agent, der eine neue Verwendungsstelle implementiert,
> sollte das passende Muster vollständig übernehmen.

### Muster A — Parent besitzt einen eigenen String-Wert (empfohlen für neue Verwendungsstellen)

Hält das Parent seinen Wert ohnehin als String-Signal (z. B. ein `app-input`-Feld), wird
die empfangene Taste direkt auf dieses Signal angewendet — kein `ViewChild`, kein
synthetisches `KeyboardEvent`, kein natives `<input>` beteiligt. Kanonisches Beispiel:
[Payment-Panel](../payment-panel/component.md)s `onNumpadKey()`/`onNumpadClear()`
(`payment-panel.ts`):

```typescript
onNumpadKey(init: KeyboardEventInit): void {
    const key = init.key;
    if (key === undefined) return;
    if (key === 'Backspace') {
        this.receivedText.update((text) => text.slice(0, -1));
        return;
    }
    if (key === ',') {
        if (!this.receivedText().includes(',')) this.receivedText.update((text) => text + ',');
        return;
    }
    if (this.decimalsFull()) return;
    this.receivedText.update((text) => text + key);
}

onNumpadClear(): void {
    this.receivedText.set('');
}
```

Ein Feld ohne Dezimalstellen (z. B. eine Artikelnummer) übernimmt aus diesem Beispiel nur
die Ziffern- und Backspace-Behandlung und lässt die Komma-Verarbeitung ganz weg — ein Komma
darf dort erst gar nicht in den Wert gelangen (siehe `intake-renumber-lookup-popup.ts`s
eigenes `onNumpadKey()`).

### Muster B — Parent besitzt ein p-inputnumber

Besitzt das Parent stattdessen ein PrimeNG-`p-inputnumber` (z. B.
[InputGroup](../input-group/component.md)s Preis-/Anzahl-Varianten), bleibt PrimeNG für
Buffer-Logik, Locale-Formatierung und Dezimaltrennzeichen zuständig. Das `p-inputnumber`
wird im Numpad-Modus auf `[readonly]="true"` gesetzt — so öffnet sich keine native
Tastatur — und das Parent dispatcht die empfangenen Key-Events auf dessen natives
`<input>`-Element.

#### Schritt 1 — ViewChild auf p-inputnumber

```typescript
@ViewChild('amountInput') amountInput!: InputNumber;

private get nativeInput(): HTMLInputElement {
    return this.amountInput.input.nativeElement;
}
```

#### Schritt 2 — Numpad-Events verarbeiten

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

#### Schritt 3 — Template

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

### Ein- und Ausblenden (beide Muster)

Der Numpad blendet sich nicht selbst ein. Welcher Eingabemodus aktiv ist und wie
umgeschaltet wird, beschreibt ausschließlich
[InputGroup](../input-group/component.md) Abschnitt 3 — dort steht auch, dass jede Seite
und jedes Popup im Tastatur-Modus startet.

Das Parent bindet lediglich die drei Events:

```html
<app-numpad
    *ngIf="mode === 'numpad'"
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
  p-button  severity="secondary"  <svg data-p-icon="delete-left"></svg>   ← Spalte 4, Zeile 1–2
  p-button  label="4"   (digit)
  p-button  label="5"   (digit)
  p-button  label="6"   (digit)
  p-button  label="1"   (digit)
  p-button  label="2"   (digit)
  p-button  label="3"   (digit)
  p-button  severity="secondary"  [disabled]="enterDisabled"
            <svg data-p-icon="arrow-turn-down-left"></svg>              ← Spalte 4, Zeile 3–4
  p-button  label="C"   severity="secondary"
  p-button  label=","   severity="secondary"
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
4. **AC-4** — WHEN `⏎` geklickt wird, THEN SHALL das System das `submitted`-Event emittieren und kein `keyPressed`-Event.
5. **AC-5** — THE SYSTEM SHALL keinen internen Wert-Buffer verwalten; jeder Klick resultiert ausschließlich in einem emittierten Event.
6. **AC-6** — WHILE `enterDisabled` gesetzt ist, SHALL das System `⏎` deaktiviert darstellen und bei Klick kein `submitted`-Event emittieren.
7. **AC-7** — THE SYSTEM SHALL das Grid mit `margin: 16px 0` darstellen, sodass jede Verwendungsstelle den Abstand nach oben zum Eingabefeld und nach unten zum Folgeelement selbst nicht erneut festlegt.
8. **AC-8** — THE SYSTEM SHALL an jeder Verwendungsstelle unconditional alle 14 Tasten (0–9, C, ⌫, `,`, `⏎`) anzeigen.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #numpad #touch #eingabe #zifferntasten #event-relay #primeng
