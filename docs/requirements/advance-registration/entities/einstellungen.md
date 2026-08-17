---
status: reviewed
reviewed-date: 2026-08-14
---

# Entity: Einstellungen

Nur Voranmelde-App (☁️) — Singleton, kein Bedarf für Historie/Mehrfachsätze. Kanonische Quelle: [entities.md](../../entities.md).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (fix) | ✅ | Fester Wert (z. B. `"settings"`) — Singleton-Row |
| `voranmeldeschluss` | DateTime | ✅ | Ende der Selbstregistrierungsphase |
| `abgabeVon` | DateTime | ✅ | Start Abgabe-Zeitraum |
| `abgabeBis` | DateTime | ✅ | Ende Abgabe-Zeitraum |
| `basarVon` | DateTime | ✅ | Start Basar |
| `basarBis` | DateTime | ✅ | Ende Basar |
| `defaultTypeId` | string (8 Zeichen) | ✅ | FK auf Verkäufer-Typ — Standard für Selbstregistrierung/Login |
| `infoText` | string | ❌ | Markdown-Freitext, Anzeige auf Verkäufer-Home + Login-Seite |
| `startNumber` | int | ✅ | Erste Artikelnummer überhaupt |
| `blockSize` | int | ✅ | Anzahl Nummern pro Nummernblock |
| `defaultBlockCount` | int | ✅ | Standard-Anzahl Blöcke für neue Verkäufer |

## Verwendung

- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — Pflege durch Admin
- [Epic_Countdown_Widget](../epics/Epic_Countdown_Widget/epic.md) — liest die 5 Termine (`/api/public/info`)
- [Epic_Login](../epics/Epic_Login/epic.md), [Epic_Home_Verkaeufer](../epics/Epic_Home_Verkaeufer/epic.md), [Epic_Home_Admin](../epics/Epic_Home_Admin/epic.md) — Countdown-Anzeige, `infoText`
- [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md), [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) — `startNumber`/`blockSize`/`defaultBlockCount`

## Tags & Piles

**Tags:** #entity #einstellungen #datenmodell #singleton
