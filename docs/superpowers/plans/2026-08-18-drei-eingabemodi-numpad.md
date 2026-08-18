# Drei Eingabemodi und Numpad-Erweiterung — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Dokumentation der Bazaar Haupt-App so nachziehen, dass jedes Scan- und Nummernfeld drei Eingabemodi (Tastatur, Kamera, Numpad) kennt und der Numpad eine Enter-Taste sowie eine verbindliche Abstandsregel besitzt.

**Architecture:** Reine Dokumentationsänderung — im Repository existiert noch kein Code, nur `docs/`. Die Modus-Mechanik wird **einmal** in der Komponentenbeschreibung `docs/components/input-group/component.md` (C-012) festgeschrieben; alle Epics, Stories und übrigen Komponenten referenzieren sie, statt sie zu wiederholen. Der Numpad (C-008) bleibt zustandsloser Event-Relay und wird nur um Tasten, Flags und Spacing erweitert.

**Tech Stack:** Markdown, Git. Keine Build-, Test- oder Lint-Toolchain im Repository. Verifikation erfolgt über `grep`-Prüfungen auf den geänderten Dateien und eine abschließende Link-Konsistenzprüfung.

## Global Constraints

- Doku-Sprache ist **Deutsch**; Code-Bezeichner, Angular-/PrimeNG-Namen, Routen und JSON-Felder bleiben **englisch** (Projekt-`CLAUDE.md`).
- Verzeichnisnamen unter `docs/components/` sind englisch, Dateiname immer `component.md`.
- Akzeptanzkriterien werden im **EARS**-Stil geschrieben (`WHEN … THEN SHALL das System …` / `WHILE … SHALL …` / `IF … THEN SHALL …`), durchnummeriert als `AC-n`.
- Jede Komponenten-Datei behält ihren Frontmatter-Block; bei jeder Änderung wird `updated:` auf `2026-08-18` gesetzt.
- Feste Modus-Reihenfolge, überall identisch: **Tastatur → Kamera → Numpad**.
- Modus-Icons, überall identisch: Tastatur `pi pi-keyboard`, Kamera `pi pi-camera`, Numpad `pi pi-th-large`.
- Numpad-Außenabstand, überall identisch: `margin: 16px 0`.
- Ausschließlich PrimeNG, kein natives HTML, keine anderen Libraries (`docs/components/overview.md`).
- Quelle der Wahrheit für dieses Vorhaben: [`docs/superpowers/specs/2026-08-18-drei-eingabemodi-numpad-design.md`](../specs/2026-08-18-drei-eingabemodi-numpad-design.md). Bei Widerspruch zwischen Plan und Spec gewinnt die Spec.

---

## File Structure

| Datei | Verantwortung nach der Änderung |
|---|---|
| `docs/components/numpad/component.md` | Tastenlayout, Flags, Events, Spacing des Numpads. Kennt **keine** Modus-Umschaltung mehr. |
| `docs/components/input-group/component.md` | **Alleinige** Quelle der Drei-Modi-Mechanik: Modus-Liste, Sichtbarkeitsregel, Startmodus, Kamera-Lebensdauer. |
| `docs/components/payment-panel/component.md` | Verwendungsstelle: Zwei-Modi-Fall, `⏎` = Bestätigen. |
| `docs/components/scan-dialog/component.md` | Verwendungsstelle: nutzt die InputGroup-Modi statt eines eigenen Umschalters. |
| `docs/components/seller-search/component.md` | Verwendungsstelle: bestehender Scan-Modus geht in die Modus-Mechanik auf. |
| `docs/requirements/bazaar-app/epics/Epic_Verkauf/epic.md` | Fachliche Ausprägung Verkauf: welche Modi, Rückkehr nach Treffer, Preis-Button-Ablauf. |
| `docs/requirements/bazaar-app/epics/Epic_Verkauf/stories/VERKAUF-S01-eingabemodi.md` | Verkauf-spezifische Akzeptanzkriterien der Modi (umbenannt aus `VERKAUF-S01-popup-camera-mode.md`). |
| `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md` | Dauerscan-Verhalten (Countdown, Ton, Vibration) — nur noch das. |
| `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md`, `docs/requirements/bazaar-app/components/intake-wizard.md` | Verwendungsstelle Wizard Schritt 2. |

Reihenfolge der Tasks: erst die beiden Komponenten, die die Regeln definieren (1, 2), dann die Verwendungsstellen (3–5), dann die Epics und Stories (6–9), zuletzt die repo-weite Konsistenzprüfung (10).

---

### Task 1: Numpad — Grid 4×4, Enter-Taste, Spacing

**Files:**
- Modify: `docs/components/numpad/component.md`

**Interfaces:**
- Consumes: nichts.
- Produces: Inputs `showDecimal: boolean = false`, `showEnter: boolean = false`, `enterDisabled: boolean = false`; Output `submitted: EventEmitter<void>`; Spacing-Regel `margin: 16px 0`. Task 2, 3 und 4 referenzieren genau diese Namen.

- [ ] **Step 1: Frontmatter aktualisieren**

Ersetze im Frontmatter die Zeile `updated: 2026-07-31` durch:

```markdown
updated: 2026-08-18
```

- [ ] **Step 2: ASCII-Darstellung ersetzen**

Ersetze in Abschnitt „1. ASCII-Darstellung" den kompletten Code-Block samt der beiden Sätze darunter durch:

````markdown
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
````

- [ ] **Step 3: Input-Schnittstelle ergänzen**

Ersetze in Abschnitt „2. Output-Schnittstelle" die Überschrift und den Satz `Kein `@Input()` — der Numpad kennt keinen aktuellen Wert.` durch:

```markdown
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
```

Die bisherige Output-Tabelle (`keyPressed`, `cleared`) entfällt dabei — sie ist in der neuen Tabelle enthalten.

- [ ] **Step 4: Key-Mapping-Tabelle um Enter ergänzen**

Ersetze in Abschnitt „3. Key-Mapping" die Tabelle durch:

```markdown
| Taste | Emittiert |
|---|---|
| `0`–`9` | `keyPressed` mit `key: '0'` – `'9'` |
| `,` | `keyPressed` mit `key: ','` — nur wenn `showDecimal` |
| `⌫` | `keyPressed` mit `key: 'Backspace'` |
| `C` | `cleared` |
| `⏎` | `submitted` — nur wenn `showEnter` |
```

- [ ] **Step 5: Toggle-Beschreibung durch Verweis ersetzen**

Ersetze in Abschnitt „4. Empfehlung: Integration im Parent" den kompletten Unterabschnitt „Schritt 4 — Toggle-Mechanismus" (von der Überschrift bis einschließlich des Satzes „Im Tastatur-Modus (`numpadActive = false`): `p-inputnumber` erhält beim Einblenden automatisch den Fokus, damit die native Tastatur sofort erscheint.") durch:

```markdown
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
```

- [ ] **Step 6: PrimeNG-Basis und Layout-Details aktualisieren**

Ersetze in Abschnitt „5. PrimeNG-Basis" den Code-Block durch:

```markdown
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
```

Ersetze anschließend in Abschnitt „6. Layout-Details" die Tabelle durch:

```markdown
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
```

- [ ] **Step 7: Akzeptanzkriterien ergänzen**

Ersetze in Abschnitt „Akzeptanzkriterien" AC-4 durch die folgenden Kriterien und nummeriere die bisherige AC-5 zu AC-8 um:

```markdown
4. **AC-4** — WHILE `showDecimal` gesetzt ist, SHALL das System die Komma-Taste anzeigen und bei Klick ein `keyPressed`-Event mit `key: ','` emittieren, das PrimeNG's InputNumber zum korrekten Dezimaltrenner der konfigurierten Locale umwandelt.
5. **AC-5** — WHILE `showDecimal` nicht gesetzt ist, SHALL das System die Komma-Taste ausblenden und ihren Grid-Slot leer lassen, sodass die Positionen von `C` und `0` unverändert bleiben.
6. **AC-6** — WHEN `⏎` geklickt wird, THEN SHALL das System das `submitted`-Event emittieren und kein `keyPressed`-Event.
7. **AC-7** — WHILE `showEnter` nicht gesetzt ist, SHALL das System `⏎` ausblenden und `⌫` über alle vier Zeilen der Aktionsspalte spannen.
8. **AC-8** — THE SYSTEM SHALL keinen internen Wert-Buffer verwalten; jeder Klick resultiert ausschließlich in einem emittierten Event.
```

- [ ] **Step 8: Änderung verifizieren**

Run:
```bash
grep -c "showDecimal\|showEnter\|enterDisabled\|submitted" docs/components/numpad/component.md
```
Expected: eine Zahl `>= 12`.

Run:
```bash
grep -n "repeat(4, 1fr)\|margin: 16px 0" docs/components/numpad/component.md
```
Expected: mindestens zwei Treffer, davon einer in der Layout-Tabelle.

Run:
```bash
grep -n "numpadActive\|pointer: coarse" docs/components/numpad/component.md
```
Expected: **keine Ausgabe** — die geräteabhängige Toggle-Logik ist vollständig entfernt.

- [ ] **Step 9: Commit**

```bash
git add docs/components/numpad/component.md
git commit -m "docs(components): Numpad auf 4x4 mit Enter-Taste und fester Aussenmarge"
```

---

### Task 2: InputGroup — Drei Eingabemodi als alleinige Quelle

**Files:**
- Modify: `docs/components/input-group/component.md`

**Interfaces:**
- Consumes: aus Task 1 die Numpad-Inputs `showDecimal`, `showEnter`, `enterDisabled` und den Output `submitted`.
- Produces: Input `modes: InputMode[]` mit `type InputMode = 'keyboard' | 'camera' | 'numpad'`; die Sichtbarkeitsregel der Modus-Buttons; die Regel „Startmodus immer `keyboard`"; die Kamera-Freigabe-Regel. Tasks 3–9 referenzieren diesen Abschnitt, statt ihn zu wiederholen.

- [ ] **Step 1: Frontmatter aktualisieren**

Ersetze `updated: 2026-07-31` durch:

```markdown
updated: 2026-08-18
```

- [ ] **Step 2: Index erweitern**

Ersetze im Index die Zeile `- 3. Verhalten — Interaktionsregeln` durch:

```markdown
- 3. Eingabe-Modi — Tastatur, Kamera, Numpad
- 4. Verhalten — Interaktionsregeln
```

und nummeriere die folgenden Index-Einträge um: `4. Preis-Variante` → `5. Preis-Variante`, `5. PrimeNG-Basis` → `6. PrimeNG-Basis`. Dieselbe Umnummerierung gilt für die Abschnitts-Überschriften im Dokument.

- [ ] **Step 3: ASCII-Darstellung ersetzen**

Ersetze in Abschnitt „1. ASCII-Darstellung" den Code-Block durch:

````markdown
```
Standard-InputGroup (Such- / Scan-Feld):
[ 🔍 Left-Addon ][ Input-Feld    ][ ✕ ][ Spinner ][ ↩ ][ Modus-A ][ Modus-B ]

Preis-Variante:
[ Preis eingeben (Kommazahl)    ][ € ][ Modus-A ]
```
````

- [ ] **Step 4: Slot-Tabelle anpassen**

Ersetze in Abschnitt „2. Slots — Aufbau" die Zeile des Action-Buttons durch die folgenden zwei Zeilen:

```markdown
| **Action-Button** | ↩ — löst die primäre Aktion aus. Immer sichtbar, `disabled` solange das Feld leer ist. |
| **Modus-Buttons** | _Nur Haupt-App:_ ein oder zwei Buttons, die in einen anderen Eingabemodus wechseln (Abschnitt 3). |
```

- [ ] **Step 5: Neuen Abschnitt 3 einfügen**

Füge direkt vor dem bisherigen Abschnitt „3. Verhalten" (der zu „4. Verhalten" wird) ein:

```markdown
## 3. Eingabe-Modi

_Nur Haupt-App._ Ein Feld kann bis zu drei Eingabemodi anbieten. Welche das sind, legt die
Verwendungsstelle über den Input `modes` fest:

```typescript
type InputMode = 'keyboard' | 'camera' | 'numpad';

@Input() modes: InputMode[] = ['keyboard'];
```

| Modus | Verhalten |
|---|---|
| `keyboard` | Normales Eingabefeld mit `pAutoFocus`. Ein **USB-Barcode-Scanner** arbeitet per Tastatur-Emulation und tippt in genau dieses Feld — er ist deshalb kein eigener Modus. |
| `camera` | Live-Kamerabild **an der Position des Eingabefeldes** ([Barcode-Scanner](../barcode-scanner/component.md)), kein Modal und kein Backdrop. Die Modus-Buttons bleiben dadurch bedienbar. |
| `numpad` | Feld auf `readonly`, damit keine native Tastatur erscheint. [Numpad](../numpad/component.md) unter dem Feld. Dessen `⏎` löst dieselbe Aktion aus wie der ↩-Button; das Parent bindet `submitted` an dieselbe Methode. |

### Sichtbarkeitsregel der Modus-Buttons

Die Modus-Reihenfolge ist fest: **Tastatur → Kamera → Numpad**. Sichtbar sind stets die
beiden *nicht* aktiven Modi in genau dieser Reihenfolge:

| Aktiver Modus | Modus-A | Modus-B |
|---|---|---|
| Tastatur | 📷 Kamera (`pi pi-camera`) | ⊞ Numpad (`pi pi-th-large`) |
| Kamera | ⌨ Tastatur (`pi pi-keyboard`) | ⊞ Numpad (`pi pi-th-large`) |
| Numpad | ⌨ Tastatur (`pi pi-keyboard`) | 📷 Kamera (`pi pi-camera`) |

Die feste Reihenfolge hält die Button-Positionen vorhersehbar — der linke Modus-Button ist
immer der in der Kette frühere. Bietet ein Feld nur zwei Modi an, erscheint genau **ein**
Modus-Button.

### Startmodus

Jede Seite und jedes Popup startet im **Tastatur-Modus**. Die Modus-Wahl gilt bis zum
Verlassen der Seite bzw. des Popups und wird nicht persistiert — kein `localStorage`.

Damit ist ein Tablet mit angestecktem USB-Barcode-Scanner ohne Umschalten sofort
einsatzbereit. Ein geräteabhängiger Default (`pointer: coarse` → Numpad) würde genau
diesen Fall brechen.

### Kamera-Lebensdauer

Der Kamera-Modus ist kein Modal; es gibt kein „Schließen", an dem die Freigabe hängen
könnte. Das System setzt `active = false` und gibt alle MediaStream-Tracks frei, sobald

- in einen anderen Eingabemodus gewechselt wird,
- ein Treffer den Kamera-Modus beendet (Ausprägung je Verwendungsstelle),
- das umgebende Popup geschlossen oder die Route verlassen wird.
```

- [ ] **Step 6: Bisherigen Action-Button-Absatz im Verhalten ersetzen**

Ersetze im (jetzt) Abschnitt „4. Verhalten" den Unterabschnitt „### Action-Button" vollständig durch:

```markdown
### Action-Button

- **↩ (Submit):** Immer sichtbar. Löst die primäre Aktion aus (z. B. Suche starten, Artikel
  buchen). `disabled`, solange das Eingabefeld leer ist.
- Ein Kamera-Button an dieser Stelle entfällt: Die Kamera ist ein Eingabemodus (Abschnitt 3),
  keine Aktion.
```

- [ ] **Step 7: Preis-Variante um die Ausnahme ergänzen**

Füge in Abschnitt „5. Preis-Variante — €-Addon" nach dem Aufzählungspunkt zum €-Zeichen ein:

```markdown
- **Ausnahme zur Regel „keine Buttons":** Bietet die Verwendungsstelle neben der Tastatur
  auch den Numpad an, erscheint rechts des €-Addons ein einzelner Modus-Button. Clear- und
  Action-Button bleiben auch dann ausgeblendet.
```

- [ ] **Step 8: PrimeNG-Basis ergänzen**

Ersetze in Abschnitt „6. PrimeNG-Basis" den Code-Block durch:

```markdown
```
p-inputgroup          ← Äußerer Wrapper (flex-Container)
├── p-inputgroupaddon ← Left-Addon (🔍) oder Right-Addon (€)
├── pInputText        ← Eingabefeld (Direktive auf <input>)
├── p-button          ← Clear-Button ([text]="true" [rounded]="true", Icon-Stil)
├── p-progressspinner ← Spinner (ersetzt Clear-Button während Suche)
├── p-button          ← Action-Button ↩ ([text]="true" [rounded]="true", [disabled] wenn leer)
├── p-button          ← Modus-Button A ([text]="true" [rounded]="true")
└── p-button          ← Modus-Button B ([text]="true" [rounded]="true", nur bei drei Modi)
```

Im Kamera-Modus ersetzt `barcode-scanner` das `pInputText` an dessen Position;
im Numpad-Modus steht `app-numpad` unterhalb der `p-inputgroup`.
```

- [ ] **Step 9: Akzeptanzkriterien anpassen**

Ersetze AC-3 durch die folgenden Kriterien und nummeriere die bisherigen AC-4 bis AC-6 zu AC-8 bis AC-10 um:

```markdown
3. **AC-3** — THE SYSTEM SHALL den Action-Button (↩) permanent anzeigen und ihn deaktivieren, solange das Eingabefeld leer ist.
4. **AC-4** — WHEN eine Seite oder ein Popup mit einem mehrmodigen Feld geöffnet wird, THEN SHALL das System den Tastatur-Modus aktivieren, unabhängig vom Eingabegerät.
5. **AC-5** — WHILE ein Modus aktiv ist, SHALL das System genau die übrigen in `modes` konfigurierten Modi als Modus-Buttons anzeigen, in der Reihenfolge Tastatur → Kamera → Numpad.
6. **AC-6** — WHEN in den Numpad-Modus gewechselt wird, THEN SHALL das System das Eingabefeld auf `readonly` setzen und den Numpad unterhalb des Feldes einblenden.
7. **AC-7** — WHEN der Kamera-Modus verlassen wird, das umgebende Popup geschlossen oder die Route gewechselt wird, THEN SHALL das System `active = false` setzen, sodass alle MediaStream-Tracks freigegeben werden.
```

- [ ] **Step 10: Änderung verifizieren**

Run:
```bash
grep -n "InputMode\|modes\b" docs/components/input-group/component.md
```
Expected: Treffer im Abschnitt 3 (Typdefinition und `@Input`).

Run:
```bash
grep -n "📷 wenn leer\|📷 wenn das Feld leer" docs/components/input-group/component.md
```
Expected: **keine Ausgabe** — die alte Action-Button-Regel ist entfernt.

Run:
```bash
grep -c "AC-" docs/components/input-group/component.md
```
Expected: `10`.

- [ ] **Step 11: Commit**

```bash
git add docs/components/input-group/component.md
git commit -m "docs(components): InputGroup als alleinige Quelle der drei Eingabemodi"
```

---

### Task 3: Payment-Panel — Numpad-Flags und Enter als Bestätigung

**Files:**
- Modify: `docs/components/payment-panel/component.md`

**Interfaces:**
- Consumes: `showDecimal`, `showEnter`, `enterDisabled`, `submitted` (Task 1); `modes` und die Startmodus-Regel (Task 2).
- Produces: nichts, was spätere Tasks brauchen.

- [ ] **Step 1: Frontmatter aktualisieren**

Ersetze `updated: 2026-07-31` durch:

```markdown
updated: 2026-08-18
```

- [ ] **Step 2: Abschnitt „Eingabe-Modus: Tastatur vs. Numpad" ersetzen**

Ersetze in Abschnitt „3. Verhalten" den kompletten Unterabschnitt „### Eingabe-Modus: Tastatur vs. Numpad" (inklusive des `numpadActive`-Code-Blocks und der beiden Aufzählungspunkte) durch:

```markdown
### Eingabe-Modus: Tastatur vs. Numpad

Das Panel bietet zwei Modi an — `modes = ['keyboard', 'numpad']`. Eine Kamera gibt es hier
nicht; entsprechend erscheint genau **ein** Modus-Button im Eingabefeld-Addon.

Mechanik, Reihenfolge und Startmodus stehen in
[InputGroup](../input-group/component.md) Abschnitt 3 und werden hier nicht wiederholt.
Für das Panel heißt das: Es öffnet **immer** im Tastatur-Modus, auch auf einem Tablet.

Im Numpad-Modus ist `p-inputnumber` auf `readonly` gesetzt, sodass keine native Tastatur
erscheint.
```

- [ ] **Step 3: Numpad-Integration um Enter erweitern**

Ersetze im Unterabschnitt „### Numpad-Integration" den Code-Block durch:

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

onNumpadSubmit(): void {
    this.confirm();
}
```

und füge darunter ein:

```markdown
Der Numpad läuft hier mit `showDecimal="true"` (Beträge haben Nachkommastellen) und
`showEnter="true"`. `enterDisabled` ist an dieselbe Bedingung gekoppelt wie der
Bestätigen-Button: `receivedAmount < totalAmount`. Damit bleibt der Kassiervorgang
einhändig am Numpad, und `⏎` tut nie etwas anderes als der sichtbare Button.
```

- [ ] **Step 4: Fokus-Abschnitt anpassen**

Ersetze den Unterabschnitt „### Fokus beim Öffnen" durch:

```markdown
### Fokus beim Öffnen

Das Panel öffnet im Tastatur-Modus; `p-inputnumber` erhält automatisch den Fokus
(`pAutoFocus`). Wechselt der Nutzer in den Numpad-Modus, entfällt der Fokusbedarf — er
tippt direkt über den Numpad.
```

- [ ] **Step 5: Abbrechen-Verhalten korrigieren**

Ersetze im Unterabschnitt „### Abbrechen" den zweiten Satz durch:

```markdown
Das Panel setzt `receivedAmount` auf `null` und den Eingabemodus auf `keyboard` zurück.
```

- [ ] **Step 6: Layout-Details und PrimeNG-Basis aktualisieren**

Ersetze in Abschnitt „4. Layout-Details" die Zeile `| Numpad | volle Breite, margin-top 8 px |` durch:

```markdown
| Numpad | volle Breite; Außenabstand kommt aus der Komponente selbst (`margin: 16px 0`, siehe [Numpad](../numpad/component.md) §6) |
```

Ersetze in Abschnitt „5. PrimeNG-Basis" den `app-numpad`-Block durch:

```markdown
app-numpad
  *ngIf="mode === 'numpad'"
  [showDecimal]="true"
  [showEnter]="true"
  [enterDisabled]="receivedAmount < totalAmount"
  (keyPressed)="onNumpadKey($event)"
  (cleared)="onNumpadClear()"
  (submitted)="onNumpadSubmit()"
```

und ersetze im selben Block die Toggle-Button-Zeilen durch:

```markdown
p-button  [icon]="'pi pi-th-large'"   ← Modus-Button; im Numpad-Modus 'pi pi-keyboard'
          severity="secondary"  [rounded]="true"  [text]="true"
```

- [ ] **Step 7: Akzeptanzkriterien anpassen**

Ersetze AC-4 und AC-5 durch:

```markdown
4. **AC-4** — WHEN das Panel geöffnet wird, THEN SHALL das System den Tastatur-Modus aktivieren, unabhängig vom Eingabegerät.
5. **AC-5** — WHEN der Modus-Button geklickt wird, THEN SHALL das System zwischen Tastatur- und Numpad-Modus wechseln, das Icon auf den jeweils inaktiven Modus setzen und im Numpad-Modus `p-inputnumber` auf `readonly` schalten.
```

und ergänze am Ende der Liste:

```markdown
7. **AC-7** — WHEN `⏎` auf dem Numpad geklickt wird, THEN SHALL das System denselben Vorgang auslösen wie der Bestätigen-Button.
8. **AC-8** — WHILE `receivedAmount < totalAmount` gilt, SHALL das System sowohl den Bestätigen-Button als auch `⏎` deaktiviert halten.
```

- [ ] **Step 8: Änderung verifizieren**

Run:
```bash
grep -n "numpadActive\|pointer: coarse" docs/components/payment-panel/component.md
```
Expected: **keine Ausgabe**.

Run:
```bash
grep -n "showEnter\|enterDisabled\|onNumpadSubmit" docs/components/payment-panel/component.md
```
Expected: mindestens vier Treffer.

- [ ] **Step 9: Commit**

```bash
git add docs/components/payment-panel/component.md
git commit -m "docs(components): Payment-Panel nutzt Numpad-Enter und die InputGroup-Modi"
```

---

### Task 4: Scan-Dialog — eigener Umschalter entfällt

**Files:**
- Modify: `docs/components/scan-dialog/component.md`

**Interfaces:**
- Consumes: `modes`, Sichtbarkeitsregel, Startmodus, Kamera-Lebensdauer (Task 2); Numpad-Flags (Task 1).
- Produces: nichts, was spätere Tasks brauchen.

- [ ] **Step 1: Frontmatter aktualisieren**

Ersetze `updated: 2026-07-31` durch:

```markdown
updated: 2026-08-18
```

- [ ] **Step 2: Modus-Beschreibung im Überblick ersetzen**

Ersetze im Abschnitt „Überblick" die Zeilen ab „Der Dialog hat zwei Modi, zwischen denen der Nutzer jederzeit wechseln kann:" bis zum Ende des Abschnitts durch:

```markdown
Das Artikelnummer-Feld des Dialogs ist eine [InputGroup](../input-group/component.md) mit
`modes = ['keyboard', 'camera', 'numpad']`. Umschaltmechanik, Button-Reihenfolge,
Startmodus und Kamera-Freigabe stehen dort in Abschnitt 3 und werden hier nicht wiederholt.

| Modus | Besonderheit im Scan-Dialog |
|---|---|
| Tastatur | AutoComplete-Liste der ausstehenden Artikel unter dem Feld |
| Kamera | Kamerabild ersetzt Feld **und** Liste; Dauerscan mit Feedback-Overlay (Abschnitt 4) |
| Numpad | AutoComplete-Liste bleibt sichtbar; `⏎` bestätigt die getippte Nummer |
```

- [ ] **Step 3: ASCII-Skizzen anpassen**

Ersetze in Abschnitt „1. ASCII-Darstellung" die Zeile

```
│  │ Artikelnummer eingeben ...     │ [📷] │  │
```

durch:

```
│  │ Artikelnummer eingeben ... │↩│📷│⊞│  │
```

Ersetze in der Kamera-Skizze die Zeile

```
│  [← Zurück zur Eingabe]                    │
```

durch:

```
│  [⌨ Tastatur]  [⊞ Numpad]                  │
```

und ersetze die Überschriftszeile `Kamera-Modus (nach Klick auf [📷]):` durch:

```
Kamera-Modus:
```

- [ ] **Step 4: BC-Button-Abschnitt ersetzen**

Ersetze in Abschnitt „3. Eingabe-Modus" den kompletten Unterabschnitt „### BC-Button" durch:

```markdown
### Numpad-Modus

Der Numpad läuft hier mit `showDecimal="false"` (Artikelnummern sind ganzzahlig) und
`showEnter="true"`. `⏎` bestätigt die getippte Nummer — identisch zu `Enter` im
Tastatur-Modus (Tabelle oben).
```

- [ ] **Step 5: Abbrechen-Button ersetzen**

Ersetze in Abschnitt „4. Kamera-Modus" den kompletten Unterabschnitt „### Abbrechen-Button" durch:

```markdown
### Verlassen des Kamera-Modus

Über die Modus-Buttons unterhalb des Kamerabilds — `⌨ Tastatur` und `⊞ Numpad`. Ein eigener
„Zurück"-Button entfällt; das Zurückschalten *ist* der Moduswechsel. Beim Wechsel gibt das
System die Kamera frei ([InputGroup](../input-group/component.md) Abschnitt 3,
Kamera-Lebensdauer).
```

- [ ] **Step 6: PrimeNG-Basis aktualisieren**

Ersetze in Abschnitt „6. PrimeNG-Basis" die Zeile `p-button           ← BC-Button (Kamera-Wechsel), Zurück-Button` durch:

```markdown
p-inputgroup       ← Artikelnummer-Feld mit ↩- und Modus-Buttons (siehe input-group)
app-numpad         ← nur im Numpad-Modus
```

- [ ] **Step 7: Akzeptanzkriterium ergänzen**

Füge am Ende der Akzeptanzkriterien-Liste an:

```markdown
6. **AC-6** — WHEN der Dialog geöffnet wird, THEN SHALL das System den Tastatur-Modus aktivieren und die drei Modi `keyboard`, `camera`, `numpad` anbieten.
7. **AC-7** — WHEN aus dem Kamera-Modus in einen anderen Modus gewechselt wird, THEN SHALL das System die Kamera stoppen und alle MediaStream-Tracks freigeben.
```

- [ ] **Step 8: Änderung verifizieren**

Run:
```bash
grep -n "Zurück zur Eingabe\|BC-Button" docs/components/scan-dialog/component.md
```
Expected: **keine Ausgabe**.

Run:
```bash
grep -n "modes = \['keyboard', 'camera', 'numpad'\]" docs/components/scan-dialog/component.md
```
Expected: ein Treffer im Überblick.

- [ ] **Step 9: Commit**

```bash
git add docs/components/scan-dialog/component.md
git commit -m "docs(components): Scan-Dialog nutzt die InputGroup-Modi statt eigenem Umschalter"
```

---

### Task 5: Seller-Search — Scan-Modus geht in die Modus-Mechanik auf

**Files:**
- Modify: `docs/components/seller-search/component.md`

**Interfaces:**
- Consumes: `modes`, Sichtbarkeitsregel, Startmodus, Kamera-Lebensdauer (Task 2); Numpad-Flags (Task 1).
- Produces: nichts, was spätere Tasks brauchen.

- [ ] **Step 1: Frontmatter aktualisieren**

Setze `updated: 2026-08-18`.

- [ ] **Step 2: Modus-Aufzählung ersetzen**

Ersetze die beiden Aufzählungspunkte

```
- **Text-Modus** — manuelle Eingabe von Name oder Nummer
- **Scan-Modus** — QR-/Barcode-Erkennung per Kamera (optional, via `showScanButton`)
```

durch:

```markdown
Das Suchfeld ist eine [InputGroup](../input-group/component.md); Umschaltmechanik,
Button-Reihenfolge und Startmodus stehen dort in Abschnitt 3.

| Modus | Besonderheit in der Verkäufersuche |
|---|---|
| Tastatur | Manuelle Eingabe von Name oder Nummer |
| Kamera | QR-/Barcode-Erkennung; Kamerabild ersetzt die Trefferliste. Nur verfügbar, wenn `showScanButton` gesetzt ist |
| Numpad | Für die Suche nach reiner Verkäufernummer; `showDecimal="false"`, `showEnter="true"`, `⏎` startet die Suche |
```

- [ ] **Step 3: Toggle-Beschreibung ersetzen**

Ersetze die beiden Sätze

```
Klick auf 📷 → Kamera startet, Videostream **ersetzt die Trefferliste** im Kartenbereich.
Klick erneut auf 📷 (oder `Escape`) → Kamera stoppt, Trefferliste erscheint wieder.
```

durch:

```markdown
Wechsel in den Kamera-Modus → Videostream **ersetzt die Trefferliste** im Kartenbereich.
Wechsel in einen anderen Modus (oder `Escape`) → Kamera stoppt, Trefferliste erscheint
wieder und alle MediaStream-Tracks werden freigegeben.
```

- [ ] **Step 4: Tastatur-Tabelle anpassen**

Ersetze die Zeile

```
| `Escape` (Scan-Modus) | Kamera stoppt, zurück zu Text-Modus |
```

durch:

```markdown
| `Escape` (Kamera-Modus) | Kamera stoppt, zurück in den zuvor aktiven Modus |
```

- [ ] **Step 5: Treffer-Tabelle anpassen**

Ersetze in der Trefferzahl-Tabelle die Zeile für „Mehrere" durch:

```markdown
| **Mehrere** | Kamera stoppt, Rückkehr in den zuvor aktiven Modus, Trefferliste erscheint |
```

- [ ] **Step 6: Änderung verifizieren**

Run:
```bash
grep -n "Text-Modus\|Scan-Modus" docs/components/seller-search/component.md
```
Expected: **keine Ausgabe** — beide Begriffe sind durch Tastatur- bzw. Kamera-Modus ersetzt.

Run:
```bash
grep -n "showScanButton" docs/components/seller-search/component.md
```
Expected: mindestens ein Treffer — der Input bleibt erhalten und steuert die Verfügbarkeit des Kamera-Modus.

- [ ] **Step 7: Commit**

```bash
git add docs/components/seller-search/component.md
git commit -m "docs(components): Verkaeufersuche auf die drei Eingabemodi umgestellt"
```

---

### Task 6: Epic_Verkauf — drei Modi, Kamera inline, Review-Status

**Files:**
- Modify: `docs/requirements/bazaar-app/epics/Epic_Verkauf/epic.md`

**Interfaces:**
- Consumes: Abschnitt 3 aus `input-group/component.md` (Task 2).
- Produces: den Verweis auf `stories/VERKAUF-S01-eingabemodi.md`, den Task 7 anlegt.

- [ ] **Step 1: Frontmatter — Review-Status zurücksetzen**

Ersetze den Frontmatter-Block durch:

```markdown
---
id: F-BA-002
code: VERKAUF
status: draft
updated: 2026-08-18
---
```

Die Zeile `reviewed-date: 2026-08-17` entfällt vollständig: Das Epic wird fachlich verändert und durchläuft den Review erneut.

- [ ] **Step 2: Eingabemöglichkeiten ersetzen**

Ersetze in Abschnitt „2. Artikelnummer-Eingabe" den kompletten Unterabschnitt „### Eingabemöglichkeiten" durch:

```markdown
### Eingabemöglichkeiten

Das Artikelnummer-Feld ist eine [InputGroup](../../../../components/input-group/component.md)
mit `modes = ['keyboard', 'camera', 'numpad']`. Die Umschaltmechanik steht dort in
Abschnitt 3; hier stehen nur die Verkauf-spezifischen Ausprägungen.

| Modus | Ausprägung im Verkauf |
|---|---|
| Tastatur | Startmodus. Der **USB-Barcode-Scanner** tippt die Nummer hierhin und bestätigt mit Enter |
| Kamera | Inline-Kamerabild an der Position des Feldes ([Barcode-Scanner](../../../../components/barcode-scanner/component.md)) — kein Modal. Nach dem ersten Treffer kehrt das Feld in den zuvor aktiven Modus zurück |
| Numpad | `showDecimal="false"` (Artikelnummern sind ganzzahlig), `showEnter="true"`; `⏎` löst den Artikel-Lookup aus |

**Die Kamera verlässt sich nach einem Treffer selbst.** Anders als beim Dauerscan der
Artikelannahme ([ANNAHME-S01](../Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md))
wird hier kassiert: Der erkannte Artikel geht **nicht** direkt in den Warenkorb, sondern
erst per Klick auf den Preis-Button. Bliebe die Kamera aktiv, liefe der Scanner während
dieser Bestätigung weiter und erfasste den nächstbesten Artikel im Bild.

Details → [VERKAUF-S01](stories/VERKAUF-S01-eingabemodi.md)
```

- [ ] **Step 3: Bezahlpopup-Beschreibung an das Payment-Panel angleichen**

Ersetze in Abschnitt „4. Buchung / Bezahlpopup" den Punkt 2 der Liste „Popup-Inhalt" durch:

```markdown
2. **InputGroup** „Betrag erhalten (€)" — `modes = ['keyboard', 'numpad']`, €-Addon rechts, mt 16 px. Aufbau und `⏎`-Verhalten → [Payment-Panel](../../../../components/payment-panel/component.md)
```

- [ ] **Step 4: Änderung verifizieren**

Run:
```bash
grep -n "reviewed" docs/requirements/bazaar-app/epics/Epic_Verkauf/epic.md
```
Expected: **keine Ausgabe**.

Run:
```bash
grep -n "modes = \['keyboard', 'camera', 'numpad'\]" docs/requirements/bazaar-app/epics/Epic_Verkauf/epic.md
```
Expected: ein Treffer.

- [ ] **Step 5: Commit**

```bash
git add docs/requirements/bazaar-app/epics/Epic_Verkauf/epic.md
git commit -m "docs(VERKAUF): drei Eingabemodi im Kassenvorgang, Review-Status zurueckgesetzt"
```

---

### Task 7: VERKAUF-S01 umschreiben und umbenennen

**Files:**
- Rename: `docs/requirements/bazaar-app/epics/Epic_Verkauf/stories/VERKAUF-S01-popup-camera-mode.md` → `docs/requirements/bazaar-app/epics/Epic_Verkauf/stories/VERKAUF-S01-eingabemodi.md`
- Modify: die umbenannte Datei (vollständiger Neuinhalt)

**Interfaces:**
- Consumes: Abschnitt 3 aus `input-group/component.md` (Task 2), Abschnitt 2 aus `Epic_Verkauf/epic.md` (Task 6).
- Produces: den neuen Dateinamen, auf den Task 8 und Task 10 die Querverweise umbiegen.

- [ ] **Step 1: Datei umbenennen**

```bash
git mv docs/requirements/bazaar-app/epics/Epic_Verkauf/stories/VERKAUF-S01-popup-camera-mode.md docs/requirements/bazaar-app/epics/Epic_Verkauf/stories/VERKAUF-S01-eingabemodi.md
```

- [ ] **Step 2: Inhalt vollständig ersetzen**

Schreibe in `docs/requirements/bazaar-app/epics/Epic_Verkauf/stories/VERKAUF-S01-eingabemodi.md`:

````markdown
---
id: VERKAUF-S01
status: draft
depends-on: []
---

# Story: Drei Eingabemodi im Kassenvorgang

## Ziel

Als Kassenpersonal kann ich die Artikelnummer wahlweise per Tastatur, Kamera oder
Nummernblock erfassen, damit ich an jedem Arbeitsplatz zügig kassieren kann — mit
USB-Scanner am Desktop ebenso wie am Tablet ohne angestecktes Gerät.

## Kontext

Das Artikelnummer-Feld ist eine
[InputGroup](../../../../../components/input-group/component.md) mit
`modes = ['keyboard', 'camera', 'numpad']`. Die Umschaltmechanik — feste Reihenfolge,
Sichtbarkeit der beiden Modus-Buttons, Startmodus, Kamera-Freigabe — steht dort in
Abschnitt 3 und wird hier **nicht** wiederholt. Diese Story beschreibt ausschließlich, was
im Kassenvorgang davon abweicht oder daran hängt.

Der Dauerscan mit Countdown, wie ihn Artikel-Freigabe und Rückgabe verwenden, ist in
[ANNAHME-S01](../../Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md)
beschrieben. Der Unterschied ist fachlich: Dort werden Zeitstempel gesetzt, hier wird
Geld kassiert.

## Scope

**In Scope:** Verfügbare Modi des Artikelnummer-Feldes, Rückkehr in den vorherigen Modus
nach einem Treffer, Zusammenspiel mit dem Preis-Button, Numpad-Konfiguration,
Kamera-Freigabe beim Verlassen der Route, Fehlerfall ohne Kamerazugriff.

**Out of Scope:** Die Modus-Mechanik selbst (InputGroup Abschnitt 3), die Artikel-Erkennung
und die InfoArea-Zustände (Epic Abschnitt 2), Warenkorb und Bezahlpopup (Epic
Abschnitte 3–4), der Dauerscan (ANNAHME-S01).

## UI-Spezifikation

### Tastatur-Modus (Startmodus)

```
┌────────────────────────────────────────────┐
│  Artikelnummer eingeben                    │
├──────────────────────────────┬──┬──┬──┬────┤
│  [Nummer eingeben ...      ] │↩ │📷│⊞ │    │ ← AC-1, AC-2
└──────────────────────────────┴──┴──┴──┴────┘
  ↩ ist deaktiviert, solange das Feld leer ist
```

### Kamera-Modus

```
┌────────────────────────────────────────────┐
│ ╔════════════════════════════════════════╗ │
│ ║   [Live-Kamerabild + Scan-Rahmen]      ║ │ ← AC-3
│ ╚════════════════════════════════════════╝ │
│  [⌨ Tastatur]  [⊞ Numpad]                  │ ← AC-2
└────────────────────────────────────────────┘
  Kein Modal, kein Backdrop — Warenkorb und InfoArea bleiben sichtbar
```

### Numpad-Modus

```
┌────────────────────────────────────────────┐
│  ┌──────────────────────────┬──┬──┬──┐     │
│  │  1043        [readonly]  │↩ │⌨ │📷│     │ ← AC-2
│  └──────────────────────────┴──┴──┴──┘     │
│  ┌──────┬──────┬──────┬──────┐             │
│  │  7   │  8   │  9   │      │             │
│  ├──────┼──────┼──────┤  ⌫   │             │
│  │  4   │  5   │  6   │      │             │
│  ├──────┼──────┼──────┼──────┤             │
│  │  1   │  2   │  3   │      │             │
│  ├──────┼──────┼──────┤  ⏎   │             │
│  │  C   │      │  0   │      │             │ ← kein Komma (AC-5)
│  └──────┴──────┴──────┴──────┘             │
└────────────────────────────────────────────┘
```

### Nach einem Kamera-Treffer

```
┌──────────────────────────────┬──┬──┬──┐
│  12345678                 ✕  │↩ │⌨ │⊞ │  ← zurück im Tastatur-Modus (AC-4)
└──────────────────────────────┴──┴──┴──┘
  Artikel-Lookup läuft; Preis-Button erscheint (Epic Abschnitt 2)
```

## Akzeptanzkriterien

- [ ] **AC-1** — WHEN die Verkauf-Seite geöffnet wird, THEN SHALL das System das Artikelnummer-Feld im Tastatur-Modus anzeigen und den Fokus daraufsetzen, sodass ein USB-Barcode-Scanner ohne Umschalten funktioniert.
- [ ] **AC-2** — THE SYSTEM SHALL am Artikelnummer-Feld die Modi `keyboard`, `camera` und `numpad` anbieten und stets die beiden nicht aktiven als Modus-Buttons anzeigen.
- [ ] **AC-3** — WHEN in den Kamera-Modus gewechselt wird, THEN SHALL das System das Live-Kamerabild an der Position des Eingabefeldes einblenden — ohne Modal und ohne Backdrop —, sodass Warenkorb und InfoArea sichtbar bleiben.
- [ ] **AC-4** — WHEN im Kamera-Modus ein Barcode oder QR-Code erkannt wird, THEN SHALL das System den Wert in das Eingabefeld übernehmen, in den zuvor aktiven Modus zurückkehren, die Kamera freigeben und den Artikel-Lookup auslösen.
- [ ] **AC-5** — WHILE der Numpad-Modus aktiv ist, SHALL das System den Numpad mit `showDecimal="false"` und `showEnter="true"` betreiben und das Eingabefeld auf `readonly` setzen.
- [ ] **AC-6** — WHEN `⏎` auf dem Numpad geklickt wird, THEN SHALL das System denselben Artikel-Lookup auslösen wie der ↩-Button.
- [ ] **AC-7** — WHEN nach dem ersten Treffer weitere Codes emittiert werden, THEN SHALL das System sie verwerfen — je Kamera-Phase wird genau ein Wert übernommen.
- [ ] **AC-8** — IF die Kamera nicht verfügbar oder der Zugriff verweigert wird, THEN SHALL das System in den Tastatur-Modus zurückkehren und eine rote InfoArea mit dem Text „Kamerazugriff nicht möglich" anzeigen.
- [ ] **AC-9** — WHEN die Verkauf-Route verlassen wird, während der Kamera-Modus aktiv ist, THEN SHALL das System `active = false` setzen, sodass alle MediaStream-Tracks freigegeben werden.
- [ ] **AC-10** — THE SYSTEM SHALL einen erkannten Artikel nicht unmittelbar in den Warenkorb legen; er wird wie bei Tastatureingabe erst über den Preis-Button hinzugefügt (Epic Abschnitt 2).

## Abhängigkeiten

| Abhängigkeit | Grund |
|---|---|
| [InputGroup](../../../../../components/input-group/component.md) | Modus-Mechanik, Sichtbarkeitsregel, Startmodus, Kamera-Lebensdauer |
| [Numpad](../../../../../components/numpad/component.md) | Tastenlayout, `showDecimal` / `showEnter`, `submitted` |
| [Barcode-Scanner](../../../../../components/barcode-scanner/component.md) | Videobild und `codeDetected` |
| Epic Abschnitt 2 | Artikel-Erkennung und Preis-Button, die diese Story nur auslöst |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #eingabemodi #kamera #numpad #scanner #barcode #kassenvorgang #inputgroup
````

- [ ] **Step 3: Änderung verifizieren**

Run:
```bash
grep -rn "VERKAUF-S01-popup-camera-mode" docs/
```
Expected: **keine Ausgabe** — falls doch, korrigiere die gefundenen Verweise in Task 8 bzw. Task 10.

Run:
```bash
grep -c "AC-" docs/requirements/bazaar-app/epics/Epic_Verkauf/stories/VERKAUF-S01-eingabemodi.md
```
Expected: `10`.

- [ ] **Step 4: Commit**

```bash
git add -A docs/requirements/bazaar-app/epics/Epic_Verkauf/stories/
git commit -m "docs(VERKAUF): S01 von Popup-Kamera auf drei Eingabemodi umgeschrieben"
```

---

### Task 8: ANNAHME-S01 — Querverweise und Modus-Button

**Files:**
- Modify: `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md`

**Interfaces:**
- Consumes: den neuen Dateinamen aus Task 7, Abschnitt 3 aus `input-group/component.md` (Task 2).
- Produces: nichts, was spätere Tasks brauchen.

- [ ] **Step 1: Kontext-Absatz korrigieren**

Ersetze im Abschnitt „Kontext" die Sätze

```
Der zweite Scanner-Modus (Popup, schließt nach einem Treffer) ist in
[VERKAUF-S01](../../Epic_Verkauf/stories/VERKAUF-S01-popup-camera-mode.md) beschrieben.
```

durch:

```markdown
Der Kamera-Modus im Verkauf verhält sich anders — er kehrt nach dem ersten Treffer in den
vorherigen Eingabemodus zurück, weil dort kassiert und per Preis-Button bestätigt wird:
[VERKAUF-S01](../../Epic_Verkauf/stories/VERKAUF-S01-eingabemodi.md).

Die Modus-Umschaltung selbst — Reihenfolge, Sichtbarkeit der Buttons, Startmodus — steht in
[InputGroup](../../../../../components/input-group/component.md) Abschnitt 3.
```

- [ ] **Step 2: Scope-Abschnitt korrigieren**

Ersetze in „**Out of Scope:**" die Formulierung `der Popup-Scanner-Modus (VERKAUF-S01)` durch:

```markdown
die Modus-Mechanik selbst (InputGroup Abschnitt 3) und das abweichende Kamera-Verhalten im Verkauf (VERKAUF-S01)
```

- [ ] **Step 3: „← Eingabe"-Button zum Modus-Button machen**

Ersetze in beiden ASCII-Skizzen die Zeile

```
│  [ ← Eingabe ]                      │ ← AC-5
```

durch:

```
│  [⌨ Tastatur]  [⊞ Numpad]           │ ← AC-5
```

Ersetze im Mermaid-Diagramm die Kante

```
    A -- Klick ← Eingabe --> G[Eingabe-Modus\nKamera deaktiviert]
```

durch:

```
    A -- Moduswechsel --> G[Tastatur- oder Numpad-Modus\nKamera deaktiviert]
```

- [ ] **Step 4: AC-5 neu fassen**

Ersetze AC-5 durch:

```markdown
- [ ] **AC-5** — WHEN einer der Modus-Buttons unterhalb des Kamerabilds geklickt wird, THEN SHALL das System jederzeit in den gewählten Eingabemodus wechseln und die Kamera deaktivieren.
```

- [ ] **Step 5: Änderung verifizieren**

Run:
```bash
grep -n "← Eingabe\|Popup-Scanner-Modus\|popup-camera-mode" docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md
```
Expected: **keine Ausgabe**.

- [ ] **Step 6: Commit**

```bash
git add docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md
git commit -m "docs(ANNAHME): S01 an die neuen Eingabemodi angeglichen"
```

---

### Task 9: Artikelannahme — Wizard Schritt 2

**Files:**
- Modify: `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md:123`
- Modify: `docs/requirements/bazaar-app/components/intake-wizard.md:61`, `:74`

**Interfaces:**
- Consumes: Abschnitt 3 aus `input-group/component.md` (Task 2).
- Produces: nichts, was spätere Tasks brauchen.

- [ ] **Step 1: Epic-Feldtabelle anpassen**

Ersetze in `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md` in der Feldtabelle die Zeile für Feld 1 durch:

```markdown
| 1 | Artikelnummer ([InputGroup](../../../../components/input-group/component.md), kein Addon, `modes = ['keyboard', 'camera', 'numpad']`; Kamera inline an der Position des Feldes über [Barcode-Scanner](../../../../components/barcode-scanner/component.md), kehrt nach einem Treffer in den vorherigen Modus zurück) | *(leer)* | ✅ |
```

- [ ] **Step 2: Preis-Feld um den Numpad ergänzen**

Ersetze in derselben Tabelle die Zeile für Feld 4 durch:

```markdown
| 4 | Preis (InputGroup, €-Addon rechts, `modes = ['keyboard', 'numpad']`, Numpad mit `showDecimal="true"`) | *(leer)* | ✅ |
```

- [ ] **Step 3: Wizard-Skizze anpassen**

Ersetze in `docs/requirements/bazaar-app/components/intake-wizard.md` die Zeile

```
│ Artikelnummer  [1043      ] [📷]   │ SITZUNG (2)          │
```

durch:

```
│ Artikelnummer  [1043   ] [↩][📷][⊞]│ SITZUNG (2)          │
```

- [ ] **Step 4: Wizard-Feldtabelle anpassen**

Ersetze in derselben Datei die Zeile

```
| 1 | Artikelnummer ([`input-group`](../../../components/input-group/component.md), Kamera-Button rechts) | — | ✅ |
```

durch:

```markdown
| 1 | Artikelnummer ([`input-group`](../../../components/input-group/component.md), `modes = ['keyboard', 'camera', 'numpad']` — Modus-Mechanik siehe dort, Abschnitt 3) | — | ✅ |
```

- [ ] **Step 5: Änderung verifizieren**

Run:
```bash
grep -n "Kamera-Popup-Button\|Kamera-Button rechts" docs/requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md docs/requirements/bazaar-app/components/intake-wizard.md
```
Expected: **keine Ausgabe**.

- [ ] **Step 6: Commit**

```bash
git add docs/requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md docs/requirements/bazaar-app/components/intake-wizard.md
git commit -m "docs(ANNAHME): Wizard-Felder auf die drei Eingabemodi umgestellt"
```

---

### Task 10: Repo-weite Konsistenzprüfung

**Files:**
- Modify: `docs/components/overview.md` (nur falls die Prüfung in Step 3 einen veralteten Eintrag findet)
- Modify: alle Dateien, die die Prüfungen in Step 1 und 2 als inkonsistent melden

**Interfaces:**
- Consumes: alle Ergebnisse aus Task 1–9.
- Produces: nichts.

- [ ] **Step 1: Tote Verweise auf den Popup-Modus finden**

Run:
```bash
grep -rn "popup-camera-mode\|Popup-Kamera\|Popup-Modus\|Kamera-Popup" docs/
```
Expected: **keine Ausgabe**. Jeder Treffer ist ein Rest der alten Modell-Vorstellung und wird auf die Formulierung aus Task 6 bzw. Task 7 umgestellt.

- [ ] **Step 2: Widersprüchliche Toggle-Beschreibungen finden**

Run:
```bash
grep -rn "numpadActive\|pointer: coarse" docs/
```
Expected: **keine Ausgabe**. Der geräteabhängige Startmodus ist durch „immer Tastatur" ersetzt.

Run:
```bash
grep -rn "↩ wenn\|📷 wenn" docs/
```
Expected: **keine Ausgabe** — die alte Action-Button-Regel darf nirgends überlebt haben.

- [ ] **Step 3: Komponenten-Index prüfen**

Run:
```bash
grep -n "numpad\|input-group\|scan-dialog\|seller-search\|payment-panel" docs/components/overview.md
```
Expected: je ein Eintrag pro Komponente. Beschreibt ein Eintrag die Komponente noch über ihr altes Verhalten (z. B. „Kamera-Button"), formuliere ihn auf die Modus-Sprache um.

- [ ] **Step 4: Relative Links der umbenannten Story prüfen**

Run:
```bash
grep -rn "VERKAUF-S01" docs/
```
Expected: alle Treffer zeigen auf `VERKAUF-S01-eingabemodi.md`; kein Treffer nennt `VERKAUF-S01-popup-camera-mode.md`.

- [ ] **Step 5: Spec-Abgleich**

Lies [`docs/superpowers/specs/2026-08-18-drei-eingabemodi-numpad-design.md`](../specs/2026-08-18-drei-eingabemodi-numpad-design.md) Abschnitt „Betroffene Dokumente" und prüfe jede Zeile gegen `git log --oneline` dieses Branches. Jede Zeile muss von einem Commit aus Task 1–9 abgedeckt sein.

Run:
```bash
git log --oneline master..HEAD
```
Expected: neun Commits aus Task 1–9 plus der Spec-Commit.

- [ ] **Step 6: Offene Feld-Entscheidungen als Notiz festhalten**

Die Spec listet unter „Je Feld zu entscheiden" vier Felder. Drei davon sind mit Task 4 und 5 erledigt (Scan-Dialog für Freigeben- und Rückgabe-Popup, Verkäufersuche). Prüfe, ob `Epic_Verkaeufer` Abschnitt 5 und `Epic_Abrechnung` den Scan-Dialog tatsächlich referenzieren und damit automatisch abgedeckt sind:

Run:
```bash
grep -n "scan-dialog\|Scan-Dialog" docs/requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md docs/requirements/bazaar-app/epics/Epic_Abrechnung/epic.md
```
Expected: je mindestens ein Treffer. Fehlt einer, beschreibt das Epic den Scan selbst und braucht dieselbe Änderung wie Task 9 — dann ergänze sie hier.

- [ ] **Step 7: Commit**

```bash
git add -A docs/
git commit -m "docs(suite): Restverweise auf den Popup-Kamera-Modus bereinigt"
```

Enthält der Commit keine Änderungen, weil alle Prüfungen sauber waren, überspringe diesen Schritt.

---

## Abschluss

Nach Task 10 ist der Branch `docs/eingabemodi-numpad` vollständig. Nächster Schritt ist der
fachliche Review von `Epic_Verkauf`, dessen `status` in Task 6 auf `draft` zurückgesetzt
wurde — sinnvollerweise über die Skill `epic-review`.
