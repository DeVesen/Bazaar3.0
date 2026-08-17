---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Number-Input

Numerisches Eingabefeld, locale DE (Komma als Dezimaltrennzeichen).

## Bild

```
┌─────────────────────────────┐
│ 12,50                       │
└─────────────────────────────┘

Readonly:
┌─────────────────────────────┐
│ 15,0 %              (grau)  │
└─────────────────────────────┘
```

## Aufbau

`p-inputnumber [locale]="'de-DE'"` — bei Geld-/Prozentwerten zusätzlich `[minFractionDigits]="2"`.

## Varianten

| Variante | Umsetzung |
|---|---|
| Normal | `p-inputnumber locale="de-DE"` |
| Mit 2 Nachkommastellen | + `[minFractionDigits]="2"` (Geld, Prozent) |
| Readonly | + `[readonly]="true"` — für abgeleitete/nicht editierbare Werte |

Preis-Feld mit €-Suffix (InputGroup-Addon statt Icon) → siehe [`docs/components/input-group/`](../../../components/input-group/component.md) (Suite-weit).

## Verwendung

| Epic/Component | Feld | Variante |
|---|---|---|
| [einstellungen-form.md](einstellungen-form.md) | `startNumber`/`blockSize`/`defaultBlockCount` | normal |
| [typ-popup.md](typ-popup.md) | Provision (%), Gebühr (€) | 2 Nachkommastellen |
| [verkaeufer-dialog.md](verkaeufer-dialog.md) | Provision/Gebühr-Anzeige | readonly, 2 Nachkommastellen |
| [verkaeufer-dialog.md](verkaeufer-dialog.md) | Nummernblock-Initialfeld | normal |
| [profil-page.md](profil-page.md) | Gebühr/Provision | readonly |

## Tags & Piles

**Tags:** #number-input #inputnumber #primitive #shared-across-epics
