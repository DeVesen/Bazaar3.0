---
id: ANNAHME-S02
status: draft
depends-on: []
---

# Story: Verkäufer-Formular im Wizard Schritt 1 (Panel 01–03)

## Ziel
Das Kassenpersonal erfasst alle Verkäufer-Stammdaten in einem strukturierten Formular mit drei Panels (Personendaten, Kontakt, Konditionen) und legt damit den Verkäufer als Voraussetzung für Wizard Schritt 2 an.

## Kontext
Wizard Schritt 1 legt einen neuen Verkäufer an. Ohne dieses Formular kann kein Verkäufer erstellt und kein Artikel aufgenommen werden. Die Feldanordnung folgt dem globalen Standard aus Lastenheft Abschnitt 6.5 und ist identisch mit dem Bearbeiten-Dialog im Feature Verkäufer (VERK-S01).

## Scope
**In Scope:** Layout und Feldanordnung der Panels 01–03 (Personendaten, Kontakt, Konditionen), Vorname/Nachname-Vorbelegung aus der Sucheingabe, Vorausfüllen von Gebühr/Provision bei Type-Wechsel, Aktivierungs­logik des „Weiter"-Buttons, DB-Anlage bei „Weiter".
**Out of Scope:** Wizard-Navigation (Tab-Leiste), Wizard Schritt 2 (Artikelannahme), Panel 05 (Sonstiges), Suchfeld-Verhalten auf der Annahme-Startseite.

## UI-Spezifikation

```
┌─ PERSONENDATEN ─────────────────────────┐
│ [Vorname *      50%] [Nachname *    50%] │
│ [Anschrift                        100%] │
│ [PLZ            50%] [Ort           50%] │
└─────────────────────────────────────────┘

┌─ KONTAKT ───────────────────────────────┐
│ [Telefon        50%] [E-Mail *      50%] │
└─────────────────────────────────────────┘

┌─ KONDITIONEN ───────────────────────────┐
│ [Verkäufer-Type                   100%] │
│ [Gebühr je Stück 50%] [Provision   50%] │  ← vorausgefüllt bei Type-Wechsel (AC-6)
└─────────────────────────────────────────┘

                         [  Weiter →  ]   ← inaktiv bis AC-5
```

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

**„Weiter"-Button:** `p-button severity="primary"` · deaktiviert solange ein Pflichtfeld leer ist.

## Akzeptanzkriterien
- [ ] **AC-1** — THE SYSTEM SHALL die Felder Vorname (50 %), Nachname (50 %), Anschrift (100 %), PLZ (50 %) und Ort (50 %) in Panel 01 (PERSONENDATEN) in einem 2-Spalten-Grid anzeigen.
- [ ] **AC-2** — THE SYSTEM SHALL die Felder Telefon (50 %) und E-Mail (50 %) in Panel 02 (KONTAKT) in einem 2-Spalten-Grid anzeigen.
- [ ] **AC-3** — THE SYSTEM SHALL die Felder Verkäufer-Type (100 %), Gebühr je Stück (50 %) und Provision (50 %) in Panel 03 (KONDITIONEN) anzeigen.
- [ ] **AC-4** — WHEN der Wizard über einen Sucheingabe-Text geöffnet wird, THEN SHALL das System den Text vor dem ersten Leerzeichen als Vorname und den Rest als Nachname in die entsprechenden Felder vorbelegen.
- [ ] **AC-5** — WHILE mindestens eines der Pflichtfelder (Vorname, Nachname, E-Mail, Verkäufer-Type) leer ist, SHALL das System den „Weiter"-Button deaktiviert halten.
- [ ] **AC-6** — WHEN der Nutzer einen Verkäufer-Type wählt, THEN SHALL das System die Felder Gebühr je Stück und Provision mit den Standardwerten des gewählten Types vorausfüllen.
- [ ] **AC-7** — WHEN der Nutzer Gebühr oder Provision nach dem Vorausfüllen manuell überschreibt, THEN SHALL das System den manuell eingegebenen Wert beibehalten.
- [ ] **AC-8** — WHEN der Nutzer „Weiter" klickt und alle Pflichtfelder ausgefüllt sind, THEN SHALL das System den Verkäufer in der Datenbank anlegen und zu Wizard-Schritt 2 wechseln.
- [ ] **AC-9** — IF das Anlegen des Verkäufers fehlschlägt, THEN SHALL das System eine Fehlermeldung anzeigen und auf Wizard-Schritt 1 verbleiben.

## Tags & Piles
**Tags:** #formular #verkäufer #layout #wizard #panel #artikelannahme
