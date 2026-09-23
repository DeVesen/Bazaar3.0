---
status: draft
---

# Component: app-input

Eigenständige Text-Input-Komponente (Haupt-App), aufgebaut nach dem PrimeNG-`p-iftalabel`-Muster.
Verwendet ausschließlich PrimeNG-Elemente direkt (`p-inputgroup`, `p-inputgroup-addon`,
`p-iftalabel`, `pInputText`) — keine anderen `app-...`-Komponenten, unabhängig von
[`input-group`](../input-group/component.md).

Quelle: [docs/spec/2026-09-22-app-input.md](../../spec/2026-09-22-app-input.md).

## Verhalten

- `label` gesetzt → Feld steckt in `p-iftalabel` mit Float-Label-Text. `label` nicht gesetzt →
  nacktes `pInputText`-Feld.
- `addonLeft`/`addonRight` (`InputAddon[]`) rendern je Eintrag ein eigenes `p-inputgroup-addon`
  links bzw. rechts, in Array-Reihenfolge. Leeres Array → kein Addon-Slot.
- Jedes Addon ist unabhängig vom `type` klickbar; Klick emittiert `addonClick` mit dem
  Addon-`key`.
- `valueChange` ist der gedämpfte Werte-Stream, Default-Debounce 800ms, einstellbar über
  `debounceMs` (`0` = kein Debounce).
- `enter`, `keyUp`, `keyDown`, `blurred` reichen das native Browser-Event sofort und ungedämpft
  durch.
- Enter im Feld löst sowohl `(keydown.enter)` als auch `(keydown)` auf demselben nativen Event
  aus, damit erzeugt eine Enter-Taste sowohl `enter` als auch `keyDown` — ein Consumer, der auf
  beide hört, bekommt zwei Emissionen pro Enter-Anschlag.
- `disabled` wirkt erst einen Microtask nach dem Setzen des Werts (Angular-Forms-/`NgModel`-
  Implementierungsdetail — `NgModel` synchronisiert seinen Disabled-Status über ein aufgelöstes
  Promise), das gilt auch in Produktion, nicht nur in Tests.
- Pflichtfeld-Stern: Ist `required` gesetzt und ein `label` vorhanden, zeigt die Komponente
  selbst einen roten `*` hinter dem Label-Text im Feldrahmen. Feldfehler-Text
  (`docs/components/form` R-1) bleibt Aufgabe des Parent-Templates.
- Eingabemodi (Kamera/Nummernblock) sind nicht Teil der Komponente; der Parent baut sie über
  `addonRight` + `app-barcode-scanner`/`app-numpad` — Hilfsfunktionen dafür in
  `shared/components/input/field-mode.ts` (Scan-Dialog, Verkäufersuche).

## Parameter

| Parameter | Typ | Default | Bedeutung |
|---|---|---|---|
| `label` | `string \| undefined` | `undefined` | Float-Label-Text; steuert `p-iftalabel` vs. nacktes Feld |
| `value` | `string` | `''` | Aktueller Wert (Parent-gehalten, kein Zweiwege-Binding) |
| `debounceMs` | `number` | `800` | Verzögerung für `valueChange`, `0` = sofort |
| `addonLeft` | `InputAddon[]` | `[]` | Addons links vom Feld |
| `addonRight` | `InputAddon[]` | `[]` | Addons rechts vom Feld |
| `inputId` | `string \| undefined` | `undefined` | `id` des nativen `<input>` |
| `name` | `string \| undefined` | `undefined` | `name` des nativen `<input>` |
| `placeholder` | `string \| undefined` | `undefined` | Platzhaltertext |
| `type` | `string` | `'text'` | nativer `type` (`text`/`email`/`tel` …) |
| `required` | `boolean` | `false` | HTML-`required`; zeigt zusätzlich einen roten `*` am Label |
| `disabled` | `boolean` | `false` | HTML-`disabled` |
| `readOnly` | `boolean` | `false` | HTML-`readonly` |

`InputAddon`: `{ type: 'label' \| 'icon' \| 'button'; value: string; key: string; class?: string; style?: Record<string, string>; }`.
Icon-Werte folgen der Projekt-Konvention `pi pi-...`-CSS-Klasse.

## Events

| Event | Payload | Auslöser |
|---|---|---|
| `valueChange` | `string` | gedämpfter Werte-Stream |
| `enter` | — | Enter-Taste im Feld |
| `keyUp` | `KeyboardEvent` | natives `keyup` |
| `keyDown` | `KeyboardEvent` | natives `keydown` |
| `blurred` | `FocusEvent` | natives `blur` |
| `addonClick` | `string` (Addon-`key`) | Klick auf ein `addonLeft`/`addonRight`-Element |

## Abgrenzung

| Fall | Stattdessen |
|---|---|
| Zahl/Geld/Prozent | [`inputnumber`](../inputnumber/component.md) bzw. [`input-group`](../input-group/component.md) (Preis-Variante) |
| Passwort | `pInputPassword` direkt (Voranmelde-App) |
| Multi-Modus (Tastatur/Kamera/Numpad) | [`input-group`](../input-group/component.md) |

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #component #app-input #iftalabel #inputgroup #primeng
