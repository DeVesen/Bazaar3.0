---
id: VERK-S01
status: draft
depends-on: [ANNAHME-S02]
---

# Story: Verkäufer-Formular im Bearbeiten-Dialog (Panel 01–03)

## Ziel

Der Admin bearbeitet Stammdaten eines Verkäufers in einem strukturierten Dialog mit drei
Panels (Personendaten, Kontakt, Konditionen) und persistiert die Änderungen per
„Speichern".

## Kontext

Der Dialog wird über den Edit-Button der Verkäufer-Karte geöffnet. Feldanordnung und
Pflichtfelder sind identisch mit Wizard Schritt 1
([ANNAHME-S02](../../Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md)) —
zwei Layouts für dasselbe Formular wären genau das Duplikat, das später auseinanderläuft.

Die eigenen Felder des Verkäufers (`salesCommission`, `feePerItem`) bleiben maßgeblich für
alle Berechnungen, unabhängig vom aktuellen Typ
([`entities/verkaeufer.md`](../../../entities/verkaeufer.md)).

## Scope

**In Scope:** Vorbelegung aller Felder aus dem gespeicherten Datensatz, Vorausfüllen von
Provision/Gebühr beim Typ-Wechsel, Panel 05 in der Haupt-App-Ausprägung, Footer-Aktionen,
Feldvalidierung, Dialog-Größe.

**Out of Scope:** Feldliste und Panel-Layout (→ ANNAHME-S02), Verkäufer-Karte und
Filter-Panel (Epic Abschnitte 1–3), Artikel-Freigeben-Dialog (Epic Abschnitt 5), Anlegen
eines neuen Verkäufers.

## UI-Spezifikation

```
┌─ Dialog (80% / max 700px) ──────────────────────┐
│  Verkäufer bearbeiten                       [✕]  │
├─────────────────────────────────────────────────┤
│ ┌─ PERSONENDATEN ───────────────────────────┐   │
│ │ [Vorname *    50%] [Nachname *        50%] │   │
│ │ [Anschrift                          100%] │   │
│ │ [PLZ          50%] [Ort               50%] │   │
│ └───────────────────────────────────────────┘   │
│ ┌─ KONTAKT ─────────────────────────────────┐   │
│ │ [Telefon      50%] [E-Mail *          50%] │   │
│ └───────────────────────────────────────────┘   │
│ ┌─ KONDITIONEN ─────────────────────────────┐   │
│ │ [Verkäufer-Typ                      100%] │   │
│ │ [Gebühr j.St. 50%] [Provision        50%] │   │  ← vorausgefüllt bei Typ-Wechsel (AC-5)
│ └───────────────────────────────────────────┘   │
│ ┌─ SONSTIGES ───────────────────────────────┐   │
│ │ Abgerechnet am: 06.10.2026 14:22          │   │
│ │                        [ Zurücksetzen ]   │   │  ← AC-10
│ └───────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│                      [Abbrechen] [Speichern]     │
└─────────────────────────────────────────────────┘
```

**Dialog-Größe:** Desktop ≥ 768 px: 80 % Breite / 90 % Höhe. Mobile < 768 px: 100 % / 100 %,
kein border-radius.

**Panel-Stil und Form-Grid:** identisch zu ANNAHME-S02.

**Feldliste:** identisch zu ANNAHME-S02 (dort die Tabelle mit Entity-Feldern, Breiten und
PrimeNG-Komponenten). Abweichung: `email` ist hier ebenfalls editierbar, der Admin
korrigiert damit Tippfehler.

### Panel 05 — Sonstiges (nur im Bearbeiten-Dialog)

| Element | Verhalten |
|---|---|
| Abgerechnet am | `settledAt` read-only; „Zurücksetzen" setzt das Feld auf `null`. Kein manuelles Setzen (Epic Abschnitt 3) |
| Admin-Rechte | **Entfällt in dieser App** — die Haupt-App hat kein Auth-System; das Feld existiert nur in der Voranmelde-App |
| Einladungs-Link | Entfällt in dieser App |

**Footer:** Standard-Muster — `[Abbrechen (secondary outlined)]` `[Speichern (primary)]`.

## Akzeptanzkriterien

- [ ] **AC-1** — WHEN der Admin den Bearbeiten-Dialog öffnet, THEN SHALL das System alle Felder der Panels 01–03 mit den gespeicherten Verkäuferdaten vorausfüllen.
- [ ] **AC-2** — THE SYSTEM SHALL Feldanordnung, Breiten und Pflichtfelder exakt wie in ANNAHME-S02 rendern.
- [ ] **AC-3** — THE SYSTEM SHALL `email` in diesem Dialog editierbar halten.
- [ ] **AC-4** — THE SYSTEM SHALL in dieser App **kein** Feld „Admin-Rechte" und **keinen** Einladungs-Link anzeigen.
- [ ] **AC-5** — WHEN der Admin einen anderen Verkäufer-Typ wählt, THEN SHALL das System `feePerItem` und `salesCommission` mit den Werten des neu gewählten Typs vorausfüllen.
- [ ] **AC-6** — WHEN der Admin Gebühr oder Provision nach dem Vorausfüllen manuell ändert, THEN SHALL das System den manuell eingegebenen Wert beibehalten und nicht zurücksetzen.
- [ ] **AC-7** — IF beim Speichern ein Pflichtfeld (Vorname, Nachname, E-Mail, Verkäufer-Typ) leer ist, THEN SHALL das System eine Inline-Fehlermeldung unter dem jeweiligen Feld anzeigen und nicht speichern.
- [ ] **AC-8** — WHEN der Admin „Speichern" klickt und alle Pflichtfelder ausgefüllt sind, THEN SHALL das System die Änderungen persistieren, den Dialog schließen, einen Toast „Verkäufer gespeichert" einblenden und die Verkäufer-Karte mit den neuen Werten aktualisieren.
- [ ] **AC-9** — WHEN der Admin „Abbrechen" klickt, THEN SHALL das System den Dialog schließen und alle ungespeicherten Änderungen verwerfen.
- [ ] **AC-10** — WHEN „Zurücksetzen" in Panel 05 geklickt wird, THEN SHALL das System `settledAt` auf `null` setzen und den Status-Badge der Karte neu berechnen.

## Abhängigkeiten

| Story / Dokument | Grund |
|---|---|
| [ANNAHME-S02](../../Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md) | Definiert Feldliste, Anordnung, Pflichtfelder und Vorbelegung |
| [`entities/verkaeufer.md`](../../../entities/verkaeufer.md) | `settledAt`, eigene Konditionsfelder |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #formular #verkäufer #layout #bearbeiten #dialog #panel
