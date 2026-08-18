---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Entity: Einstellungen

Haupt-App-Sicht. Verbindliche Quelle für diese App; Index → [overview.md](overview.md).

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 7.0.1).

## Felder

Eine einzelne Zeile — es gibt genau einen Einstellungssatz pro Installation.

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `scannerPauseMs` | int | ✅ | Anzeigedauer des Scan-Ergebnisses im Inline-Kamera-Modus, Default `3000` |

## Warum serverseitig

Der Wert beschreibt eine Einstellung **des Basars**, nicht eine Vorliebe eines Geräts. Läge er
im `localStorage`, würde der Admin ihn an seinem Rechner setzen, während die Kassen-Tablets
ihren Default behalten — „systemweiter Parameter" wäre dann eine Behauptung. Das Frontend
liest ihn beim Start und hält ihn im Speicher.

Der `localStorage` bleibt dem JWT vorbehalten ([Epic_App_Shell](../epics/Epic_App_Shell/epic.md),
BSHELL-S05) — dort gehört Gerätezustand hin.

## Was hier bewusst nicht steht

**`suchDebounceMs`.** Eine Debounce-Zeit für Suchfelder ist eine Frontend-Tuning-Konstante
ohne fachlichen Anlass und steht fest im Code. Die Voranmelde-App hat denselben Parameter aus
demselben Grund aus ihren Einstellungen entfernt.

**Basar-Termine.** Die fünf Termine der Countdown-Sequenz (`registrationDeadline`,
`dropOffFrom`, …) gehören zur Voranmelde-App: Sie steuern dort Countdown und
Registrierungsschluss. Die Haupt-App läuft am Basar-Tag selbst und hat keinen Countdown.

**Nummernblock-Parameter.** `startNumber`, `blockSize` und `defaultBlockCount` existieren nur
in der Voranmelde-App. Diese App vergibt keine Nummern, sie prüft sie
([Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) Abschnitt 3).

## Verwendung

- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — Pflege
- [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) — Kamera-Modus liest `scannerPauseMs`
- [Scan-Dialog](../../../components/scan-dialog/component.md) — Freigabe-Scan liest `scannerPauseMs` (`pauseMs`-Default)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #entity #einstellungen #datenmodell #konfiguration
