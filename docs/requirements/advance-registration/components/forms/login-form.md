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
│  Noch kein Konto? …     │  ← p-button text → /register
└─────────────────────────┘
```

Sitzt in der rechten Spalte von `login-layout`. Container: `p-card`.

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Element | PrimeNG |
|---|---|
| Form-Container | Shared [`card`](../../../../components/card/component.md) |
| E-Mail-Feld | [Input](../../../../components/input/component.md), Variante Icon (Envelope) |
| Passwort-Feld | [Input](../../../../components/input/component.md), Variante Password (mit Toggle) |
| Anmelden-Button | [Button](../../../../components/button/component.md) primary, volle Breite |
| Passwort-vergessen | `<a>`-Link, öffnet `p-popover` mit Text „Bitte wende dich an den Admin, um dein Passwort zurückzusetzen." |
| Registrierung-Link | [Button](../../../../components/button/component.md) text → `routerLink="/register"` |

## Verhalten

- Enter-Taste im Passwort-Feld löst Anmelden aus (siehe Epic_Login AC-3).
- Passwort-vergessen-Popover ist reiner Hinweistext, kein Formular (siehe Epic_Login Abschnitt 8, Out-of-Scope Self-Service-Reset).

## Akzeptanzkriterien

Siehe [Epic_Login](../../epics/Epic_Login/epic.md) — dort die Akzeptanzkriterien zum **Anmelden**: Prüfung der Anmeldedaten, Meldung bei falschen Daten, Enter-Submit im Passwortfeld, Passwort-vergessen-Popover. Bewusst ohne AC-Nummern, weil das Epic auch Registrierung und Info-Panel abdeckt und weiter ergänzt wird. Diese Datei ist die Struktur-Referenz für die Formular-Bausteine, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #login #form #iconfield #inputpassword #popover #primeng
