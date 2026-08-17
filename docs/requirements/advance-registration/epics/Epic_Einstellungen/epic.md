---
id: F-AR-012
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Einstellungen

## Index
- Überblick — Konzept
- 1. Basar-Konfiguration — Basarparameter
- 2. Nummernblock-Parameter — Blockeinstellungen
- 3. Info-Text — Freitext
- 4. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** System → Einstellungen
**Sichtbar für:** Admin

Component-Details → [`components/forms/einstellungen-form.md`](../../components/forms/einstellungen-form.md)
Entity-Details → [`entities/einstellungen.md`](../../entities/einstellungen.md)

**Ziel:** Admin konfiguriert systemweite Parameter der Voranmelde-App.

**User Story:** Als Admin möchte ich systemweite Parameter konfigurieren, damit die Voranmelde-App korrekt auf den bevorstehenden Basar eingestellt ist.

---

## Überblick

Basar-Konfiguration, Info-Text und Nummernblock-Parameter.

---

## 1. Basar-Konfiguration

5 Termine für die Countdown-Sequence (siehe Epic_Countdown_Widget), in dieser Reihenfolge:

| Parameter | Typ | Beschreibung |
|---|---|---|
| `registrationDeadline` | Datum + Uhrzeit | Voranmeldeschluss — Ende der Selbstregistrierungs-/Erfassungsphase |
| `dropOffFrom` | Datum + Uhrzeit | Start des Abgabe-Zeitraums |
| `dropOffUntil` | Datum + Uhrzeit | Ende des Abgabe-Zeitraums |
| `bazaarFrom` | Datum + Uhrzeit | Start des Basars (Verkauf/Rückgabe) |
| `bazaarUntil` | Datum + Uhrzeit | Ende des Basars (Verkauf/Rückgabe) |
| `defaultTypeId` | Referenz | Standard-Verkäufer-Type für Selbstregistrierung und Login-Seite |
| `infoText` | Markdown-Text | Freitext für Info-Panel (Verkäufer-Home + Login-Seite) |

**Datumsfelder:** `p-datepicker` (Datum + Uhrzeit) für alle 5 Termine.

---

## 2. Nummernblock-Parameter

| Parameter | Beschreibung |
|---|---|
| `startNumber` | Erste Artikelnummer überhaupt |
| `blockSize` | Anzahl Nummern pro Block |
| `defaultBlockCount` | Standard-Anzahl Blöcke für neue Verkäufer |

---

## 3. Info-Text

`infoText` wird als Markdown-Text in einem Textarea-Feld bearbeitet.
Unterstützte Elemente: Überschriften, Fettdruck, Listen, Trennlinien, Code.
Wird angezeigt auf: Verkäufer-Home (Info-Panel) + Login-Seite (Info-Area).

**Hinweis:** `suchDebounceMs` wurde aus den Admin-Einstellungen entfernt — reine Frontend-Tuning-Konstante ohne Business-Bedarf, jetzt fest im Code (YAGNI, kein Admin-UI-Feld nötig).

---

## 4. Backend & API

API-Details → [`api/settings.md`](../../api/settings.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/settings` | `admin` | Alle Einstellungen (Abschnitt 1+2+3). |
| `PUT /api/settings` | `admin` | **Vollersetzung** aller Felder, sofort wirksam. `400` bei nicht aufsteigenden Terminen oder unbekanntem `defaultTypeId`; `409`, wenn `startNumber` über einer bereits vergebenen Artikelnummer läge. |

**Änderung der Nummernblock-Parameter:** `blockSize` und `startNumber` wirken nur auf **künftige** Vergaben — bestehende Blöcke behalten ihre Grenzen, weil `toNumber` persistiert ist. Nach einer `blockSize`-Änderung existieren Blöcke unterschiedlicher Größe nebeneinander; das Formular weist per Hinweistext darauf hin.

**Cross-Ref:** `GET /api/public/info` (siehe Epic_Countdown_Widget, ohne Auth) liest dieselben 5 Termine aus dieser Konfiguration — keine Duplizierung der Werte.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN ein Systemparameter geändert und gespeichert wird, THEN SHALL das System den neuen Wert in der Datenbank persistieren.
2. **AC-2** — WHEN einer der 5 Basar-Termine gesetzt wird, THEN SHALL das System den Countdown auf allen Verbraucherseiten (Login, Home_Verkaeufer, Home_Admin, Countdown-Embed-Widget) beim nächsten Laden aktualisiert anzeigen.
3. **AC-3** — THE SYSTEM SHALL geänderte Einstellungen sofort ohne App-Neustart wirksam machen.
4. **AC-4** — IF die gesetzten Basar-Termine nicht in aufsteigender Reihenfolge stehen (`registrationDeadline` ≤ `dropOffFrom` ≤ `dropOffUntil` ≤ `bazaarFrom` ≤ `bazaarUntil`), THEN SHALL das System das Speichern ablehnen und die betroffenen Felder markieren. Nicht gesetzte Termine werden bei der Prüfung übersprungen.
5. **AC-5** — WHEN `blockSize` geändert wird, THEN SHALL das System bestehende Nummernblöcke unverändert lassen und die neue Größe nur auf künftig angelegte Blöcke anwenden.
6. **AC-6** — IF eine neue `startNumber` über einer bereits vergebenen Artikelnummer läge, THEN SHALL das System die Meldung „Startnummer liegt über bereits vergebenen Artikelnummern" anzeigen und nicht speichern.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #einstellungen #admin #konfiguration #voranmeldung #basar-datum
