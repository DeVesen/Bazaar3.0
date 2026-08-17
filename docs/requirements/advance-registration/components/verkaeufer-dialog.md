---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: verkaeufer-dialog (+ Filter-Panel)

Deckt Filter-Panel, Anlege-Dialog und Bearbeiten-Dialog in einer Datei ab — größtenteils Anwendung bereits etablierter Bausteine, eine Korrektur (Verkäufer-Typ-Feld).

## Kontext (volle Seite + Dialog)

```
┌─────────────────────────────────────────────────┐
│ Verkäufer                            [+ Neu]    │
├─────────────────────────────────────────────────┤
│ [🔍 Suche Name/Ort/E-Mail...]                    │  ← Filter-Panel
├─────────────────────────────────────────────────┤
│ Nr. │ Vorname │ Nachname │ ... │ Typ │ Prov. │✎│  ← Table (shared)
└─────────────────────────────────────────────────┘

Anlege-/Bearbeiten-Dialog (Modal lg, 80/90% resp. 100/100%):
┌─────────────────────────────────────────┐
│ PERSONENDATEN                            │
│  [Vorname 50%] [Nachname 50%]            │
├─────────────────────────────────────────┤
│ KONTAKT                                  │
│  [Anschrift 100%]                        │
│  [PLZ 50%] [Ort 50%]                     │
│  [Telefon 50%] [E-Mail 50%]              │
├─────────────────────────────────────────┤
│ KONDITIONEN                              │
│  Verkäufer-Typ [p-select]                │
│  Provision: X % · Gebühr: Y € (readonly) │
├─────────────────────────────────────────┤
│ [nur Anlegen] Anzahl initialer Blöcke    │
│  (p-inputnumber)                         │
├─────────────────────────────────────────┤
│ [nur Bearbeiten] NUMMERNBLÖCKE           │
│  101–110 · 10 Nummern · 3 vergeben  [🗑]│
│  111–120 · 10 Nummern · 10 vergeben     │
│                    [Voll — nicht löschbar]│
│  ─────────────────────────────           │
│  Zusätzliche Blöcke reservieren:         │
│  [Anzahl Blöcke] [Startnummer-Vorschlag] │
│  [✓ Reservieren]                         │
├─────────────────────────────────────────┤
│ SONSTIGES                                │
│  ☐ Dieser Verkäufer hat Admin-Rechte     │
│  [📋 Einladungs-Link generieren]         │
├─────────────────────────────────────────┤
│ [Abbrechen]                  [Speichern] │
└─────────────────────────────────────────┘
```

## Aufbau

| Element | PrimeNG |
|---|---|
| Filter-Panel (Freitext) | [Icon-Input](icon-input.md) |
| Table | Shared `table` |
| Panel-Container (alle 5 Panels) | `card` Panel-Block-Variante (`background: #f5f9f6`, siehe `docs/components/card/`) |
| Personendaten-/Kontakt-Felder | [Input](input.md) (Vorname mit Autofokus) |
| Verkäufer-Typ | [Select](select.md) — **nur bestehende Typen**, kein `autocomplete-create` (Feld-Mismatch: Typ braucht Provision+Gebühr, Anlegen-Modal von `autocomplete-create` hat nur ein Namensfeld) |
| Provision/Gebühr-Anzeige | [Number-Input](number-input.md) readonly |
| Nummernblock-Initialfeld | [Number-Input](number-input.md) |
| Block-Liste (Panel 04) | Bereich-Text + Zähler-Text, Löschen-[Button](button.md) (secondary outlined small), [Confirmdialog](confirmdialog.md) vor Löschung, Badge „Voll — nicht löschbar" (Shared `badge`, `type="warn"`) |
| Reservieren-Form | 2× [Number-Input](number-input.md), „✓ Reservieren"-[Button](button.md) (primary small) |
| Admin-Rechte | [Checkbox](checkbox.md) |
| Einladungs-Link | [Button](button.md) (secondary outlined small) + [Toast](toast.md) |
| Dialog-Footer | [Button](button.md) secondary outlined (Abbrechen) / primary (Speichern) |
| Erfolg/Fehler | [Toast](toast.md) „✓ Verkäufer gespeichert" / Error-InfoArea „Verkäufer konnte nicht gespeichert werden" |

## Akzeptanzkriterien

Siehe Epic_Verkaeufer AC-1 bis AC-11 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #verkaeufer #dialog #panel #select #confirmdialog #badge #toast #primeng
