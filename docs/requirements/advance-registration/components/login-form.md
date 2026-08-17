---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: login-form

## Kontext

```
┌─────────────────────────┐
│   (heller Hintergrund)  │
│                         │
│  Anmelden               │
│  E-Mail                 │
│  [📧__________________] │  ← p-iconfield
│  Passwort                │
│  [🔒___________________👁]│ ← p-iconfield, rechts Toggle
│  [ Anmelden ]            │  ← p-button primary
│  Passwort vergessen?    │  ← Link → p-popover
│  Noch kein Konto? …     │  ← p-button text → /registrieren
└─────────────────────────┘
```

Sitzt in der rechten Spalte von `login-layout`. Container: `p-card`.

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Element | PrimeNG |
|---|---|
| Form-Container | Shared [`card`](../../../components/card/component.md) |
| E-Mail-Feld | [Input](input.md), Variante Icon (Envelope) |
| Passwort-Feld | [Input](input.md), Variante Password (mit Toggle) |
| Anmelden-Button | [Button](button.md) primary, volle Breite |
| Passwort-vergessen | `<a>`-Link, öffnet `p-popover` mit Text „Bitte wende dich an den Admin, um dein Passwort zurückzusetzen." |
| Registrierung-Link | [Button](button.md) text → `routerLink="/registrieren"` |

## Verhalten

- Enter-Taste im Passwort-Feld löst Anmelden aus (siehe Epic_Login AC-3).
- Passwort-vergessen-Popover ist reiner Hinweistext, kein Formular (siehe Epic_Login Abschnitt 8, Out-of-Scope Self-Service-Reset).

## Akzeptanzkriterien

Siehe Epic_Login AC-1 bis AC-4 — diese Datei ist die Struktur-Referenz für die Formular-Bausteine, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #login #form #iconfield #inputpassword #popover #primeng
