---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: registrierung-form

## Kontext

```
┌─────────────────────────┐
│  (gleiche login-info-   │
│   panel wie Login)      │  ← login-layout links, gleicher Inhalt
├─────────────────────────┤
│  Registrieren            │
│  E-Mail                 │
│  [📧__________________] │  ← p-iconfield (wie login-form)
│  Passwort                │
│  [🔒___________________👁]│ ← p-iconfield + pInputPassword
│  ▓▓▓░░ Mittel            │  ← password-strength-meter
│  Passwort-Bestätigung   │
│  [🔒__________________] │  ← p-iconfield (kein Toggle nötig, oder gleiches Muster für Konsistenz)
│  [ Registrieren ]        │  ← p-button primary, disabled solange Stärke < Mittel
│  Schon ein Konto? …     │  ← p-button text → /login
└─────────────────────────┘
```

Nutzt `login-layout` als Rahmen (linke Spalte identisch mit Login), rechte Spalte ist dieses Formular statt `login-form`.

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Element | PrimeNG |
|---|---|
| Form-Container | Shared [`card`](../../../../components/card/component.md) (wie `login-form`) |
| E-Mail-Feld | [Input](../standard/input.md), Variante Icon (Envelope) |
| Passwort-Feld | [Input](../standard/input.md), Variante Password (mit Toggle) |
| Passwort-Stärke | [password-strength-meter.md](../custom/password-strength-meter.md) |
| Passwort-Bestätigung | [Input](../standard/input.md), Variante Password (ohne Toggle, gleiches Icon-Muster für visuelle Konsistenz) |
| Registrieren-Button | [Button](../standard/button.md) primary, volle Breite, `[disabled]` solange Stärke < „Mittel" oder Passwörter nicht übereinstimmen |
| „Schon ein Konto?"-Link | [Button](../standard/button.md) text → `routerLink="/login"` |

## Verhalten

- E-Mail-Duplicate-Fehler (Epic_Login AC-8) erscheint als Fehlermeldung unter dem E-Mail-Feld + Link zu Login.
- Erfolgreiche Registrierung → Auto-Login, Redirect `/home` (Epic_Login AC-9).

## Akzeptanzkriterien

Siehe [Epic_Login](../../epics/Epic_Login/epic.md) — dort die Akzeptanzkriterien zur **Registrierung**: Pflichtfelder, Passwort-Stärke, Passwort-Bestätigung, bereits registrierte E-Mail, automatischer Login nach Erfolg, Typ- und Blockvergabe, abgelehnte Registrierung bei fehlendem `defaultTypeId`. Bewusst ohne AC-Nummern — die alte Spanne „AC-5 bis AC-10" hatte das Kriterium zum fehlenden `defaultTypeId` bereits nicht mehr erfasst. Diese Datei ist die Struktur-Referenz für die Formular-Bausteine, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #registrierung #form #iconfield #inputpassword #strength-meter #primeng
