---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Toast

Kurze, automatisch verschwindende Erfolgs-/Fehler-Meldung nach einer Aktion.

## Bild

```
                    ┌─────────────────────┐
                    │ ✓ Marke gespeichert │
                    └─────────────────────┘
```

## Aufbau

`p-toast` + `MessageService.add(...)` — Standard-Muster für kurze CRUD-Bestätigungen (Speichern/Löschen/Kopieren). Auto-Dismiss nach wenigen Sekunden.

## Abgrenzung

Für Meldungen mit **Zahlen/Details, die stehen bleiben sollen** (z. B. Export-Ergebnis) → Shared [`info-area`](../info-area/component.md) statt Toast (kein Auto-Dismiss, besser lesbar).

## Verwendung

| Epic/Component | Aktion | Meldung |
|---|---|---|
| [verkaeufer-dialog.md](../../requirements/advance-registration/components/verkaeufer-dialog.md) | Einladungs-Link kopieren | „✓ Einladungs-Link kopiert!" |
| [verkaeufer-dialog.md](../../requirements/advance-registration/components/verkaeufer-dialog.md) | Speichern (Erfolg/Fehler) | „✓ Verkäufer gespeichert" / Fehler-InfoArea |
| [stammdaten-popup.md](../stammdaten-popup/component.md) | Speichern | „✓ Marke gespeichert" / „✓ Kategorie gespeichert" |
| [typ-popup.md](../typ-popup/component.md) | Speichern | „✓ Verkäufer-Typ gespeichert" |
| [einstellungen-form.md](../../requirements/advance-registration/components/einstellungen-form.md) | Speichern | „✓ Einstellungen gespeichert" |

## Tags & Piles

**Tags:** #toast #messageservice #primitive #shared-across-epics
