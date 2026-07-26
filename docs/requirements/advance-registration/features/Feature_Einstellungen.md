# Feature: Einstellungen

**App:** Voranmelde-App
**Navigation:** System → Einstellungen
**Sichtbar für:** Admin

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
