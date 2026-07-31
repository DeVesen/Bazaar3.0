---
id: F-AR-012
status: draft
updated: 2026-07-31
---

# Feature: Einstellungen

## Index
- Überblick — Konzept
- 1. Basar-Konfiguration — Basarparameter
- 2. Nummernblock-Parameter — Blockeinstellungen
- 3. System-Einstellungen — Systemparameter
- 4. Info-Text — Freitext
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** System → Einstellungen
**Sichtbar für:** Admin

**Ziel:** Admin konfiguriert systemweite Parameter der Voranmelde-App.

**User Story:** Als Admin möchte ich systemweite Parameter konfigurieren, damit die Voranmelde-App korrekt auf den bevorstehenden Basar eingestellt ist.

---

## Überblick

Basar-Konfiguration, Info-Text und Nummernblock-Parameter.

---

## 1. Basar-Konfiguration

| Parameter | Typ | Beschreibung |
|---|---|---|
| `basarDatum` | Datum | Tag des Basars — für Countdown und Datumsanzeige |
| `abgabeVon` | Datum + Uhrzeit | Start des Abgabe-Zeitraums — Zieldatum des Countdowns |
| `abgabeBis` | Datum + Uhrzeit | Ende des Abgabe-Zeitraums |
| `defaultTypeId` | Referenz | Standard-Verkäufer-Type für Selbstregistrierung und Login-Seite |
| `infoText` | Markdown-Text | Freitext für Info-Panel (Verkäufer-Home + Login-Seite) |

**Datumsfelder:** `p-datepicker` (Datum + Uhrzeit für `abgabeVon`/`abgabeBis`).

---

## 2. Nummernblock-Parameter

| Parameter | Beschreibung |
|---|---|
| `startNumber` | Erste Artikelnummer überhaupt |
| `blockSize` | Anzahl Nummern pro Block |
| `defaultBlockCount` | Standard-Anzahl Blöcke für neue Verkäufer |

---

## 3. System-Einstellungen

| Parameter | Beschreibung | Default |
|---|---|---|
| `suchDebounceMs` | Verzögerung vor Suchanfrage | 800 ms |

---

## 4. Info-Text

`infoText` wird als Markdown-Text in einem Textarea-Feld bearbeitet.
Unterstützte Elemente: Überschriften, Fettdruck, Listen, Trennlinien, Code.
Wird angezeigt auf: Verkäufer-Home (Info-Panel) + Login-Seite (Info-Area).

---

## Akzeptanzkriterien

1. **AC-1** — WHEN ein Systemparameter geändert und gespeichert wird, THEN SHALL das System den neuen Wert in der Datenbank persistieren.
2. **AC-2** — WHEN das Basar-Datum gesetzt wird, THEN SHALL das System den Countdown auf der Home-Seite des Verkäufers aktualisieren.
3. **AC-3** — THE SYSTEM SHALL geänderte Einstellungen sofort ohne App-Neustart wirksam machen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #einstellungen #admin #konfiguration #voranmeldung #basar-datum
