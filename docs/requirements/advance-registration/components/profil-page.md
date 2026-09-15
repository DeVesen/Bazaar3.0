---
status: draft
reviewed-date: 2026-08-14
---

# Component: profil-page (alle 3 Tabs)

Größtenteils Wiederverwendung bereits etablierter Bausteine (Panel-Muster aus Epic_Verkaeufer, Passwort-Felder aus Epic_Login, Löschen-Bestätigung analog Epic_Meine_Artikel).

## Kontext (volle Seite)

```
[ Steckbrief | Zugangsdaten | Löschen ]   ← p-tabs

Tab „Steckbrief" (≥ Tablet, Details → [verkaeufer-nummer.md](verkaeufer-nummer.md)):
┌─────────────────────────────────────────┐
│ MEINE VERKÄUFERNUMMER (readonly)         │
│  a3f9c2d1              ┌──────────┐      │
│  [⧉ Kopieren]          │ QR-Code  │      │
│  Hinweistext            └──────────┘      │
├─────────────────────────────────────────┤
│ PERSONENDATEN                            │
│  [Vorname 50%] [Nachname 50%]            │
│  [Anschrift 100%]                        │
│  [PLZ 50%] [Ort 50%]                     │
├─────────────────────────────────────────┤
│ KONTAKT                                  │
│  [Telefon 50%] [E-Mail 50%, readonly]    │
├─────────────────────────────────────────┤
│ KONDITIONEN (alles readonly)             │
│  [Verkäufer-Typ 50%, p-select disabled]  │  ← rechte Spalte bewusst leer
│  [Gebühr 50%] [Provision 50%] (readonly) │
├─────────────────────────────────────────┤
│                            [Speichern]   │
└─────────────────────────────────────────┘

Alle Felder füllen ihre Spaltenbreite (50%/100%) tatsächlich aus — `<p-fluid>`,
siehe [card.md](../../../components/card/component.md) Abschnitt 4. Grid kollabiert
auf 1 Spalte ≤ 1024 px (Tablet), Verkäufernummer-Panel stapelt dann zusätzlich
Nummer/Hinweis und QR-Code übereinander.

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

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](../../../components/form/component.md).

| Element | PrimeNG |
|---|---|
| Tab-Navigation | `p-tabs` |
| Panel-Container (alle Panels) | `card` Panel-Block-Variante (wie Epic_Verkaeufer) |
| Verkäufernummer-Panel | [verkaeufer-nummer](verkaeufer-nummer.md), Variante `card`, `sellerId` = `id` aus `GET /api/profile` — read-only, kein Teil des Submits |
| Personendaten-/Kontakt-Felder | [Input](../../../components/input/component.md), Variante Text, E-Mail readonly |
| Verkäufer-Typ | [Select](../../../components/select/component.md), Variante Dropdown, `[disabled]="true"` |
| Gebühr/Provision | [Input](../../../components/input/component.md), Variante Number, readonly |
| E-Mail ändern | [Input](../../../components/input/component.md) Variante Icon (neue E-Mail) + Variante Password (aktuelles Passwort) |
| Passwort ändern | 3× [Input](../../../components/input/component.md) Variante Password (aktuell/neu/Bestätigung) + [password-strength-meter.md](password-strength-meter.md) |
| Account löschen | [Button](../../../components/button/component.md) danger → [Confirmdialog](../../../components/confirmdialog/component.md) |

Tab „Zugangsdaten" — die beiden Panel-Blöcke „E-Mail ändern" und „Passwort ändern" stehen
nebeneinander (2-Spalten-Grid) und werden auf gleiche Höhe gestreckt; der jeweilige
Speichern-Button sitzt per `margin-top: auto` am Panel-Ende mit Gap zum Inhalt darüber, unabhängig
davon, welches Panel mehr Felder zeigt.

## Akzeptanzkriterien

Siehe [Epic_Profil](../epics/Epic_Profil/epic.md) — **alle** dortigen Akzeptanzkriterien; diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #profil #tabs #panel #iconfield #inputpassword #confirmdialog #primeng
