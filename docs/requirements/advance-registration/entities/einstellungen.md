---
status: reviewed
reviewed-date: 2026-08-17
---

# Entity: Einstellungen

Nur in dieser App — Singleton, kein Bedarf für Historie/Mehrfachsätze. Verbindliche Quelle; Index → [overview.md](overview.md).

## Felder

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 10.0.1).

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (fix) | ✅ | Fester Wert (z. B. `"settings"`) — Singleton-Row |
| `registrationDeadline` | DateTime | ✅ | Voranmeldeschluss — Ende der Selbstregistrierungsphase |
| `dropOffFrom` | DateTime | ✅ | Start Abgabe-Zeitraum |
| `dropOffUntil` | DateTime | ✅ | Ende Abgabe-Zeitraum |
| `bazaarFrom` | DateTime | ✅ | Start Basar |
| `bazaarUntil` | DateTime | ✅ | Ende Basar |
| `defaultTypeId` | string (8 Zeichen) | ✅ | Referenz auf Verkäufer-Typ — Standard für Selbstregistrierung/Login |
| `infoText` | string (max. 4000 Zeichen) | ❌ | Markdown-Freitext, Anzeige auf Verkäufer-Home + Login-Seite |
| `startNumber` | int | ✅ | Erste Artikelnummer überhaupt |
| `blockSize` | int | ✅ | Anzahl Nummern pro Nummernblock |
| `defaultBlockCount` | int | ✅ | Standard-Anzahl Blöcke für neue Verkäufer |

**Längengrenze `infoText`:** 4000 Zeichen, als Spaltenlänge in der Datenbank **und** als
Backend-Validierung (`400`, siehe [`api/settings.md`](../api/settings.md)). Gezählt werden
Zeichen des Markdown-**Rohtexts**, nicht des gerenderten HTML. Begründung: Das Feld ist ein
Info-Kasten von wenigen Absätzen, kein Redaktionssystem; 4000 Zeichen sind rund zwei
Bildschirmseiten und damit weit über jedem realen Bedarf. Ohne Grenze wäre `infoText` ein
unbegrenzter Text in einem **öffentlichen**, uncachebaren Response
([`api/public.md`](../api/public.md)) — jeder Aufruf der Login-Seite lädt ihn vollständig.
Der Wert ist bewusst großzügig gewählt: er soll ein Versehen abfangen, nicht redaktionell
begrenzen.

**Kein Domain-Port.** Die drei Nummern-Parameter werden nicht über eine Abstraktion in
die Domäne injiziert: Der Handler lädt die Einstellungen über `ISettingsRepository` und
übergibt die Werte als Parameter an den `NumberBlockAllocator`. Damit bleibt der
Allocator ohne Mock testbar.

## Verwendung

- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — Pflege durch Admin
- [Epic_Countdown_Widget](../epics/Epic_Countdown_Widget/epic.md) — liest die 5 Termine (`/api/public/info`)
- [Epic_Login](../epics/Epic_Login/epic.md), [Epic_Home_Verkaeufer](../epics/Epic_Home_Verkaeufer/epic.md), [Epic_Home_Admin](../epics/Epic_Home_Admin/epic.md) — Countdown-Anzeige, `infoText`
- [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md), [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) — `startNumber`/`blockSize`/`defaultBlockCount`

## Tags & Piles

**Tags:** #entity #einstellungen #datenmodell #singleton
