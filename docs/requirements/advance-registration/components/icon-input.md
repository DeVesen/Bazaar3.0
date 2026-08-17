---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Icon-Input

[Input](input.md), erweitert um ein Icon links (z. B. Suche, E-Mail) via `p-iconfield`/`p-inputicon`.

## Bild

```
┌─────────────────────────────┐
│ 🔍  Suche...                │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ✉  max@example.com          │
└─────────────────────────────┘
```

## Aufbau

`p-iconfield` → `p-inputicon` (links, Icon) + `input pInputText` (Feld).

## Verwendung

| Epic/Component | Feld | Icon |
|---|---|---|
| [filter-panel.md](filter-panel.md) | Freitext-Suche | `pi-search` |
| [login-form.md](login-form.md) | E-Mail | `pi-envelope` |
| [registrierung-form.md](registrierung-form.md) | E-Mail | `pi-envelope` |
| [profil-page.md](profil-page.md) | Neue E-Mail | `pi-envelope` |
| [verkaeufer-dialog.md](verkaeufer-dialog.md) | Filter-Panel Freitext | `pi-search` |

Passwort-Variante (Icon links + Toggle-Icon rechts) → siehe [password-input.md](password-input.md).

## Tags & Piles

**Tags:** #icon-input #iconfield #inputicon #primitive #shared-across-epics
