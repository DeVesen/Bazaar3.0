---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: Input

Ein Eingabefeld-Primitive für alle Formularfelder der Voranmelde-App — in vier Varianten:
**Text**, **Icon**, **Password**, **Number**.

## Bild

```
Text:
┌─────────────────────────────┐
│ Bezeichnung                 │
└─────────────────────────────┘

Text readonly:
┌─────────────────────────────┐
│ Ab3dEf7G          (grau)    │
└─────────────────────────────┘

Icon:
┌─────────────────────────────┐
│ 🔍  Suche...                │
└─────────────────────────────┘
┌─────────────────────────────┐
│ ✉  max@example.com          │
└─────────────────────────────┘

Password:
┌─────────────────────────────┐
│ 🔒  ••••••••••••        👁  │
└─────────────────────────────┘

Number:
┌─────────────────────────────┐
│ 12,50                       │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 15,0 %              (grau)  │
└─────────────────────────────┘
```

## Varianten

| Variante     | Aufbau                                                                                     | Einsatz                            |
| ------------ | ------------------------------------------------------------------------------------------ | ---------------------------------- |
| **Text**     | `<input pInputText>`                                                                       | einzeiliger Freitext               |
| **Icon**     | `p-iconfield` → `p-inputicon` (links) + `input pInputText`                                  | Suche, E-Mail — Icon als Kontext   |
| **Password** | `p-iconfield` → linker `p-inputicon` (`pi-lock`, statisch) + `input pInputPassword [(mask)]="mask"` + rechter klickbarer `p-inputicon` (`(click)="mask = !mask"`, `pi-eye`/`pi-eye-slash`) | Passwortfelder |
| **Number**   | `p-inputnumber [locale]="'de-DE'"`                                                          | Zahlen, Geld, Prozent              |

## Modifier

Kombinierbar mit jeder Variante, wo fachlich sinnvoll:

| Modifier              | Umsetzung                          | Bemerkung                                             |
| --------------------- | ---------------------------------- | ----------------------------------------------------- |
| Readonly              | `[readonly]="true"`                | grauer Text, nicht fokussierbar für Eingabe           |
| Autofokus             | `pAutoFocus`                       | Fokus automatisch beim Öffnen des Dialogs             |
| 2 Nachkommastellen    | `[minFractionDigits]="2"`          | nur Number — Geld-/Prozentwerte                       |
| Ohne Toggle           | rechter `p-inputicon` entfällt     | nur Password — z. B. Bestätigungsfeld                 |

## Abgrenzung

| Fall | Stattdessen |
|---|---|
| Prefix-/Suffix-Add-on (z. B. Preis mit „€") | Shared [`input-group`](../../../../components/input-group/component.md) — Suffix-Betrag passt zum Addon-Muster, nicht zum Icon-Overlay |
| Passwort-Stärke-Feedback | [password-strength-meter.md](../custom/password-strength-meter.md) — `pInputPassword` liefert kein automatisches Feedback |
| Auswahl aus Liste (Dropdown oder Type-Ahead) | [select.md](select.md) — Auswahl statt Freitext |

## Verwendung

| Epic/Component | Feld | Variante |
|---|---|---|
| [artikel-dialog.md](../forms/artikel-dialog.md) | Artikelnummer | Text, readonly |
| [artikel-dialog.md](../forms/artikel-dialog.md) | Bezeichnung, Größe, Farbe | Text |
| [artikel-dialog.md](../forms/artikel-dialog.md) | Preis | Number, 2 Nachkommastellen (in `input-group` mit €-Addon) |
| [artikel-readonly-modal.md](../forms/artikel-readonly-modal.md) | Verkäufer (Name+Nummer) | Text, readonly |
| [stammdaten-popup.md](../forms/stammdaten-popup.md), [typ-popup.md](../forms/typ-popup.md) | Name | Text |
| [typ-popup.md](../forms/typ-popup.md) | Provision (%), Gebühr (€) | Number, 2 Nachkommastellen |
| [einstellungen-form.md](../forms/einstellungen-form.md) | `startNumber`/`blockSize`/`defaultBlockCount` | Number |
| [filter-panel.md](../custom/filter-panel.md) | Freitext-Suche | Icon (`pi-search`) |
| [login-form.md](../forms/login-form.md) | E-Mail | Icon (`pi-envelope`) |
| [login-form.md](../forms/login-form.md) | Passwort | Password, mit Toggle |
| [registrierung-form.md](../forms/registrierung-form.md) | E-Mail | Icon (`pi-envelope`) |
| [registrierung-form.md](../forms/registrierung-form.md) | Passwort | Password, mit Toggle |
| [registrierung-form.md](../forms/registrierung-form.md) | Passwort-Bestätigung | Password, ohne Toggle (gleiches Icon-Muster für visuelle Konsistenz) |
| [profil-page.md](../forms/profil-page.md) | Personendaten/Kontakt | Text (E-Mail readonly) |
| [profil-page.md](../forms/profil-page.md) | Neue E-Mail | Icon (`pi-envelope`) |
| [profil-page.md](../forms/profil-page.md) | Aktuelles/Neues/Bestätigungs-Passwort (3×) | Password, mit Toggle |
| [profil-page.md](../forms/profil-page.md) | Gebühr/Provision | Number, readonly |
| [verkaeufer-dialog.md](../forms/verkaeufer-dialog.md) | Vorname | Text + Autofokus |
| [verkaeufer-dialog.md](../forms/verkaeufer-dialog.md) | weitere Personendaten/Kontakt | Text |
| [verkaeufer-dialog.md](../forms/verkaeufer-dialog.md) | Filter-Panel Freitext | Icon (`pi-search`) |
| [verkaeufer-dialog.md](../forms/verkaeufer-dialog.md) | Provision/Gebühr-Anzeige | Number, readonly, 2 Nachkommastellen |
| [verkaeufer-dialog.md](../forms/verkaeufer-dialog.md) | Nummernblock-Initialfeld, Reservieren-Form (2×) | Number |

## Tags & Piles

**Tags:** #input #pinputtext #iconfield #inputicon #inputpassword #inputnumber #primitive #shared-across-epics
