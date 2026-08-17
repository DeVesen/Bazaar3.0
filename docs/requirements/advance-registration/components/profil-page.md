---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: profil-page (alle 3 Tabs)

Größtenteils Wiederverwendung bereits etablierter Bausteine (Panel-Muster aus Epic_Verkaeufer, Passwort-Felder aus Epic_Login, Löschen-Bestätigung analog Epic_Meine_Artikel).

## Kontext (volle Seite)

```
[ Steckbrief | Zugangsdaten | Löschen ]   ← p-tabs

Tab „Steckbrief":
┌─────────────────────────────────────────┐
│ PERSONENDATEN                            │
│  [Vorname 50%] [Nachname 50%]            │
│  [Anschrift 100%]                        │
│  [PLZ 50%] [Ort 50%]                     │
├─────────────────────────────────────────┤
│ KONTAKT                                  │
│  [Telefon 50%] [E-Mail 50%, readonly]    │
├─────────────────────────────────────────┤
│ KONDITIONEN (alles readonly)             │
│  Verkäufer-Typ [p-select disabled]       │
│  Gebühr/Provision (readonly)             │
├─────────────────────────────────────────┤
│                            [Speichern]   │
└─────────────────────────────────────────┘

Tab „Zugangsdaten":
┌─────────────────────────────────────────┐
│ E-Mail ändern                            │
│  [📧 neue E-Mail___________]             │
│  [🔒 aktuelles Passwort_____]            │
│                            [Speichern]   │
├─────────────────────────────────────────┤
│ Passwort ändern                          │
│  [🔒 aktuelles Passwort_____]            │
│  [🔒 neues Passwort________👁]           │
│  ▓▓▓░░ Mittel                            │  ← password-strength-meter (aus Epic_Login)
│  [🔒 Bestätigung___________]             │
│                            [Speichern]   │
└─────────────────────────────────────────┘

Tab „Löschen":
┌─────────────────────────────────────────┐
│  [ Account löschen ]  ← p-button danger  │
└─────────────────────────────────────────┘
Klick → p-confirmdialog „Möchten Sie Ihren Account wirklich löschen?"
```

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Element | PrimeNG |
|---|---|
| Tab-Navigation | `p-tabs` |
| Panel-Container (alle Panels) | `card` Panel-Block-Variante (wie Epic_Verkaeufer) |
| Personendaten-/Kontakt-Felder | [Input](input.md), Variante Text, E-Mail readonly |
| Verkäufer-Typ | [Select](select.md), Variante Dropdown, `[disabled]="true"` |
| Gebühr/Provision | [Input](input.md), Variante Number, readonly |
| E-Mail ändern | [Input](input.md) Variante Icon (neue E-Mail) + Variante Password (aktuelles Passwort) |
| Passwort ändern | 3× [Input](input.md) Variante Password (aktuell/neu/Bestätigung) + [password-strength-meter.md](password-strength-meter.md) |
| Account löschen | [Button](button.md) danger → [Confirmdialog](confirmdialog.md) |

## Akzeptanzkriterien

Siehe Epic_Profil AC-1 bis AC-8 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #profil #tabs #panel #iconfield #inputpassword #confirmdialog #primeng
