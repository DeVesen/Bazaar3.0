---
id: VERK-S01
status: draft
depends-on: []
---

# Story: Verkäufer-Formular im Bearbeiten-Dialog (Panel 01–03)

## Ziel
Der Admin bearbeitet Stammdaten eines Verkäufers in einem strukturierten Dialog mit drei Panels (Personendaten, Kontakt, Konditionen) und persistiert die Änderungen per „Speichern".

## Kontext
Der Bearbeiten-Dialog wird über den Edit-Button in der Verkäufer-Karte geöffnet. Die Feldanordnung ist identisch mit Wizard Schritt 1 (Lastenheft Abschnitt 6.5, siehe auch ANNAHME-S02) und ermöglicht es dem Admin, Stammdaten nachträglich zu korrigieren. Die eigenen Felder des Verkäufers (Gebühr, Provision) bleiben maßgeblich für alle Berechnungen — unabhängig vom aktuellen Type.

## Scope
**In Scope:** Layout und Feldanordnung der Panels 01–03 (Personendaten, Kontakt, Konditionen), Vorausfüllen aller Felder mit den gespeicherten Verkäuferdaten, Vorausfüllen von Gebühr/Provision bei Type-Wechsel, Footer-Aktionen (Abbrechen / Speichern), Feldvalidierung.
**Out of Scope:** Panel 05 (Sonstiges / Admin-Rechte — nicht relevant in der Haupt-App), Artikel-Freigeben-Dialog, Verkäufer-Karte selbst, Anlegen eines neuen Verkäufers.

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
│ │ [Verkäufer-Type                     100%] │   │
│ │ [Gebühr j.St. 50%] [Provision        50%] │   │  ← vorausgefüllt bei Type-Wechsel (AC-5)
│ └───────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│                      [Abbrechen] [Speichern]     │
└─────────────────────────────────────────────────┘
```

**Dialog-Größe:** Desktop ≥ 768 px: 80 % Breite / 90 % Höhe. Mobile < 768 px: 100 % Breite / 100 % Höhe, kein border-radius.

**Panel-Stil:** Hintergrund `#f8fafc` · Border 1 px `#dde6ee` · Radius 8 px · Padding 15 px 16 px · Abstand 12 px.
Panel-Titel: 11 px · 700 · uppercase · 0.8 px letter-spacing · `#4a6080` · mb 12 px.

**Form-Grid:** 2 Spalten, gap 12 px. Pflichtmarker `*` in Danger-Farbe.
Label: 11.5 px, 700, uppercase, 0.4 px letter-spacing, `--muted`.

### Felder im Detail

| Panel | Feld | Breite | Pflicht | PrimeNG-Komponente |
|---|---|---|---|---|
| 01 PERSONENDATEN | Vorname | 50 % | ✅ | `pInputText` |
| 01 PERSONENDATEN | Nachname | 50 % | ✅ | `pInputText` |
| 01 PERSONENDATEN | Anschrift | 100 % | ❌ | `pInputText` |
| 01 PERSONENDATEN | PLZ | 50 % | ❌ | `pInputText` |
| 01 PERSONENDATEN | Ort | 50 % | ❌ | `pInputText` |
| 02 KONTAKT | Telefon | 50 % | ❌ | `pInputText` |
| 02 KONTAKT | E-Mail | 50 % | ✅ | `pInputText` |
| 03 KONDITIONEN | Verkäufer-Type | 100 % | ✅ | `p-select` |
| 03 KONDITIONEN | Gebühr je Stück | 50 % | ❌ | `p-inputnumber` (€, 2 Dez.) |
| 03 KONDITIONEN | Provision | 50 % | ❌ | `p-inputnumber` (%, 2 Dez.) |

**Pflichtfelder insgesamt:** Vorname, Nachname, E-Mail, Verkäufer-Type.

**Footer:** Standard-Muster — `[Abbrechen (secondary outlined)]` `[Speichern (primary)]`.

## Akzeptanzkriterien
- [ ] **AC-1** — WHEN der Admin den Bearbeiten-Dialog öffnet, THEN SHALL das System alle Felder der Panels 01–03 mit den gespeicherten Verkäuferdaten vorausfüllen.
- [ ] **AC-2** — THE SYSTEM SHALL die Felder Vorname (50 %), Nachname (50 %), Anschrift (100 %), PLZ (50 %) und Ort (50 %) in Panel 01 (PERSONENDATEN) in einem 2-Spalten-Grid anzeigen.
- [ ] **AC-3** — THE SYSTEM SHALL die Felder Telefon (50 %) und E-Mail (50 %) in Panel 02 (KONTAKT) in einem 2-Spalten-Grid anzeigen.
- [ ] **AC-4** — THE SYSTEM SHALL die Felder Verkäufer-Type (100 %), Gebühr je Stück (50 %) und Provision (50 %) in Panel 03 (KONDITIONEN) anzeigen.
- [ ] **AC-5** — WHEN der Admin einen anderen Verkäufer-Type wählt, THEN SHALL das System die Felder Gebühr je Stück und Provision mit den Standardwerten des neu gewählten Types vorausfüllen.
- [ ] **AC-6** — WHEN der Admin Gebühr oder Provision nach dem Vorausfüllen manuell ändert, THEN SHALL das System den manuell eingegebenen Wert beibehalten und nicht zurücksetzen.
- [ ] **AC-7** — IF beim Speichern ein Pflichtfeld (Vorname, Nachname, E-Mail, Verkäufer-Type) leer ist, THEN SHALL das System eine Inline-Fehlermeldung unter dem jeweiligen Feld anzeigen und nicht speichern.
- [ ] **AC-8** — WHEN der Admin „Speichern" klickt und alle Pflichtfelder ausgefüllt sind, THEN SHALL das System die Änderungen in der Datenbank persistieren, den Dialog schließen und einen Toast „Verkäufer gespeichert" einblenden.
- [ ] **AC-9** — WHEN der Admin „Abbrechen" klickt, THEN SHALL das System den Dialog schließen und alle ungespeicherten Änderungen verwerfen.

## Tags & Piles
**Tags:** #formular #verkäufer #layout #bearbeiten #dialog #panel
