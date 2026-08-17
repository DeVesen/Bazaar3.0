---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Confirmdialog

Bestätigungsabfrage vor irreversiblen Aktionen (v. a. Löschen).

## Bild

```
┌───────────────────────────────────┐
│ ⚠ Bestätigen                      │
│ Diesen Artikel wirklich löschen?  │
│                [Abbrechen] [OK]   │
└───────────────────────────────────┘
```

## Aufbau

`p-confirmdialog` + `ConfirmationService.confirm()` — Aktion (z. B. `DELETE`-Request) läuft erst nach Bestätigung.

## Verwendung

| Epic/Component | Ausgelöst durch |
|---|---|
| [artikel-dialog.md](../../requirements/advance-registration/components/forms/artikel-dialog.md) | Löschen-Button |
| [profil-page.md](../../requirements/advance-registration/components/forms/profil-page.md) | Account löschen |
| [verkaeufer-dialog.md](../../requirements/advance-registration/components/forms/verkaeufer-dialog.md) | Nummernblock löschen (Panel 04) |

## Tags & Piles

**Tags:** #confirmdialog #confirmationservice #primitive #shared-across-epics
