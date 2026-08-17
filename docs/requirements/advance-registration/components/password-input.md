---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Password-Input

[Icon-Input](icon-input.md)-Muster, links Lock-Icon, rechts klickbares Toggle-Icon (sichtbar/verdeckt).

## Bild

```
┌─────────────────────────────┐
│ 🔒  ••••••••••••        👁  │
└─────────────────────────────┘
```

## Aufbau

`p-iconfield` → linker `p-inputicon` (`pi-lock`, statisch) + `input pInputPassword [(mask)]="mask"` + rechter klickbarer `p-inputicon` (`(click)="mask = !mask"`, zeigt `pi-eye`/`pi-eye-slash`).

`pInputPassword` liefert kein automatisches Stärke-Feedback — dafür siehe [password-strength-meter.md](password-strength-meter.md).

## Verwendung

| Epic/Component | Feld | Toggle vorhanden |
|---|---|---|
| [login-form.md](login-form.md) | Passwort | ✅ |
| [registrierung-form.md](registrierung-form.md) | Passwort | ✅ |
| [registrierung-form.md](registrierung-form.md) | Passwort-Bestätigung | ❌ (gleiches Icon-Muster für visuelle Konsistenz, kein eigener Toggle nötig) |
| [profil-page.md](profil-page.md) | Aktuelles/Neues/Bestätigungs-Passwort (3×) | ✅ |

## Tags & Piles

**Tags:** #password-input #iconfield #inputpassword #primitive #shared-across-epics
