---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: typ-popup (Anlegen + Bearbeiten)

Reine Instanziierung — keine neuen PrimeNG-Entscheidungen. Gleiches Popup für Anlegen und Bearbeiten (Bearbeiten: Felder vorausgefüllt).

**Verwendung:** beide Apps, mit identischen drei Feldern:

| App | Epic | Besonderheit |
|---|---|---|
| Voranmelde-App | [Epic_Verkaeufer_Typen](../../requirements/advance-registration/epics/Epic_Verkaeufer_Typen/epic.md) | Änderungen wirken **sofort live** auf alle zugewiesenen Verkäufer — es gibt dort kein Snapshot-Feld |
| Haupt-App | [Epic_Verkaeufer_Typen](../../requirements/bazaar-app/epics/Epic_Verkaeufer_Typen/epic.md) | Änderungen wirken **nicht rückwirkend** — Verkäufer tragen eigene Konditionsfelder |

Der Unterschied betrifft nicht das Popup selbst, sondern die Wirkung des Speicherns. In der Haupt-App gehört deshalb ein Hinweis in den Dialog, dass bestehende Verkäufer unberührt bleiben — sonst erwartet der Admin dieselbe Live-Wirkung wie in der anderen App.

**Wertebereiche** werden in beiden Apps serverseitig geprüft: Provision 0–100, Gebühr nicht negativ.

## Kontext

```
┌─────────────────────────┐
│  Neuer Verkäufer-Typ [✕]│  ← Modal sm
├─────────────────────────┤
│  Name                    │
│  [_____________]        │
│  Provision (%)           │
│  [_____________]        │
│  Gebühr (€)              │
│  [_____________]        │
├─────────────────────────┤
│  [Abbrechen] [Speichern] │
└─────────────────────────┘
```

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](../form/component.md).

| Feld | PrimeNG |
|---|---|
| Name | [Input](../input/component.md), Variante Text |
| Provision (%) | [InputNumber](../inputnumber/component.md), Variante Prozent |
| Gebühr (€) | [InputNumber](../inputnumber/component.md), Variante Geld |
| Footer | [Button](../button/component.md) secondary outlined (Abbrechen) / primary (Speichern) |
| Save-Feedback | [Toast](../toast/component.md) „✓ Verkäufer-Typ gespeichert" |

## Akzeptanzkriterien

Siehe [Epic_Verkaeufer_Typen](../../requirements/advance-registration/epics/Epic_Verkaeufer_Typen/epic.md) — **alle** dortigen Akzeptanzkriterien; diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #verkaeufer-typen #popup #modal #primeng
