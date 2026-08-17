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

Für Meldungen mit **Zahlen/Details, die stehen bleiben sollen** (z. B. Export-Ergebnis) → Shared [`info-area`](../../../components/info-area/component.md) statt Toast (kein Auto-Dismiss, besser lesbar).

## Verwendung

| Epic/Component | Aktion | Meldung |
|---|---|---|
| [verkaeufer-dialog.md](verkaeufer-dialog.md) | Einladungs-Link kopieren | „✓ Einladungs-Link kopiert!" |
| [verkaeufer-dialog.md](verkaeufer-dialog.md) | Speichern (Erfolg/Fehler) | „✓ Verkäufer gespeichert" / Fehler-InfoArea |
| [marke-popup.md](marke-popup.md) | Speichern | „✓ Marke gespeichert" |
| [kategorie-popup.md](kategorie-popup.md) | Speichern | „✓ Kategorie gespeichert" |
| [typ-popup.md](typ-popup.md) | Speichern | „✓ Verkäufer-Typ gespeichert" |
| [einstellungen-form.md](einstellungen-form.md) | Speichern | „✓ Einstellungen gespeichert" |

## Tags & Piles

**Tags:** #toast #messageservice #primitive #shared-across-epics
