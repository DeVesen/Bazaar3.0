---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Input (Text)

Einfaches einzeiliges Textfeld, ohne Icon/Suffix.

## Bild

```
┌─────────────────────────────┐
│ Bezeichnung                 │
└─────────────────────────────┘

Readonly:
┌─────────────────────────────┐
│ Ab3dEf7G          (grau)    │
└─────────────────────────────┘
```

## Aufbau

`<input pInputText>` — Standard-PrimeNG-Textfeld.

## Varianten

| Variante | Umsetzung |
|---|---|
| Normal | `pInputText` |
| Readonly | `pInputText [readonly]="true"` — grauer Text, nicht fokussierbar für Eingabe |
| Autofokus | `pInputText pAutoFocus` — Fokus automatisch beim Öffnen des Dialogs |

## Verwendung

| Epic/Component | Feld | Variante |
|---|---|---|
| [artikel-dialog.md](artikel-dialog.md) | Artikelnummer | readonly |
| [artikel-dialog.md](artikel-dialog.md) | Bezeichnung, Größe, Farbe | normal |
| [artikel-readonly-modal.md](artikel-readonly-modal.md) | Verkäufer (Name+Nummer) | readonly |
| [kategorie-popup.md](kategorie-popup.md), [marke-popup.md](marke-popup.md), [typ-popup.md](typ-popup.md) | Name | normal |
| [profil-page.md](profil-page.md) | Personendaten/Kontakt | normal (E-Mail readonly) |
| [verkaeufer-dialog.md](verkaeufer-dialog.md) | Vorname | normal + Autofokus |

## Tags & Piles

**Tags:** #input #pinputtext #primitive #shared-across-epics
