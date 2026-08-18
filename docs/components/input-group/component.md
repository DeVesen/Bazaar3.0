---
id: C-012
status: draft
updated: 2026-08-18
---

# Component: InputGroup

**Bibliothek:** PrimeNG — `p-inputgroup` + `p-inputgroupaddon` + `pInputText`
**Verwendung:** Beide Apps — alle Eingabefelder mit Such- oder Scan-Funktion sowie Preis-Eingaben.

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Slots — Aufbau
- 3. Eingabe-Modi — Tastatur, Kamera, Numpad
- 4. Verhalten — Interaktionsregeln
- 5. Preis-Variante — €-Addon
- 6. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Eingabefeld mit optionalem Left-Addon, Clear-Button, Lade-Spinner und kontextabhängigem Action-Button.

**Verwendungszweck:** Wird überall dort eingesetzt, wo Eingaben mit Suche, Scan oder Aktion verknüpft sind.

---

## Überblick

Die InputGroup ist das Standard-Muster für alle Such- und Scan-Eingaben in beiden Apps. Sie besteht aus bis zu fünf Slots, die je nach Kontext bestückt oder weggelassen werden. Der Clear-Button und der Spinner teilen sich dieselbe Position und sind nie gleichzeitig sichtbar.

---

## 1. ASCII-Darstellung

```
Standard-InputGroup (Such- / Scan-Feld):
[ 🔍 Left-Addon ][ Input-Feld    ][ ✕ ][ Spinner ][ ↩ ][ Modus-A ][ Modus-B ]

Preis-Variante:
[ Preis eingeben (Kommazahl)    ][ € ][ Modus-A ]
```

---

## 2. Slots — Aufbau

| Slot | Beschreibung |
|---|---|
| **Left-Addon** | Optional (🔍 Lupe bei Suchfeldern). _Nur Haupt-App:_ kein Addon bei reinen Nummernfeldern. |
| **Input-Feld** | Debounce-Suche (800 ms Default). _Nur Haupt-App:_ konfigurierbar via `suchDebounceMs`. |
| **✕ Clear-Button** | Erscheint wenn Input nicht leer. _Nur Haupt-App:_ löscht + setzt Fokus zurück ins Eingabefeld. |
| **Spinner** | Ersetzt temporär den Clear-Button während der Suche läuft. |
| **Action-Button** | ↩ — löst die primäre Aktion aus. Immer sichtbar, `disabled` solange das Feld leer ist. |
| **Modus-Buttons** | _Nur Haupt-App:_ ein oder zwei Buttons, die in einen anderen Eingabemodus wechseln (Abschnitt 3). |

---

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
| `camera` | Live-Kamerabild **an der Position des Eingabefeldes** ([Barcode-Scanner](../barcode-scanner/component.md)), kein Modal und kein Backdrop. Die Modus-Buttons bleiben dadurch bedienbar (Ausprägung je Verwendungsstelle — in [Seller-Search](../seller-search/component.md) ersetzt das Kamerabild stattdessen die **Trefferliste**, weil das Suchfeld den erkannten Wert weiterhin anzeigen muss). |
| `numpad` | Feld auf `readonly`, damit keine native Tastatur erscheint. [Numpad](../numpad/component.md) unter dem Feld. Dessen `⏎` löst dieselbe Aktion aus wie der ↩-Button; das Parent bindet `submitted` an dieselbe Methode. Ein **USB-Barcode-Scanner** kann hier nicht tippen — er arbeitet per Tastatur-Emulation auf ein fokussierbares `<input>`, und das `readonly`-Feld nimmt keine Eingabe an. Rückweg ist der Tastatur-Modus. |

**Position der Modus-Buttons im Kamera-Modus.** Ersetzt das Kamerabild das Eingabefeld
selbst (Standardfall), rutschen die Modus-Buttons unter das Bild — dort stehen sie in einer
eigenen Zeile, wie im [Scan-Dialog](../scan-dialog/component.md). Bleibt das Eingabefeld
dagegen stehen und ersetzt das Kamerabild nur ein anderes Element (z. B. die Trefferliste
im [Seller-Search](../seller-search/component.md)), bleiben die Modus-Buttons an ihrer
gewohnten Position in der `p-inputgroup`.

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

**Kamera nicht verfügbar oder Zugriff verweigert.** In diesem Fall SHALL das System in den
Tastatur-Modus zurückkehren und eine rote InfoArea mit dem Text „Kamerazugriff nicht möglich"
anzeigen. Diese Formulierung ist die einzige Quelle für diesen Fehlerfall — alle
Verwendungsstellen ([Scan-Dialog](../scan-dialog/component.md),
[Seller-Search](../seller-search/component.md) u. a.) verweisen hierher, statt die Regel
eigenständig zu formulieren.

---

## 4. Verhalten

### Clear-Button

- Sichtbar: sobald das Input-Feld einen Wert enthält.
- Aktion: Feld leeren.
- _Nur Haupt-App:_ Fokus wird nach dem Löschen zurück ins Eingabefeld gesetzt.

### Spinner

- Erscheint an der Position des Clear-Buttons, solange eine Suche (Debounce-Phase oder Netzwerkrequest) aktiv ist.
- Clear-Button und Spinner schließen sich gegenseitig aus — nie gleichzeitig sichtbar.

### Action-Button

- **↩ (Submit):** Immer sichtbar. Löst die primäre Aktion aus (z. B. Suche starten, Artikel
  buchen). `disabled`, solange das Eingabefeld leer ist.
- Ein Kamera-Button an dieser Stelle entfällt: Die Kamera ist ein Eingabemodus (Abschnitt 3),
  keine Aktion.

### Debounce

- Default: 800 ms.
- _Nur Haupt-App:_ Konfigurierbar über den Einstellungsparameter `suchDebounceMs` (gespeichert im `localStorage`).

---

## 5. Preis-Variante — €-Addon

```
[ Preis eingeben (Kommazahl)    ][ € ][ Modus-A ]
```

- Das €-Zeichen erscheint als rechter Addon (kein Left-Addon, kein Clear-Button, kein Action-Button).
- **Ausnahme zur Regel „keine Buttons":** Bietet die Verwendungsstelle neben der Tastatur
  auch den Numpad an, erscheint rechts des €-Addons ein einzelner Modus-Button. Clear- und
  Action-Button bleiben auch dann ausgeblendet.
- _Nur Haupt-App:_ Erlaubte Eingabe: Dezimalzahl mit Komma oder Punkt.
- PrimeNG-Komponente: `p-inputnumber` (Locale DE, `minFractionDigits="2"`).

---

## 6. PrimeNG-Basis

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

Im Kamera-Modus ersetzt `barcode-scanner` je nach Verwendungsstelle das `pInputText` oder
ein anderes Element (Abschnitt 3); im Numpad-Modus steht `app-numpad` unterhalb der
`p-inputgroup`.

Preis-Variante: `p-inputnumber` anstelle von `pInputText`; nur ein Addon (rechts, €).

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den Clear-Button (✕) anzeigen, sobald das Eingabefeld einen Wert enthält, und ihn ausblenden, wenn das Feld leer ist.
2. **AC-2** — WHEN eine Suche aktiv ist, THEN SHALL das System den Clear-Button durch `p-progressspinner` ersetzen; beide Elemente sind nie gleichzeitig sichtbar.
3. **AC-3** — THE SYSTEM SHALL den Action-Button (↩) permanent anzeigen und ihn deaktivieren, solange das Eingabefeld leer ist.
4. **AC-4** — WHEN eine Seite oder ein Popup mit einem mehrmodigen Feld geöffnet wird, THEN SHALL das System den Tastatur-Modus aktivieren, unabhängig vom Eingabegerät.
5. **AC-5** — WHILE ein Modus aktiv ist, SHALL das System genau die übrigen in `modes` konfigurierten Modi als Modus-Buttons anzeigen, in der Reihenfolge Tastatur → Kamera → Numpad.
6. **AC-6** — WHEN in den Numpad-Modus gewechselt wird, THEN SHALL das System das Eingabefeld auf `readonly` setzen und den Numpad unterhalb des Feldes einblenden.
7. **AC-7** — WHEN der Kamera-Modus verlassen wird, das umgebende Popup geschlossen oder die Route gewechselt wird, THEN SHALL das System `active = false` setzen, sodass alle MediaStream-Tracks freigegeben werden.
8. **AC-8** — WHERE ein Left-Addon konfiguriert ist, SHALL das System das 🔍-Icon als `p-inputgroupaddon` links des Eingabefelds darstellen; ohne Konfiguration entfällt der Addon-Slot vollständig.
9. **AC-9** — WHEN der Benutzer den Clear-Button betätigt, THEN SHALL das System das Eingabefeld leeren. _(Nur Haupt-App:)_ Zusätzlich SHALL das System den Fokus zurück ins Eingabefeld setzen.
10. **AC-10** — THE SYSTEM SHALL in der Preis-Variante ein `p-inputnumber` mit `minFractionDigits="2"` und Locale DE verwenden; das €-Zeichen erscheint als rechter `p-inputgroupaddon`.

---

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #input-group #suchfeld #debounce #clear-button #action-button #preis #scan
