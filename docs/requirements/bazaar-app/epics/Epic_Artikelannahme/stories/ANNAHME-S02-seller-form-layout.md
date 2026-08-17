---
id: ANNAHME-S02
status: draft
depends-on: []
---

# Story: Verkäufer-Formular im Wizard Schritt 1 (Panel 01–03)

## Ziel

Das Kassenpersonal erfasst alle Verkäufer-Stammdaten in einem strukturierten Formular mit
drei Panels (Personendaten, Kontakt, Konditionen) und legt damit den Verkäufer als
Voraussetzung für Wizard Schritt 2 an.

## Kontext

Wizard Schritt 1 legt einen neuen Verkäufer an. Ohne dieses Formular kann kein Verkäufer
erstellt und kein Artikel aufgenommen werden. Am Basar-Tag steht eine Schlange dahinter —
Pflicht ist deshalb nur, was für Zuordnung und Abrechnung zwingend gebraucht wird.

Dieselbe Feldanordnung verwendet der Bearbeiten-Dialog in
[VERK-S01](../../Epic_Verkaeufer/stories/VERK-S01-seller-edit-form-layout.md); Feldnamen
und Semantik stehen in [`entities/verkaeufer.md`](../../../entities/verkaeufer.md).

## Scope

**In Scope:** Layout und Feldanordnung der Panels 01–03, Vorbelegung von
Vorname/Nachname aus der Sucheingabe, Vorausfüllen von Provision/Gebühr beim
Typ-Wechsel, Aktivierungslogik des „Weiter"-Buttons, DB-Anlage bei „Weiter".

**Out of Scope:** Wizard-Navigation (Tab-Leiste), Wizard Schritt 2, Panel 05
(Sonstiges), Suchfeld-Verhalten der Annahme-Startseite.

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
│ [Verkäufer-Typ                    100%] │
│ [Gebühr je Stück 50%] [Provision   50%] │  ← vorausgefüllt bei Typ-Wechsel (AC-6)
└─────────────────────────────────────────┘

                         [  Weiter →  ]   ← inaktiv bis AC-5
```

**Panel-Stil:** Hintergrund `#f8fafc` · Border 1 px `#dde6ee` · Radius 8 px ·
Padding 15 px 16 px · Abstand 12 px.
Panel-Titel: 11 px · 700 · uppercase · 0.8 px letter-spacing · `#4a6080` · mb 12 px.

**Form-Grid:** 2 Spalten, gap 12 px. Pflichtmarker `*` in Danger-Farbe.
Label: 11.5 px, 700, uppercase, 0.4 px letter-spacing, `--muted`.

### Felder im Detail

| Panel | Feld | Entity-Feld | Breite | Pflicht | PrimeNG-Komponente |
|---|---|---|---|---|---|
| 01 PERSONENDATEN | Vorname | `firstName` | 50 % | ✅ | `pInputText`, `pAutoFocus` |
| 01 PERSONENDATEN | Nachname | `lastName` | 50 % | ✅ | `pInputText` |
| 01 PERSONENDATEN | Anschrift | `address` | 100 % | ❌ | `pInputText` |
| 01 PERSONENDATEN | PLZ | `postalCode` | 50 % | ❌ | `pInputText` |
| 01 PERSONENDATEN | Ort | `city` | 50 % | ❌ | `pInputText` |
| 02 KONTAKT | Telefon | `phone` | 50 % | ❌ | `pInputText` |
| 02 KONTAKT | E-Mail | `email` | 50 % | ✅ | `pInputText` |
| 03 KONDITIONEN | Verkäufer-Typ | `sellerTypeId` | 100 % | ✅ | `p-select` (nur bestehende Typen) |
| 03 KONDITIONEN | Gebühr je Stück | `feePerItem` | 50 % | ❌ | `p-inputnumber` (€, 2 Dez.) |
| 03 KONDITIONEN | Provision | `salesCommission` | 50 % | ❌ | `p-inputnumber` (%, 2 Dez.) |

**Pflichtfelder insgesamt:** Vorname, Nachname, E-Mail, Verkäufer-Typ.

**„Weiter"-Button:** `p-button severity="primary"` · deaktiviert solange ein Pflichtfeld
leer ist.

`salesCommission` und `feePerItem` sind **eigene Felder des Verkäufers** — der Typ liefert
nur die Vorbelegung, maßgeblich für die Abrechnung ist der Wert am Verkäufer
([`entities/verkaeufer.md`](../../../entities/verkaeufer.md)). Genau darin unterscheidet
sich dieses Formular von dem der Voranmelde-App.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL die Felder Vorname (50 %), Nachname (50 %), Anschrift (100 %), PLZ (50 %) und Ort (50 %) in Panel 01 (PERSONENDATEN) in einem 2-Spalten-Grid anzeigen.
- [ ] **AC-2** — THE SYSTEM SHALL die Felder Telefon (50 %) und E-Mail (50 %) in Panel 02 (KONTAKT) in einem 2-Spalten-Grid anzeigen.
- [ ] **AC-3** — THE SYSTEM SHALL die Felder Verkäufer-Typ (100 %), Gebühr je Stück (50 %) und Provision (50 %) in Panel 03 (KONDITIONEN) anzeigen.
- [ ] **AC-4** — WHEN der Wizard über einen Sucheingabe-Text geöffnet wird, THEN SHALL das System den Text vor dem ersten Leerzeichen als Vorname und den Rest als Nachname vorbelegen.
- [ ] **AC-5** — WHILE mindestens eines der Pflichtfelder (Vorname, Nachname, E-Mail, Verkäufer-Typ) leer ist, SHALL das System den „Weiter"-Button deaktiviert halten.
- [ ] **AC-6** — WHEN der Nutzer einen Verkäufer-Typ wählt, THEN SHALL das System `feePerItem` und `salesCommission` mit den Werten (`itemFee`, `commissionRate`) des gewählten Typs vorausfüllen.
- [ ] **AC-7** — WHEN der Nutzer Gebühr oder Provision nach dem Vorausfüllen manuell überschreibt, THEN SHALL das System den manuell eingegebenen Wert beibehalten und beim Speichern übernehmen.
- [ ] **AC-8** — WHEN der Nutzer „Weiter" klickt und alle Pflichtfelder ausgefüllt sind, THEN SHALL das System den Verkäufer in der Datenbank anlegen und zu Wizard-Schritt 2 wechseln.
- [ ] **AC-9** — IF das Anlegen des Verkäufers fehlschlägt, THEN SHALL das System die Eingaben erhalten, eine Fehlermeldung anzeigen und auf Wizard-Schritt 1 verbleiben.
- [ ] **AC-10** — IF die E-Mail-Adresse kein gültiges Format hat, THEN SHALL das System die Meldung unter dem Feld anzeigen und nicht speichern.

## Abhängigkeiten

| Abhängigkeit | Grund |
|---|---|
| [`entities/verkaeufer.md`](../../../entities/verkaeufer.md) | Feldliste, Pflichtstatus, Override-Semantik der Konditionen |
| [`entities/verkaeufer-typ.md`](../../../entities/verkaeufer-typ.md) | Quelle der Vorbelegung |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #formular #verkäufer #layout #wizard #panel #artikelannahme
